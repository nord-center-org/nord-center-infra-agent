# MCP local

Servidor MCP em TypeScript/Node.js, independente do agente cliente. O transporte inicial é `stdio`; cada cliente inicia o processo localmente.

## Configuração

- Node.js 20 ou superior.
- `npm install` e `npm run build` a partir de `mcp/`.
- Configure `GITHUB_TOKEN` no ambiente do processo para ferramentas GitHub autenticadas.
- O argumento `project` seleciona um repositório da allowlist em `mcp/server/projects.ts`.
- `GITHUB_TOKEN` é opcional para leituras de repositórios públicos; configure um token Fine-grained com `Contents: read/write`, `Pull requests: read/write`, `Actions: read`, `Checks: read` e `Commit statuses: read`, conforme as operações necessárias.
- Não salve tokens nem credenciais em arquivos versionados.

## Ferramentas previstas

| Área | Ferramenta | Acesso |
|---|---|---|
| GitHub | `get_file`, `search_code`, `get_pull_request` | leitura |
| GitHub | `create_branch`, `update_file`, `create_pr` | escrita delimitada; PR somente para `develop` |
| GitHub | `merge_pull_request` | merge somente em `develop`, exige checks/status aprovados e ausência de conflitos |
| Git | `git_status`, `git_diff` | leitura local |
| Git | `git_commit` | escrita explícita |
| CI | `get_workflow`, `get_logs` | leitura |

As ferramentas GitHub e CI consultam os repositórios reais pela REST API; as ferramentas Git atuam somente nos caminhos locais allowlistados. Escritas remotas nunca alteram diretamente branches protegidas. `create_pr` abre PR para `develop`; `merge_pull_request` só mescla para `develop`, e exige PR aberto, não draft, sem conflito, pelo menos um status/check e todos os resultados aprovados. `get_logs` limita o arquivo baixado e o texto retornado.

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
