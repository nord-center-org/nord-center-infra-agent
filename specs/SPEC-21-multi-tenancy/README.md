# SPEC-21 — Multi-tenancy: isolamento por empresa cliente

| Campo | Valor |
|---|---|
| ID | SPEC-21 |
| Tipo | implementacao |
| Prioridade | MVP |
| Plano | pendente |
| Responsável pela spec | zzNICK |
| Bloqueada por | SPEC-03, SPEC-11 |
| Depende de | SPEC-11 (backup antes da migração de dados), SPEC-03 (versão nova) e o ADR da política de testes (SPEC-01). |
| Origem | NordTool — Plano de specs (26/11/2026), seção SPEC-21 |

Cada empresa cliente vira uma **conta**, e todo dado passa a pertencer a uma conta. Um usuário só enxerga os dados da conta em que está logado; nem um bug numa query deixa vazar dado de outro cliente. A spec também traz o cadastro self-service da empresa, os convites de usuários e os módulos liberados por conta.

Detalhes em [spec.md](spec.md). O plano de implementação (`plano.md`, `decisoes.md` e `contexto/`) é escrito quando a spec começar, pelos modelos de [templates/spec/](../../templates/spec/), conforme [policies/specs.md](../../policies/specs.md).

## Etapas

<!-- Etapas definidas no plano de implementação. Status: planejada, bloqueada, em-andamento, concluida ou descartada. Reserve com scripts/specs/specs.mjs pegar. -->

| Etapa | Título | Repositórios | Status | Responsável | Branch | PRs | Desde |
|---|---|---|---|---|---|---|---|
