# SPEC-07 — Kubernetes em VPS, novo deploy e saída do Railway

| Campo | Valor |
|---|---|
| ID | SPEC-07 |
| Tipo | implementacao |
| Prioridade | P2 |
| Plano | pendente |
| Responsável pela spec | zzNICK |
| Bloqueada por | SPEC-03, SPEC-04, SPEC-06, SPEC-11 |
| Depende de | SPEC-03 (imagens novas), SPEC-06 (probes) e SPEC-04 (headers e segredos). A SPEC-08 completa esta com réplicas e autoscaling. |
| Origem | NordTool — Plano de specs (26/11/2026), seção SPEC-07 |

Tirar backend, frontend e MCP do Railway e rodar em um cluster Kubernetes gerenciado, com infraestrutura como código, deploy por pipeline e ambientes separados. A primeira entrega desta spec é uma decisão de provedor com custo estimado; o que vem depois é execução.

Detalhes em [spec.md](spec.md). **Ainda sem plano de implementação.** Quem pegar esta spec monta primeiro o `plano.md`, o `decisoes.md` com as perguntas ao responsável e o `contexto/`, pelos modelos de [templates/spec/](../../templates/spec/), e pede a aprovação antes de qualquer código ([policies/specs.md](../../policies/specs.md), seção 3).

## Etapas

<!-- Etapas definidas no plano de implementação. Status: planejada, bloqueada, em-andamento, concluida ou descartada. Reserve com scripts/specs/specs.mjs pegar. -->

| Etapa | Título | Repositórios | Status | Responsável | Branch | PRs | Desde |
|---|---|---|---|---|---|---|---|
