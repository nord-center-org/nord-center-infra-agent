# SPEC-01 — Contexto: nord-center-infra-agent (e GitHub da organização)

Conferido em `develop` em 2026-11-26.

## Hoje

- **Repositório privado.** `develop` é a branch padrão, sem proteção nativa. O token atual recebe 403 ao listar os rulesets.
- **MCP** (`mcp/`), em TypeScript e sem testes unitários (só scripts `smoke:*`):
  - `server/branches.ts` tem a regex das branches de trabalho;
  - `tools/github/index.ts` traz `create_branch`, `update_file`, `create_pr` (base sempre `develop`), `get_pull_request` e `merge_pull_request` (squash depois do CI verde);
  - `tools/github/apply-and-merge.ts` cria branch, commit e PR e mescla numa chamada;
  - `tools/git/index.ts` tem `git_commit` local, que roda os hooks do clone;
  - `tools/projects/index.ts` tem `get_project_context`, com limite de 100 mil caracteres. Com o registro de specs, usa de 44 mil (front) a 62 mil (SQL) por projeto.
- **CI:** `.github/workflows/mcp-ci.yml` (job `mcp-build`: `npm ci` e build) e `.github/workflows/specs.yml` (job `specs`, entregue com este plano).
- **Policies que mandam mesclar sozinho:** `git-workflow.md` (item 7), `protected-branches.md` (itens 9, 10 e 15), `permissions.md` e `AGENTS.md`.
- **`vigia-issue/`:** script local que entrega comentários de uma issue ao Gemini CLI (`--yolo`) ou ao Claude Code (`acceptEdits`). O prompt manda fazer squash merge quando o CI passar, e a IA usa o login `gh` da máquina.
- **ADRs:** de 001 a 012 em `decisions.md`, mais o 013 (registro de specs).
- **Skills:** backend (`bug-fix`, `feature`, `java-spring`, `jdbc`, `postgres`), front (`bug-fix`, `escadinha-projetos`, `feature`, `react-typescript`) e SQL (`bug-fix`, `feature`, `postgres`).

## Muda nesta spec

| Etapa | Arquivos |
|---|---|
| E01 | `config/autonomia.json`, `mcp/server/autonomia.ts`, `mcp/tools/github/index.ts`, `mcp/tools/github/apply-and-merge.ts`, `policies/autonomia.md`, `policies/git-workflow.md`, `policies/protected-branches.md`, `policies/permissions.md`, `AGENTS.md`, `vigia-issue/lib.mjs` |
| E02 | `config/rulesets/develop.json`, `master.json` e `checks.json`, `policies/protected-branches.md`, ADR novo no lugar do "opcional" do ADR-006 (`decisions.md`, `architecture.md`), `roadmap.md`; configuração dos 4 repositórios no GitHub |
| E03 | `config/programacao-incremental.json`, `mcp/server/limite-linhas.ts`, `mcp/server/branches.ts`, `mcp/tools/github/*`, `policies/features.md`, `templates/github-workflows/*`, job novo no `mcp-ci.yml` |
| E04 | `templates/githooks/`, `mcp/tools/git/index.ts`, `policies/git-workflow.md` |
| E05 | `decisions.md` (ADR-014), `steering/nord-tool-backend/architecture.md` e `testing.md` |
| E06 | `policies/validacao-codigo-ia.md`, `.github/pull_request_template.md`, `templates/feature/vN.md`, `mcp/tools/github/index.ts`, `decisions.md` |
| E07 | `policies/permissions.md`; tokens na configuração do GitHub |
| E08 | `steering/nord-tool-backend/padroes/*`, `steering/nord-tool-frontend/padroes/*` |
| E09 | `skills/*/endpoint`, `migracao-sql`, `revisao-seguranca` e `parte-incremental`, mais `scripts/verificar.sh` da infra |
| E10 | `steering/nord-tool-backend/coding-standards.md`, `decisions.md` (ADR do MapStruct) |
