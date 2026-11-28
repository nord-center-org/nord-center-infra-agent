# Scripts

Ferramentas de linha de comando da infra, usadas por pessoas e por agentes. Nenhuma guarda segredo; credenciais vêm de variáveis de ambiente.

| Script | Para quê | Requisitos |
|---|---|---|
| [`specs/specs.mjs`](specs/) | Status, reserva, conclusão e validação das specs ([policies/specs.md](../policies/specs.md)) | Node 20+ |
| [`java/java-local-run.ps1`](java/java-local-run.ps1) | Maven e testes de um projeto Java pelo Maven embutido do IntelliJ, com o JDK que o projeto exige | PowerShell 5.1+, IntelliJ IDEA, JDK da versão do projeto |
| [`api/newman-run.ps1`](api/newman-run.ps1) | Rodar collections Postman contra a API (endpoints e contratos) | PowerShell 5.1+, Node 18+ |
| [`../collections/nord-tool/fonte/`](../collections/nord-tool/README.md) | Gerar a collection única da API (todas as rotas, contratos e regras) | Node 20+ |

Todos os `.ps1` têm o manual completo no cabeçalho: `-Help`.

## Maven e testes pelo IntelliJ (`java-local-run.ps1`)

A máquina não precisa de `mvn` no PATH: o script chama o Maven3 que vem no plugin do IntelliJ, com a mesma linha de comando que o IDE usa.

```powershell
# o mesmo do CI (clean verify, com o gate de cobertura)
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/java/java-local-run.ps1 -Projeto nord-tool-backend

# um teste ou um método, sem o gate de cobertura
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/java/java-local-run.ps1 -Projeto nord-tool-backend -Test LimiteTentativasServiceImplTest
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/java/java-local-run.ps1 -Projeto nord-tool-backend -Test "AcessoServiceImplTest#deveNegar"

# qualidade, como o job do CI
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/java/java-local-run.ps1 -Projeto nord-tool-backend -Goals "compile pmd:check spotbugs:check"

# JDKs encontrados e o comando que seria executado
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/java/java-local-run.ps1 -ListJdks
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/java/java-local-run.ps1 -Projeto nord-tool-backend -PrintOnly
```

**Qual JDK é usado.** A versão do projeto manda (`-JdkVersion`, depois `.tool-versions`, depois `<java.version>` do `pom.xml`). O script procura um JDK com essa versão em `JAVA_HOME`, `~/.jdks`, `Program Files\Java` e nas pastas dos outros fornecedores. Assim, com o `JAVA_HOME` em 21 e o backend ainda em Java 11, o build usa o JDK 11. Quando a SPEC-03 mudar o `pom.xml` para 21, ele passa a usar o 21 sozinho. Para forçar o `JAVA_HOME`, use `-UseJavaHome`; para outro JDK, `-JdkHome`. O `JAVA_HOME` só muda dentro do processo do build.

Códigos de saída: 0 sucesso, 2 sem `pom.xml`, 3 JDK não encontrado, 4 IntelliJ ou Maven não encontrado, outro valor é o código do Maven.

## Collections com o Newman (`newman-run.ps1`)

Base para validar endpoints e contratos (SPEC-14) com as collections de cada funcionalidade (`features/<slug>/collections/`, SPEC-24). Usa o `newman` instalado; se não houver, roda `npx --yes newman@6`.

```powershell
$env:NORD_API_TOKEN = "<jwt de um usuário de teste>"   # ou NORD_API_EMAIL e NORD_API_SENHA

# a collection única da API (todas as rotas)
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/api/newman-run.ps1 -Collection collections/nord-tool/nord-tool.postman_collection.json

# todas as collections de uma funcionalidade, no backend local (http://localhost:8081)
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/api/newman-run.ps1 -Feature controle-chaves

# uma collection, parando no primeiro erro, com relatórios JUnit e JSON
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/api/newman-run.ps1 -Collection features/sac/collections/sac.postman_collection.json -Bail -ReportDir target/newman

# contra o develop
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/api/newman-run.ps1 -Feature sac -BaseUrl https://<backend-develop>
```

- **Convenção das collections:** toda URL começa com `{{baseUrl}}`, a autenticação é `Bearer {{token}}`, e nada de token, senha ou dado pessoal fica salvo na collection. Modelo em [templates/collections/exemplo.postman_collection.json](../templates/collections/exemplo.postman_collection.json).
- **Credenciais:** `NORD_API_TOKEN`, ou `NORD_API_EMAIL` e `NORD_API_SENHA` para a collection entrar sozinha (`-TokenEnvVar`, `-EmailEnvVar`, `-SenhaEnvVar` trocam os nomes). No Windows, uma variável vazia no processo é lida das variáveis de usuário. Tudo vai para um environment temporário, apagado no fim; nos relatórios, tokens, senhas e chaves são mascarados; nada aparece na linha de comando.
- **Uploads:** o Newman roda com a pasta da collection como pasta de trabalho, então `src` de arquivo é relativo a ela.
- **Variáveis extras:** `-Var nome=valor` (pode repetir).
- **Produção protegida:** o script recusa URLs que não sejam locais ou de develop, staging ou teste, porque collections podem gravar e apagar dados. `-PermitirRemoto` libera, de propósito.

Códigos de saída: 0 tudo passou, 2 collection ou environment não encontrado, 4 sem Node/npx, 5 URL recusada, outro valor é o código do Newman.
