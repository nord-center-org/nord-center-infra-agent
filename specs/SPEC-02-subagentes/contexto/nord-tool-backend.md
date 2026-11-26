# SPEC-02 — Contexto: nord-tool-backend

Conferido em `origin/develop` em 2026-11-26.

## Hoje

- **Modo agente da Lugia** em `src/main/java/br/com/nord_tool_backend/service/lugia/`:
  - `LugiaAgenteClient` (interface), `LugiaAgenteClaudeClient` (implementação) e `LugiaAgenteDescricao`;
  - usa o SDK Java da Anthropic (beta `agents`, `environments`, `sessions`, `vaults`);
  - monta os repositórios do NordTool como recurso de sessão em `/workspace`;
  - conecta o MCP do GitHub (`MCP_GITHUB = "https://api.githubcopilot.com/mcp/"`) com credencial bearer no vault;
  - política "sempre permitir" nas ferramentas;
  - o prompt manda acompanhar o CI e fazer o squash merge quando ficar verde.
- **Credenciais** vêm de `LugiaProperties` (variáveis de ambiente, nunca em log nem em resposta).
- **Teste:** `LugiaServiceImplTest` cobre o service. O cliente do agente fica fora da regra de cobertura (só `*ServiceImpl`).

## Muda nesta spec

| Etapa | Arquivos |
|---|---|
| E05 | `LugiaAgenteClaudeClient.java` (URL e credencial do MCP da infra, prompt), `LugiaProperties.java` (URL configurável), `.env.example` (nome da variável nova, sem valor) |
| E06 | nenhum arquivo fixo: é o piloto do fluxo |
| E07 | `.github/workflows/revisao-ia.yml` |
| E09 | extração do grafo no CI (`pipeline-dev.yml`) |

## Atenção

A E05 mexe no backend, que a SPEC-03 (Java 21 e Spring Boot 4) também vai mexer inteiro. Fazer a E05 antes de a SPEC-03 começar ou depois de ela ser integrada, nunca em paralelo.
