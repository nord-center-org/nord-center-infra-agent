# SPEC-15 — Concorrência, consistência e cache

| Campo | Valor |
|---|---|
| ID | SPEC-15 |
| Tipo | correcao |
| Prioridade | P1 |
| Plano | pendente |
| Responsável pela spec | zzNICK |
| Bloqueada por | SPEC-03 |
| Depende de | SPEC-03. A parte de cache distribuído depende da SPEC-08; a outbox é a base da SPEC-19. |
| Origem | NordTool — Plano de specs (26/11/2026), seção SPEC-15 |

Garantir que operações simultâneas e falhas parciais não gerem dado duplicado, perdido ou inconsistente. Estes tópicos vieram juntos porque têm a mesma raiz: duas coisas acontecendo ao mesmo tempo sobre o mesmo recurso. O cache entra aqui pelo mesmo motivo; mal feito, ele causa o próprio stampede e mostra dado velho.

Detalhes em [spec.md](spec.md). O plano de implementação (`plano.md`, `decisoes.md` e `contexto/`) é escrito quando a spec começar, pelos modelos de [templates/spec/](../../templates/spec/), conforme [policies/specs.md](../../policies/specs.md).

## Etapas

<!-- Etapas definidas no plano de implementação. Status: planejada, bloqueada, em-andamento, concluida ou descartada. Reserve com scripts/specs/specs.mjs pegar. -->

| Etapa | Título | Repositórios | Status | Responsável | Branch | PRs | Desde |
|---|---|---|---|---|---|---|---|
