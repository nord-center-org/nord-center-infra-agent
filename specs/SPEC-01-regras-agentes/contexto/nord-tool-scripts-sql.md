# SPEC-01 — Contexto: nord-tool-scripts-sql

Conferido em `origin/develop` em 2026-11-26.

## Hoje

- **Repositório privado.** `develop` é a padrão, sem proteção nativa. O token atual recebe 403 ao listar os rulesets.
- **Estrutura:** `DDL/`, `DML/`, `MIGRACAO/`, `filelist.txt` e `executa-sql.sh`.
- **Pipeline** (`.github/workflows/pipeline.yml`):
  - gatilho em `pull_request` e push para `develop`;
  - jobs `Validação SQL` e `Secret Scanning`;
  - `Aplicar no Railway (develop)` depois do merge.
- **Sem hooks locais** e sem modelo de PR.

## Muda nesta spec

| Etapa | Arquivos |
|---|---|
| E03 | job `Limite de linhas` em `pipeline.yml` (cargas em `DML/` fora da conta); `scripts/limite-linhas.sh` |
| E04 | `.githooks/pre-commit`, `.githooks/pre-push`, `scripts/instalar-hooks.sh`, `.claude/settings.json` |
| E06 | `.github/pull_request_template.md` |
| E09 | `scripts/verificar.sh` e a skill `migracao-sql` |

## Atenção

A pipeline aplica os scripts no banco de `develop` depois do merge. Com a branch mãe da E03, só o merge da mãe em `develop` aplica; as partes nunca disparam o job `Aplicar`.
