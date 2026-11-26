# SPEC-03 — Atualização de plataforma e vulnerabilidades bloqueantes

| Campo | Valor |
|---|---|
| ID | SPEC-03 |
| Tipo | correcao |
| Prioridade | P0 |
| Plano | pendente |
| Responsável pela spec | zzNICK |
| Bloqueada por | — |
| Depende de | SPEC-01 (tamanho de PR). Deve vir antes das SPEC-04, 06, 07, 09, 12, 14 e 15, que já assumem a versão nova. |
| Origem | NordTool — Plano de specs (26/11/2026), seção SPEC-03 |

Levar backend e frontend para versões com suporte de segurança. Depois disso, o scan de vulnerabilidades deixa de só alertar e passa a bloquear merge e deploy. As duas coisas andam juntas: hoje o scan não bloqueia justamente porque a versão do Spring tem CVEs sem correção.

Detalhes em [spec.md](spec.md). O plano de implementação (`plano.md`, `decisoes.md` e `contexto/`) é escrito quando a spec começar, pelos modelos de [templates/spec/](../../templates/spec/), conforme [policies/specs.md](../../policies/specs.md).

## Etapas

<!-- Etapas definidas no plano de implementação. Status: planejada, bloqueada, em-andamento, concluida ou descartada. Reserve com scripts/specs/specs.mjs pegar. -->

| Etapa | Título | Repositórios | Status | Responsável | Branch | PRs | Desde |
|---|---|---|---|---|---|---|---|
