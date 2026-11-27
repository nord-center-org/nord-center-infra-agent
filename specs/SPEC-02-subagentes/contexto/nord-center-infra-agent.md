# SPEC-02 — Contexto: nord-center-infra-agent

Conferido em `develop` em 2026-11-26.

## Hoje

- **`mcp/server/http.ts` e `http-config.ts`:**
  - Streamable HTTP com bearer por cliente e `/healthz`;
  - rate limit por IP e por cliente;
  - allowlist de **projetos** por credencial (`credential.projects`).

  Não há allowlist de ferramentas.
- **`mcp/server/factory.ts`:** registra para todo cliente as ferramentas de GitHub, `apply_changes_and_merge`, git local, CI (`get_workflow` e `get_logs`) e `get_project_context`.
- **Ferramentas `git_*`** (`mcp/tools/git/index.ts`) operam nos clones locais (`localPath` em `mcp/server/projects.ts`). No serviço remoto, esses caminhos não existem.
- **`roadmap.md`:** a fase 8 tem o HTTP, a separação de credenciais e as allowlists prontos; faltam HTTPS, segredos e domínio no Railway e a avaliação de OAuth 2.1. A fase 9 está toda pendente.
- **Pastas:** não existem `agents/` nem `config/`.
- **`vigia-issue/`:** outro caminho de agente generalista (Gemini CLI ou Claude Code local, disparados por comentário de issue).
- **Testes do MCP:** só os scripts `smoke:*`, sem testes unitários.

## Muda nesta spec

| Etapa | Arquivos |
|---|---|
| E01 | `agents/README.md`, `agents/*.md`, `scripts/agentes/converter.mjs`, `config/modelos.json` |
| E02 | `mcp/server/saida-agente.ts`, ferramenta `validar_saida_agente`, `agents/schema/`, testes `node --test` no MCP |
| E03 | `config/papeis.json`, `mcp/server/factory.ts`, `config.ts`, `http-config.ts` e `http.ts`, checagem de caminho em `mcp/tools/github/*` e `mcp/tools/git/*` |
| E04 | configuração do serviço no Railway, `mcp/README.md`, `roadmap.md` (fases 8 e 9) |
| E06 | `agents/fluxo.md` |
| E07 | `templates/github-workflows/revisao-ia.yml` |
| E08 | ferramentas novas em `mcp/tools/diagnostico/` |
| E09 | extrator do grafo e ferramentas em `mcp/tools/grafo/` |
| E10 | `specs/SPEC-02-subagentes/estudo-memoria.md` |
