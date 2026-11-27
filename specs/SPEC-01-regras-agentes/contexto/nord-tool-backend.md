# SPEC-01 — Contexto: nord-tool-backend

Conferido em `origin/develop` em 2026-11-26.

## Hoje

- **Repositório público.** `develop` é a padrão, sem proteção nativa nem rulesets. Merge em `develop` dispara o deploy no Railway.
- **Plataforma:**
  - Java 11 e Spring Boot 2.7.18 (`pom.xml`);
  - jacoco com 90% de linhas nos `*ServiceImpl`;
  - PMD e SpotBugs (conferir o ruleset em uso antes da E10);
  - sem MapStruct; o pacote `builder` tem uma classe (`ApartamentoVistoriaHistoricoBuilder`).
- **Injeção:** as ocorrências de `@Autowired` conferidas estão em construtores (classes com mais de um construtor); não foi achada injeção em campo.
- **Pipeline** (`.github/workflows/pipeline-dev.yml`):
  - gatilho em `pull_request` e push para `develop`;
  - jobs `Build & Testes` (com `scripts/verificar-politica-testes.sh` e `mvn verify`), `Qualidade de Código`, `Secret Scanning` (Gitleaks com `.gitleaks.toml`) e `Resumo de Alertas`;
  - `Análise de Vulnerabilidades` (OSV) e `Container Image` (Trivy) não rodam em PR;
  - `CD (Railway)`.
- **Sem hooks locais** e sem modelo de PR. Há `.github/dependabot.yml`.
- **`AGENTS.md`:** "Preserve Java 11 e Spring Boot 2.7.x, salvo pedido explícito de migração".
- **Modo agente da Lugia** (`service/lugia/LugiaAgenteClaudeClient.java`):
  - usa Claude Managed Agents, com os repositórios montados em `/workspace`;
  - conecta o MCP do GitHub (`api.githubcopilot.com/mcp`) com uma credencial guardada no vault do provedor;
  - política "sempre permitir" nas ferramentas;
  - o prompt manda fazer o squash merge quando o CI estiver verde.

## Muda nesta spec

| Etapa | Arquivos |
|---|---|
| E01 | prompt em `LugiaAgenteClaudeClient.java`: abrir o PR e parar, sem merge |
| E03 | job `Limite de linhas` e gatilho para branches mães em `pipeline-dev.yml`; `scripts/limite-linhas.sh` |
| E04 | `.githooks/pre-commit`, `.githooks/pre-push`, `scripts/instalar-hooks.sh`, `.claude/settings.json` |
| E05 | `AGENTS.md` (versões pelo `pom.xml`), `scripts/verificar-politica-testes.sh` |
| E06 | `.github/pull_request_template.md` |
| E09 | `scripts/verificar.sh` |
| E10 | ruleset do PMD e `pom.xml` (fora da janela da SPEC-03) |
