# SPEC-19 — Processamento assíncrono e filas

| Campo | Valor |
|---|---|
| ID | SPEC-19 |
| Tipo | implementacao |
| Prioridade | P3 |
| Plano | pendente |
| Responsável pela spec | zzNICK |
| Bloqueada por | SPEC-06, SPEC-15 |
| Depende de | SPEC-15 (outbox e idempotência) e SPEC-06 (medição). O broker dedicado depende da SPEC-07. |
| Origem | NordTool — Plano de specs (26/11/2026), seção SPEC-19 |

Tirar da requisição do usuário o trabalho que demora ou que depende de serviço externo. A tarefa vai para uma fila, processada por um *worker* com retry, e as que falham sempre vão para uma fila de mensagens mortas (DLQ) em vez de travar as outras. A própria lista diz "ver necessidade", então a spec começa medindo e só adota um broker se os números justificarem.

Detalhes em [spec.md](spec.md). **Ainda sem plano de implementação.** Quem pegar esta spec monta primeiro o `plano.md`, o `decisoes.md` com as perguntas ao responsável e o `contexto/`, pelos modelos de [templates/spec/](../../templates/spec/), e pede a aprovação antes de qualquer código ([policies/specs.md](../../policies/specs.md), seção 3).

## Etapas

<!-- Etapas definidas no plano de implementação. Status: planejada, bloqueada, em-andamento, concluida ou descartada. Reserve com scripts/specs/specs.mjs pegar. -->

| Etapa | Título | Repositórios | Status | Responsável | Branch | PRs | Desde |
|---|---|---|---|---|---|---|---|
