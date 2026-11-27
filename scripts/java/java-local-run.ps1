#!/usr/bin/env pwsh
# =============================================================================
# java-local-run.ps1 - Maven e testes de um projeto Java no modelo do IntelliJ
#   Usa o JDK exigido pelo projeto e o Maven3 EMBUTIDO no plugin do IntelliJ,
#   chamando o classworlds Launcher direto (a mesma linha que o IDE dispara).
#   Nao usa 'mvn' do PATH nem o wrapper mvnw.
# version: 1.0.0 | lastUpdated: 2026-11-26 | infra: nord-center-infra-agent
# -----------------------------------------------------------------------------
# POR QUE
#   A maquina nao tem 'mvn' no PATH; o Maven vem no IntelliJ. O JAVA_HOME pode
#   apontar para outra versao (ex.: 21, ja pensando na SPEC-03) enquanto o
#   projeto ainda exige 11. Aqui a versao do PROJETO decide o JDK; o JAVA_HOME
#   so e usado quando bate com ela, quando o projeto nao declara versao ou com
#   -UseJavaHome.
#
# RUNTIME
#   Windows PowerShell 5.1+ ou PowerShell 7+ (pwsh), Windows, Linux ou macOS.
#   powershell -NoProfile -ExecutionPolicy Bypass -File scripts/java/java-local-run.ps1 [parametros]
#
# PARAMETROS (todos opcionais)
#   -Projeto <nome>      Repositorio irmao da infra (ex.: nord-tool-backend).
#   -ProjectDir <path>   Raiz do projeto Maven. Default: diretorio atual.
#   -Goals <string>      Goals Maven. Default: "clean verify" (o mesmo do CI).
#   -Test <filtro>       Roda so estes testes (-Dtest), ex.: "AcessoServiceImplTest"
#                        ou "AcessoServiceImplTest#deveNegar". Com -Test e sem
#                        -Goals, o goal vira "test" (sem o gate de cobertura).
#   -JdkVersion <n>      Forca a versao major do JDK (8, 11, 17, 21).
#   -JdkHome <path>      Forca um JDK especifico (ignora a deteccao).
#   -UseJavaHome         Usa o JAVA_HOME do ambiente mesmo se a versao diferir.
#   -MavenHome <path>    Forca o home do Maven (default: maven3 do IntelliJ).
#   -IdeaHome <path>     Forca o home do IntelliJ (default: procura sozinho).
#   -SkipTests           Adiciona -DskipTests.
#   -Offline             Maven offline (-o), so com o cache local.
#   -MavenArgs <string>  Argumentos extras para o Maven (ex.: "-Plocal -X").
#   -ListJdks            Lista os JDKs encontrados e sai.
#   -PrintOnly           So imprime o comando resolvido, sem executar.
#   -Help                Mostra este cabecalho.
#
# ORDEM DO JDK
#   1. -JdkHome
#   2. -UseJavaHome (JAVA_HOME do processo, do usuario ou da maquina)
#   3. versao exigida (-JdkVersion, .tool-versions, pom.xml) -> JDK com a mesma
#      versao major, preferindo o JAVA_HOME se ele bater
#   4. sem versao no projeto -> JAVA_HOME
#   Lugares procurados: JAVA_HOME, ~/.jdks, Program Files\Java, Eclipse Adoptium,
#   Amazon Corretto, Zulu, Microsoft, BellSoft, Semeru, /usr/lib/jvm,
#   ~/.sdkman/candidates/java e /Library/Java/JavaVirtualMachines.
#
# EXEMPLOS
#   scripts/java/java-local-run.ps1 -Projeto nord-tool-backend
#   scripts/java/java-local-run.ps1 -Projeto nord-tool-backend -Test AcessoServiceImplTest
#   scripts/java/java-local-run.ps1 -Projeto nord-tool-backend -Goals "compile pmd:check spotbugs:check"
#   scripts/java/java-local-run.ps1 -Projeto nord-tool-backend -JdkVersion 21 -PrintOnly
#
# CODIGOS DE SAIDA
#   0  build OK
#   2  projeto invalido (sem pom.xml)
#   3  JDK exigido nao encontrado
#   4  Maven embutido do IntelliJ nao encontrado
#   >0 codigo de saida do Maven
# =============================================================================
[CmdletBinding()]
param(
    [string]$Projeto,
    [string]$ProjectDir = (Get-Location).Path,
    [string]$Goals,
    [string]$Test,
    [string]$JdkVersion,
    [string]$JdkHome,
    [switch]$UseJavaHome,
    [string]$MavenHome,
    [string]$IdeaHome,
    [switch]$SkipTests,
    [switch]$Offline,
    [string]$MavenArgs = "",
    [switch]$ListJdks,
    [switch]$PrintOnly,
    [switch]$Help
)

$ErrorActionPreference = "Stop"
$NoWindows = ($PSVersionTable.PSVersion.Major -ge 6) -and -not $IsWindows
$JavaBin = if ($NoWindows) { "java" } else { "java.exe" }

function Show-Help { Get-Content $PSCommandPath | Where-Object { $_ -match '^#' } | ForEach-Object { $_ -replace '^# ?', '' } }
if ($Help) { Show-Help; exit 0 }

function Write-Info  ($m) { Write-Host "[java-local-run] $m" -ForegroundColor Cyan }
function Write-Ok    ($m) { Write-Host "[java-local-run] $m" -ForegroundColor Green }
function Write-Warn2 ($m) { Write-Host "[java-local-run] AVISO: $m" -ForegroundColor Yellow }
function Write-Err2  ($m) { Write-Host "[java-local-run] ERRO: $m" -ForegroundColor Red }

# ---------------------------------------------------------------------------
# JDKs instalados
# ---------------------------------------------------------------------------
function Get-JdkMajor([string]$jh) {
    if (-not $jh -or -not (Test-Path (Join-Path $jh "bin/$JavaBin"))) { return $null }
    # O arquivo 'release' traz JAVA_VERSION="21.0.12"; evita rodar java -version.
    $release = Join-Path $jh "release"
    if (Test-Path $release) {
        $line = Get-Content $release | Where-Object { $_ -match '^JAVA_VERSION=' } | Select-Object -First 1
        if ($line -match '"1\.(\d+)') { return [int]$Matches[1] }
        if ($line -match '"(\d+)') { return [int]$Matches[1] }
    }
    $saved = $ErrorActionPreference
    try {
        $ErrorActionPreference = "Continue"   # java -version escreve no stderr
        $v = & (Join-Path $jh "bin/$JavaBin") -version 2>&1 | Select-Object -First 1
        if ("$v" -match 'version "1\.(\d+)\.') { return [int]$Matches[1] }
        if ("$v" -match 'version "(\d+)') { return [int]$Matches[1] }
    } finally { $ErrorActionPreference = $saved }
    return $null
}

function Get-JavaHomeAmbiente {
    foreach ($v in @($env:JAVA_HOME, [Environment]::GetEnvironmentVariable("JAVA_HOME", "User"), [Environment]::GetEnvironmentVariable("JAVA_HOME", "Machine"))) {
        if ($v -and (Test-Path (Join-Path $v "bin/$JavaBin"))) { return (Resolve-Path -LiteralPath $v).Path }
    }
    return $null
}

function Get-Jdks {
    $raizes = @((Join-Path $HOME ".jdks"))
    foreach ($pf in @($env:ProgramFiles, ${env:ProgramFiles(x86)})) {
        if (-not $pf) { continue }
        foreach ($fornecedor in @("Java", "Eclipse Adoptium", "Amazon Corretto", "Zulu", "Microsoft", "BellSoft", "Semeru")) { $raizes += (Join-Path $pf $fornecedor) }
    }
    $raizes += @("/usr/lib/jvm", (Join-Path $HOME ".sdkman/candidates/java"), "/Library/Java/JavaVirtualMachines")
    $homes = @()
    $ambiente = Get-JavaHomeAmbiente
    if ($ambiente) { $homes += $ambiente }
    foreach ($r in $raizes) {
        if (-not (Test-Path $r)) { continue }
        foreach ($d in Get-ChildItem $r -Directory -ErrorAction SilentlyContinue | Where-Object { $_.Name -notmatch '\.intellij$' }) {
            foreach ($cand in @($d.FullName, (Join-Path $d.FullName "Contents/Home"))) {
                if (Test-Path (Join-Path $cand "bin/$JavaBin")) { $homes += $cand; break }
            }
        }
    }
    $vistos = @{}
    foreach ($h in $homes) {
        $chave = $h.TrimEnd('\', '/').ToLowerInvariant()
        if ($vistos.ContainsKey($chave)) { continue }
        $vistos[$chave] = $true
        $major = Get-JdkMajor $h
        if ($major) { [pscustomobject]@{ Major = $major; Home = $h; JavaHome = ($h -eq $ambiente) } }
    }
}

if ($ListJdks) {
    Get-Jdks | Sort-Object Major, Home | ForEach-Object { Write-Host ("  Java {0,-3} {1}{2}" -f $_.Major, $_.Home, $(if ($_.JavaHome) { "   (JAVA_HOME)" } else { "" })) }
    exit 0
}

# ---------------------------------------------------------------------------
# 1. Projeto
# ---------------------------------------------------------------------------
if ($Projeto) {
    $infraRoot = (Resolve-Path (Join-Path $PSScriptRoot "../..")).Path
    $ProjectDir = Join-Path (Split-Path $infraRoot -Parent) $Projeto
}
if (-not (Test-Path -LiteralPath $ProjectDir)) { Write-Err2 "Pasta do projeto nao existe: '$ProjectDir'."; exit 2 }
$ProjectDir = (Resolve-Path -LiteralPath $ProjectDir).Path
$pom = Join-Path $ProjectDir "pom.xml"
if (-not (Test-Path $pom)) { Write-Err2 "Nao ha pom.xml em '$ProjectDir'. Use -Projeto ou -ProjectDir com a raiz do projeto Maven."; exit 2 }
Write-Info "Projeto: $ProjectDir"

# ---------------------------------------------------------------------------
# 2. Versao de Java exigida pelo projeto
# ---------------------------------------------------------------------------
function Get-MajorFromToolVersions {
    $tv = Join-Path $ProjectDir ".tool-versions"
    if (-not (Test-Path $tv)) { return $null }
    $line = Get-Content $tv | Where-Object { $_ -match '^\s*java\s+' } | Select-Object -First 1
    if ($line -match '[-_ ]1\.(\d+)\.') { return [int]$Matches[1] }
    if ($line -match '[-_ ](\d+)(\.|\b)') { return [int]$Matches[1] }
    return $null
}
function Get-MajorFromPom {
    $content = Get-Content $pom -Raw
    foreach ($pat in @('<java\.version>\s*([0-9.]+)', '<maven\.compiler\.release>\s*([0-9.]+)', '<maven\.compiler\.target>\s*([0-9.]+)', '<maven\.compiler\.source>\s*([0-9.]+)')) {
        if ($content -match $pat) {
            $v = $Matches[1]
            if ($v -match '^1\.(\d+)$') { return [int]$Matches[1] }
            if ($v -match '^(\d+)') { return [int]$Matches[1] }
        }
    }
    return $null
}

$major = $null
if ($JdkVersion) { $major = [int]($JdkVersion -replace '^1\.', ''); Write-Info "Versao de Java forcada: $major" }
else {
    $major = Get-MajorFromToolVersions
    if ($major) { Write-Info "Versao de Java do projeto (.tool-versions): $major" }
    else {
        $major = Get-MajorFromPom
        if ($major) { Write-Info "Versao de Java do projeto (pom.xml): $major" }
    }
}

# ---------------------------------------------------------------------------
# 3. JDK
# ---------------------------------------------------------------------------
$javaHome = $null
if ($JdkHome) {
    if (-not (Test-Path (Join-Path $JdkHome "bin/$JavaBin"))) { Write-Err2 "$JavaBin nao encontrado em '$JdkHome'."; exit 3 }
    $javaHome = (Resolve-Path -LiteralPath $JdkHome).Path
    $jm = Get-JdkMajor $javaHome
    if ($major -and $jm -and $jm -ne $major) { Write-Warn2 "-JdkHome e Java $jm, mas o projeto exige Java $major. Usando o JDK forcado." }
    Write-Ok "JDK forcado: $javaHome"
} elseif ($UseJavaHome) {
    $javaHome = Get-JavaHomeAmbiente
    if (-not $javaHome) { Write-Err2 "-UseJavaHome, mas JAVA_HOME nao esta definido ou e invalido."; exit 3 }
    $jm = Get-JdkMajor $javaHome
    if ($major -and $jm -ne $major) { Write-Warn2 "JAVA_HOME e Java $jm, mas o projeto exige Java $major. Usando o JAVA_HOME (-UseJavaHome)." }
    Write-Ok "JDK do JAVA_HOME: $javaHome"
} elseif ($major) {
    $jdks = @(Get-Jdks)
    $escolhido = $jdks | Where-Object { $_.Major -eq $major } | Sort-Object @{ Expression = { $_.JavaHome }; Descending = $true }, @{ Expression = { $_.Home }; Descending = $true } | Select-Object -First 1
    if (-not $escolhido) {
        Write-Err2 "Nenhum JDK $major encontrado. O projeto exige Java $major."
        Write-Warn2 "JDKs encontrados:"
        $jdks | Sort-Object Major | ForEach-Object { Write-Host "    - Java $($_.Major): $($_.Home)" }
        Write-Warn2 "Instale um JDK $major (o IntelliJ baixa em ~/.jdks) ou use -JdkVersion/-JdkHome/-UseJavaHome."
        exit 3
    }
    $javaHome = $escolhido.Home
    $ambiente = Get-JavaHomeAmbiente
    if ($ambiente -and -not $escolhido.JavaHome) { Write-Info "JAVA_HOME do ambiente ($ambiente) e de outra versao; usando o JDK $major do projeto." }
    Write-Ok "JDK $major`: $javaHome"
} else {
    $javaHome = Get-JavaHomeAmbiente
    if (-not $javaHome) { Write-Err2 "O projeto nao declara versao de Java e nao ha JAVA_HOME. Use -JdkVersion ou -JdkHome."; exit 3 }
    Write-Info "Projeto sem versao de Java; usando o JAVA_HOME: $javaHome"
}
$javaExe = Join-Path $javaHome "bin/$JavaBin"

# ---------------------------------------------------------------------------
# 4. Maven3 embutido do IntelliJ (sem PATH, sem mvnw)
# ---------------------------------------------------------------------------
function Find-IdeaHome {
    if ($IdeaHome) {
        $r = Resolve-Path -LiteralPath $IdeaHome -ErrorAction SilentlyContinue
        if (-not $r) { Write-Err2 "IdeaHome informado nao existe: '$IdeaHome'."; exit 4 }
        return $r.Path
    }
    $bases = @()
    foreach ($pf in @($env:ProgramFiles, ${env:ProgramFiles(x86)})) { if ($pf) { $bases += (Join-Path $pf "JetBrains") } }
    if ($env:LOCALAPPDATA) { $bases += (Join-Path $env:LOCALAPPDATA "JetBrains\Toolbox\apps"); $bases += (Join-Path $env:LOCALAPPDATA "Programs") }
    $bases += @("/Applications", (Join-Path $HOME "Applications"), (Join-Path $HOME ".local/share/JetBrains/Toolbox/apps"), "/opt")
    $m2 = "plugins/maven/lib/maven3/bin/m2.conf"
    foreach ($b in $bases) {
        if (-not (Test-Path $b)) { continue }
        $cand = Get-ChildItem $b -Directory -Recurse -Depth 3 -ErrorAction SilentlyContinue |
                Where-Object { $_.Name -match 'IDEA|idea|IntelliJ' -or $_.FullName -match 'IDEA|IntelliJ' } |
                ForEach-Object { if (Test-Path (Join-Path $_.FullName $m2)) { $_.FullName } elseif (Test-Path (Join-Path $_.FullName "Contents/$m2")) { Join-Path $_.FullName "Contents" } } |
                Sort-Object -Descending | Select-Object -First 1
        if ($cand) { return $cand }
    }
    return $null
}

if ($MavenHome) {
    $mvnHome = (Resolve-Path -LiteralPath $MavenHome).Path
} else {
    $idea = Find-IdeaHome
    if (-not $idea) { Write-Err2 "IntelliJ IDEA nao localizado. Use -IdeaHome ou -MavenHome."; exit 4 }
    $mvnHome = Join-Path $idea "plugins/maven/lib/maven3"
    Write-Info "IntelliJ: $idea"
}
$m2conf = Join-Path $mvnHome "bin/m2.conf"
$classworlds = Get-ChildItem (Join-Path $mvnHome "boot") -Filter "plexus-classworlds-*.jar" -ErrorAction SilentlyContinue | Select-Object -First 1
if (-not (Test-Path $m2conf) -or -not $classworlds) { Write-Err2 "Maven3 embutido invalido em '$mvnHome' (m2.conf ou classworlds ausente)."; exit 4 }
Write-Ok "Maven embutido: $mvnHome"

# ---------------------------------------------------------------------------
# 5. Invocacao no modelo do IntelliJ
# ---------------------------------------------------------------------------
if (-not $Goals) { $Goals = if ($Test) { "test" } else { "clean verify" } }
$goalList = @($Goals -split '\s+' | Where-Object { $_ })
$extra = @("-B")
if ($Test)      { $extra += @("-Dtest=$Test", "-Dsurefire.failIfNoSpecifiedTests=false") }
if ($SkipTests) { $extra += "-DskipTests" }
if ($Offline)   { $extra += "-o" }
if ($MavenArgs) { $extra += ($MavenArgs -split '\s+' | Where-Object { $_ }) }

$jvmArgs = @(
    "-Dmaven.multiModuleProjectDirectory=$ProjectDir",
    "-Dmaven.home=$mvnHome",
    "-Dclassworlds.conf=$m2conf",
    "-Dfile.encoding=UTF-8",
    "-classpath", $classworlds.FullName,
    "org.codehaus.classworlds.Launcher"
)
$eventListener = Join-Path $mvnHome "../maven-event-listener.jar"
if (Test-Path $eventListener) { $jvmArgs = @("-Dmaven.ext.class.path=$((Resolve-Path $eventListener).Path)") + $jvmArgs }
$allArgs = $jvmArgs + @("-f", $pom) + $goalList + $extra

Write-Info "Goals: $(($goalList + $extra) -join ' ')"
if ($PrintOnly) {
    Write-Host ""
    Write-Host "JAVA_HOME=`"$javaHome`"" -ForegroundColor DarkGray
    Write-Host "`"$javaExe`" $($allArgs -join ' ')" -ForegroundColor DarkGray
    Write-Ok "PrintOnly: nada executado."
    exit 0
}

# JAVA_HOME so para este processo: o do usuario e o da maquina nao mudam.
$env:JAVA_HOME = $javaHome
Push-Location $ProjectDir
try {
    $saved = $ErrorActionPreference
    $ErrorActionPreference = "Continue"   # o Maven escreve avisos no stderr
    & $javaExe @allArgs
    $code = $LASTEXITCODE
} finally {
    $ErrorActionPreference = $saved
    Pop-Location
}
if ($code -eq 0) { Write-Ok "Build concluido com sucesso." } else { Write-Err2 "Maven terminou com codigo $code." }
exit $code
