# SPEC-13 — Segurança do banco: acesso por IP, usuário mínimo e RLS

| Campo | Valor |
|---|---|
| ID | SPEC-13 |
| Tipo | correcao |
| Prioridade | P0 / P2 |
| Plano | pendente |
| Responsável pela spec | zzNICK |
| Bloqueada por | SPEC-11 |
| Depende de | SPEC-11 (backup antes de mexer em permissões). Os itens 1 a 3 não dependem de mais nada e são P0. O item 4 (RLS) é P2 e combina com a SPEC-09, já que o contexto define o dono de cada tabela. |
| Origem | NordTool — Plano de specs (26/11/2026), seção SPEC-13 |

Banco acessível só pelo backend, usuários com mínimo privilégio, TLS e RLS por usuário dentro da conta.

Detalhes em [spec.md](spec.md). **Ainda sem plano de implementação.** Quem pegar esta spec monta primeiro o `plano.md`, o `decisoes.md` com as perguntas ao responsável e o `contexto/`, pelos modelos de [templates/spec/](../../templates/spec/), e pede a aprovação antes de qualquer código ([policies/specs.md](../../policies/specs.md), seção 3).

## Etapas

<!-- Etapas definidas no plano de implementação. Status: planejada, bloqueada, em-andamento, concluida ou descartada. Reserve com scripts/specs/specs.mjs pegar. -->

| Etapa | Título | Repositórios | Status | Responsável | Branch | PRs | Desde |
|---|---|---|---|---|---|---|---|
