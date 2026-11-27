# SPEC-01 — Contexto: nord-tool-frontend

Conferido em `origin/develop` em 2026-11-26.

## Hoje

- **Repositório público.** `develop` é a padrão, sem proteção nativa nem rulesets.
- **Pipeline** (`.github/workflows/pipeline.yml`):
  - gatilho em `pull_request` e push para `develop`;
  - `Lint, Build & Testes` (`npm ci`, `npm run lint`, `npm run build` e `npm test`, que roda `node --test` com a lista explícita de arquivos);
  - `Secret Scanning`, `Análise de Vulnerabilidades` (`npm audit --omit=dev --audit-level=high`), `Container Image` e `Resumo de Alertas`;
  - `CD (Railway)`.
- **Sem hooks locais** e sem modelo de PR. O `package-lock.json` é versionado (fica fora do limite de linhas).

## Muda nesta spec

| Etapa | Arquivos |
|---|---|
| E03 | job `Limite de linhas` e gatilho para branches mães em `pipeline.yml`; `scripts/limite-linhas.sh` |
| E04 | `.githooks/pre-commit` (Gitleaks e ESLint nos arquivos staged), `.githooks/pre-push`, `scripts/instalar-hooks.sh`, `.claude/settings.json` |
| E06 | `.github/pull_request_template.md` |
| E09 | `scripts/verificar.sh` |
