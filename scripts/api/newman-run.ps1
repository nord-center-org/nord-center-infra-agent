#!/usr/bin/env pwsh
# =============================================================================
# newman-run.ps1 - Roda collections Postman (v2.1) com o Newman contra a API
#   do NordTool, para validar endpoints e contratos (SPEC-14 e SPEC-24).
# version: 1.0.0 | lastUpdated: 2026-11-26 | infra: nord-center-infra-agent
# -----------------------------------------------------------------------------
# COMO FUNCIONA
#   - Usa o 'newman' do PATH; se nao houver, roda 'npx --yes newman@<versao>'
#     (o npm baixa o pacote na primeira vez e guarda em cache).
#   - Monta um environment TEMPORARIO com baseUrl e token e apaga no fim. O
#     token vem de uma variavel de ambiente (default NORD_API_TOKEN), nunca de
#     arquivo versionado nem da linha de comando.
#   - Recusa URL que nao seja local ou de develop/staging/teste, salvo com
#     -PermitirRemoto: collections podem criar e apagar dados.
#
# RUNTIME
#   Windows PowerShell 5.1+ ou PowerShell 7+, com Node 18+.
#   powershell -NoProfile -ExecutionPolicy Bypass -File scripts/api/newman-run.ps1 [parametros]
#
# PARAMETROS
#   -Collection <path>     Arquivo *.postman_collection.json. Pode repetir: -Collection a.json,b.json
#   -Feature <slug>        Roda todas as collections de features/<slug>/collections/.
#   -Environment <path>    Environment Postman com as demais variaveis (sem segredos).
#   -BaseUrl <url>         Variavel {{baseUrl}}. Default: http://localhost:8081
#   -TokenEnvVar <nome>    Variavel de ambiente com o token JWT. Default: NORD_API_TOKEN.
#                          Se existir, vira a variavel {{token}} da collection.
#   -Folder <nome>         Roda so uma pasta da collection.
#   -Bail                  Para no primeiro erro.
#   -Insecure              Aceita certificado TLS invalido (ambiente local).
#   -ReportDir <path>      Grava relatorios JUnit e JSON nessa pasta.
#   -NewmanVersion <v>     Versao do npx quando nao ha newman no PATH. Default: 6
#   -PermitirRemoto        Libera URL de producao ou desconhecida.
#   -PrintOnly             So imprime o comando (com o token mascarado).
#   -Help                  Mostra este cabecalho.
#
# CONVENCAO DAS COLLECTIONS
#   Use {{baseUrl}} no inicio de toda URL e Authorization: Bearer {{token}}.
#   Nada de token, senha ou dado pessoal salvo na collection ou no environment.
#
# EXEMPLOS
#   $env:NORD_API_TOKEN = "<jwt de um usuario de teste>"
#   scripts/api/newman-run.ps1 -Feature controle-chaves
#   scripts/api/newman-run.ps1 -Collection features/sac/collections/sac.postman_collection.json -Bail
#   scripts/api/newman-run.ps1 -Feature sac -BaseUrl https://<backend-develop> -ReportDir target/newman
#
# CODIGOS DE SAIDA
#   0  todas as requisicoes e testes passaram
#   2  collection ou environment nao encontrado
#   4  Node/npx ou newman indisponivel
#   5  URL recusada (use -PermitirRemoto)
#   >0 codigo de saida do newman (falha de teste ou requisicao)
# =============================================================================
[CmdletBinding()]
param(
    [string[]]$Collection,
    [string]$Feature,
    [string]$Environment,
    [string]$BaseUrl = "http://localhost:8081",
    [string]$TokenEnvVar = "NORD_API_TOKEN",
    [string]$Folder,
    [switch]$Bail,
    [switch]$Insecure,
    [string]$ReportDir,
    [string]$NewmanVersion = "6",
    [switch]$PermitirRemoto,
    [switch]$PrintOnly,
    [switch]$Help
)

$ErrorActionPreference = "Stop"
function Show-Help { Get-Content $PSCommandPath | Where-Object { $_ -match '^#' } | ForEach-Object { $_ -replace '^# ?', '' } }
if ($Help) { Show-Help; exit 0 }

function Write-Info  ($m) { Write-Host "[newman-run] $m" -ForegroundColor Cyan }
function Write-Ok    ($m) { Write-Host "[newman-run] $m" -ForegroundColor Green }
function Write-Warn2 ($m) { Write-Host "[newman-run] AVISO: $m" -ForegroundColor Yellow }
function Write-Err2  ($m) { Write-Host "[newman-run] ERRO: $m" -ForegroundColor Red }

$infraRoot = (Resolve-Path (Join-Path $PSScriptRoot "../..")).Path

# ---------------------------------------------------------------------------
# 1. Collections
# ---------------------------------------------------------------------------
$arquivos = @()
if ($Feature) {
    $dir = Join-Path $infraRoot "features/$Feature/collections"
    if (-not (Test-Path $dir)) { Write-Err2 "Pasta de collections nao existe: features/$Feature/collections/"; exit 2 }
    $arquivos += @(Get-ChildItem $dir -Filter "*.postman_collection.json" -File | Sort-Object Name | ForEach-Object FullName)
    if ($arquivos.Count -eq 0) { Write-Err2 "Nenhum *.postman_collection.json em features/$Feature/collections/"; exit 2 }
}
foreach ($c in @($Collection | ForEach-Object { $_ -split ',' } | Where-Object { $_ })) {
    $r = Resolve-Path -LiteralPath $c -ErrorAction SilentlyContinue
    if (-not $r) { $r = Resolve-Path -LiteralPath (Join-Path $infraRoot $c) -ErrorAction SilentlyContinue }
    if (-not $r) { Write-Err2 "Collection nao encontrada: $c"; exit 2 }
    $arquivos += $r.Path
}
if ($arquivos.Count -eq 0) { Write-Err2 "Informe -Collection ou -Feature (veja -Help)."; exit 2 }

# ---------------------------------------------------------------------------
# 2. URL permitida
# ---------------------------------------------------------------------------
try { $uri = [Uri]$BaseUrl } catch { Write-Err2 "BaseUrl invalida: $BaseUrl"; exit 5 }
$hostLocal = $uri.Host -in @("localhost", "127.0.0.1", "::1", "[::1]") -or $uri.Host -like "*.localhost" -or $uri.Host -like "*.test"
$hostTeste = $uri.Host -match '(^|[.-])(develop|dev|staging|homolog|hml|test|qa|sandbox|preview)([.-]|$)'
if (-not $hostLocal -and -not $hostTeste -and -not $PermitirRemoto) {
    Write-Err2 "BaseUrl '$BaseUrl' nao e local nem de ambiente de teste. Collections podem gravar e apagar dados; use -PermitirRemoto se for de proposito."
    exit 5
}
if ($uri.Scheme -ne "https" -and -not $hostLocal) { Write-Warn2 "BaseUrl remota sem HTTPS: o token trafega aberto." }

# ---------------------------------------------------------------------------
# 3. Environment temporario (baseUrl + token + variaveis do -Environment)
# ---------------------------------------------------------------------------
$valores = [ordered]@{}
if ($Environment) {
    $envPath = Resolve-Path -LiteralPath $Environment -ErrorAction SilentlyContinue
    if (-not $envPath) { Write-Err2 "Environment nao encontrado: $Environment"; exit 2 }
    $base = Get-Content $envPath.Path -Raw -Encoding UTF8 | ConvertFrom-Json
    foreach ($v in @($base.values)) { if ($v.enabled -ne $false) { $valores[$v.key] = @{ value = "$($v.value)"; type = $(if ($v.type) { $v.type } else { "default" }) } } }
}
$valores["baseUrl"] = @{ value = $BaseUrl.TrimEnd('/'); type = "default" }
$token = [Environment]::GetEnvironmentVariable($TokenEnvVar)
if ($token) { $valores["token"] = @{ value = $token; type = "secret" } }
else { Write-Warn2 "Variavel $TokenEnvVar vazia: requisicoes autenticadas vao responder 401." }

$tmpEnv = Join-Path ([IO.Path]::GetTempPath()) ("newman-env-" + [guid]::NewGuid().ToString("N") + ".json")
$envJson = [ordered]@{
    name   = "newman-run (temporario)"
    values = @($valores.Keys | ForEach-Object { [ordered]@{ key = $_; value = $valores[$_].value; type = $valores[$_].type; enabled = $true } })
} | ConvertTo-Json -Depth 5

# ---------------------------------------------------------------------------
# 4. Newman: PATH ou npx
# ---------------------------------------------------------------------------
# No Windows, o .cmd evita a politica de execucao que pode bloquear o newman.ps1.
$newman = Get-Command newman.cmd, newman -CommandType Application, ExternalScript -ErrorAction SilentlyContinue | Select-Object -First 1
if ($newman) { $cmd = $newman.Source; $prefixo = @() }
else {
    $npx = Get-Command npx.cmd, npx -ErrorAction SilentlyContinue | Select-Object -First 1
    if (-not $npx) { Write-Err2 "Nem 'newman' nem 'npx' encontrados. Instale o Node 18+ (https://nodejs.org)."; exit 4 }
    $cmd = $npx.Source; $prefixo = @("--yes", "newman@$NewmanVersion")
}

$reporters = "cli"
$extra = @()
if ($ReportDir) {
    New-Item -ItemType Directory -Force -Path $ReportDir | Out-Null
    $reporters = "cli,junit,json"
}
if ($Folder)   { $extra += @("--folder", $Folder) }
if ($Bail)     { $extra += "--bail" }
if ($Insecure) { $extra += "--insecure" }

Write-Info "BaseUrl: $($valores['baseUrl'].value)"
Write-Info "Token: $(if ($token) { "de `$env:$TokenEnvVar (****)" } else { 'nenhum' })"
Write-Info "Newman: $(if ($newman) { $cmd } else { "npx newman@$NewmanVersion" })"

$codigoFinal = 0
try {
    if (-not $PrintOnly) { [IO.File]::WriteAllText($tmpEnv, $envJson, (New-Object System.Text.UTF8Encoding($false))) }
    foreach ($arquivo in $arquivos) {
        $nome = [IO.Path]::GetFileNameWithoutExtension($arquivo) -replace '\.postman_collection$', ''
        $relatorios = @()
        if ($ReportDir) { $relatorios = @("--reporter-junit-export", (Join-Path $ReportDir "$nome.junit.xml"), "--reporter-json-export", (Join-Path $ReportDir "$nome.json")) }
        $args2 = $prefixo + @("run", $arquivo, "-e", $tmpEnv, "-r", $reporters, "--color", "on") + $relatorios + $extra
        Write-Info "Collection: $arquivo"
        if ($PrintOnly) { Write-Host "  `"$cmd`" $($args2 -join ' ')" -ForegroundColor DarkGray; continue }
        $saved = $ErrorActionPreference
        try { $ErrorActionPreference = "Continue"; & $cmd @args2; $code = $LASTEXITCODE } finally { $ErrorActionPreference = $saved }
        # O reporter JSON do newman copia o environment (com o token) para o relatorio: mascara antes de deixar no disco.
        if ($token) {
            for ($i = 1; $i -lt $relatorios.Count; $i += 2) {
                $rel = $relatorios[$i]
                if (Test-Path $rel) { [IO.File]::WriteAllText($rel, ([IO.File]::ReadAllText($rel)).Replace($token, "****"), (New-Object System.Text.UTF8Encoding($false))) }
            }
        }
        if ($code -ne 0) { Write-Err2 "$nome falhou (codigo $code)."; if ($codigoFinal -eq 0) { $codigoFinal = $code }; if ($Bail) { break } }
        else { Write-Ok "$nome passou." }
    }
} finally {
    if (Test-Path $tmpEnv) { Remove-Item -LiteralPath $tmpEnv -Force }
}
if ($PrintOnly) { Write-Ok "PrintOnly: nada executado (environment temporario com baseUrl e token nao foi gravado)."; exit 0 }
exit $codigoFinal
