# SPEC-02 — Contexto: nord-tool-frontend

Conferido em `origin/develop` em 2026-11-26.

## Hoje

- **Repositório público.** O pipeline (`.github/workflows/pipeline.yml`) roda lint, build, testes `node --test`, Gitleaks, `npm audit` e a imagem.
- **Sem subagentes** (`.claude/agents`) e sem revisão automática de PR.

## Muda nesta spec

| Etapa | Arquivos |
|---|---|
| E01 | `.claude/agents/*.md` gerados pelo conversor (PR próprio, arquivos gerados) |
| E07 | `.github/workflows/revisao-ia.yml`, só com o evento `pull_request` |
| E09 | extração de rotas, telas e chamadas de API para o grafo, no CI |
