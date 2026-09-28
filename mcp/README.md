# MCP local

Servidor MCP em TypeScript/Node.js, independente do agente cliente. O transporte inicial é `stdio`; cada cliente inicia o processo localmente.

## Configuração

- Node.js 20 ou superior.
- `npm install` e `npm run build` a partir de `mcp/`.
- Configure `GITHUB_TOKEN` no ambiente do processo para ferramentas GitHub autenticadas.
- O argumento `project` seleciona um repositório da allowlist em `mcp/server/projects.ts`.
- `GITHUB_TOKEN` é opcional para leituras de repositórios públicos; configure um token Fine-grained com `Contents: read/write`, `Pull requests: read/write` e `Actions: read`, conforme as operações necessárias. O merge valida o CI pelas execuções do Actions associadas ao SHA do PR e não depende da API Checks ou de Commit statuses.
- Não salve tokens nem credenciais em arquivos versionados.

## Ferramentas previstas

| Área | Ferramenta | Acesso |
|---|---|---|
| GitHub | `get_file`, `search_code`, `get_pull_request` | leitura |
| GitHub | `create_branch`, `update_file`, `create_pr` | escrita delimitada; PR somente para `develop` |
| GitHub | `merge_pull_request` | merge somente em `develop`, exige execuções do Actions concluídas com sucesso e ausência de conflitos |
| GitHub | `apply_changes_and_merge` | commit atômico com vários arquivos, PR para `develop`, espera por Actions e merge squash condicionado |
| Git | `git_status`, `git_diff` | leitura local |
| Git | `git_commit` | escrita explícita |
| CI | `get_workflow`, `get_logs` | leitura |
| Contexto | `get_project_context` e recursos `nord-center-infra://projects/<projeto>/context` | leitura |

## Contexto específico por projeto

O MCP publica um recurso de contexto separado para cada projeto allowlistado e a ferramenta `get_project_context` recebe o argumento `project`. A resposta contém somente o perfil `projects/<projeto>.md`, os Markdown de `steering/<projeto>/` e os Markdown de `skills/<projeto>/`. O cliente deve selecionar o projeto da tarefa e solicitar somente o recurso correspondente (ou chamar a ferramenta com esse projeto); o servidor não injeta as instruções de todos os projetos em cada resposta. O conteúdo é limitado a 100.000 caracteres por projeto e a arquivos Markdown nas pastas allowlistadas.

As ferramentas GitHub e CI consultam os repositórios canônicos de `nord-center-org` pela REST API; as ferramentas Git atuam somente nos caminhos locais allowlistados. Escritas remotas nunca alteram diretamente `main`, `master` ou `develop`, mesmo sem regras nativas de proteção no GitHub. `create_pr` abre PR para `develop`; `merge_pull_request` só mescla para `develop`, e exige PR aberto, não draft, sem conflito, pelo menos uma execução do Actions para o SHA exato do PR, uma execução concluída com sucesso e nenhuma execução pendente ou reprovada. `master` espelha produção e fica fora do merge automático; a promoção de `develop` para `master` pertence a um fluxo de release separado. `get_logs` limita o arquivo baixado e o texto retornado.

`apply_changes_and_merge` recebe o projeto, uma branch (`feature/*`, `fix/*`, `chore/*`, `refactor/*` ou `docs/*`), arquivos e metadados de commit/PR. Ele grava todos os arquivos em um único commit, reusa a branch/PR quando a mesma solicitação já foi aplicada, acompanha as Actions do SHA atual e faz squash merge em `develop` usando o SHA como trava contra atualização concorrente. Aceita até 100 arquivos, 1 MiB por arquivo e 5 MB no total; bloqueia caminhos de `.git` e nomes comuns de credenciais. Falha de CI, ausência de Actions, conflito, fechamento do PR ou timeout interrompe o fluxo e deixa o PR aberto.

Os workflows em `../templates/github-workflows/` são templates versionados para instalar nos repositórios consumidores. O template frontend roda lint, build e testes em PR/push para `develop` e `master`. O template SQL valida o `filelist.txt` e faz parse dos SQL alterados sem executá-los nem acessar banco. Até esses arquivos serem instalados nos respectivos repositórios, `apply_changes_and_merge` vai parar quando não encontrar Actions associadas ao PR.

## Exemplo de conexão de cliente MCP

Use o caminho absoluto para o JavaScript compilado; cada cliente MCP tem seu próprio arquivo de configuração:

```json
{
  "mcpServers": {
    "nord-center-infra-agent": {
      "command": "node",
      "args": ["<caminho-absoluto>/nord-center-infra-agent/mcp/dist/server/index.js"],
      "env": {
        "GITHUB_TOKEN": "<token-fine-grained-opcional>"
      }
    }
  }
}
```

Não versione um token real na configuração. Para leitura de repositórios públicos, omita `GITHUB_TOKEN`.

## Validar conexão MCP/GitHub

Com dependências instaladas e acesso de rede liberado, execute `npm run smoke:github`. O comando compila o servidor, conecta por `stdio` como cliente MCP e testa `get_file` e `get_workflow` no repositório público `nord-tool-backend`, branch `develop`. Para repositórios privados ou `search_code`, configure `GITHUB_TOKEN` no ambiente que inicia o servidor.
