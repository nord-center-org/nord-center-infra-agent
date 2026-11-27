# SPEC-02 — Contexto: nord-tool-scripts-sql

Conferido em `origin/develop` em 2026-11-26.

## Hoje

- **Repositório privado.** `DDL/`, `DML/`, `MIGRACAO/` e `filelist.txt`; o pipeline valida e aplica em `develop` depois do merge.
- **Sem subagentes** e sem revisão automática de PR.

## Muda nesta spec

| Etapa | Arquivos |
|---|---|
| E01 | `.claude/agents/*.md` gerados (o Executor SQL) |
| E07 | `.github/workflows/revisao-ia.yml` |
| E09 | leitura do DDL (tabelas, colunas e índices) para o grafo |
