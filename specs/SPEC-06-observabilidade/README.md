# SPEC-06 — Observabilidade

| Campo | Valor |
|---|---|
| ID | SPEC-06 |
| Tipo | implementacao |
| Prioridade | P1 |
| Plano | pendente |
| Responsável pela spec | zzNICK |
| Bloqueada por | SPEC-03 |
| Depende de | SPEC-03 (Spring Boot novo). Se encaixa com a SPEC-07, que fornece onde rodar coletores e probes. |
| Origem | NordTool — Plano de specs (26/11/2026), seção SPEC-06 |

Instrumentar backend e front para gerar métricas, logs estruturados e traces, e mandar tudo para uma ferramenta com dashboards e alertas. A recomendação é instrumentar com OpenTelemetry, que é neutro de fornecedor. Assim a escolha entre Grafana e Datadog vira configuração de destino e pode ser trocada sem mexer no código.

Detalhes em [spec.md](spec.md). **Ainda sem plano de implementação.** Quem pegar esta spec monta primeiro o `plano.md`, o `decisoes.md` com as perguntas ao responsável e o `contexto/`, pelos modelos de [templates/spec/](../../templates/spec/), e pede a aprovação antes de qualquer código ([policies/specs.md](../../policies/specs.md), seção 3).

## Etapas

<!-- Etapas definidas no plano de implementação. Status: planejada, bloqueada, em-andamento, concluida ou descartada. Reserve com scripts/specs/specs.mjs pegar. -->

| Etapa | Título | Repositórios | Status | Responsável | Branch | PRs | Desde |
|---|---|---|---|---|---|---|---|
