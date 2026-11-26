# SPEC-09 — Arquitetura: monólito modular com DDD

| Campo | Valor |
|---|---|
| ID | SPEC-09 |
| Tipo | implementacao |
| Prioridade | P0 da evolução |
| Plano | pendente |
| Responsável pela spec | zzNICK |
| Bloqueada por | SPEC-03 |
| Depende de | SPEC-03 (Spring Boot novo, que o Spring Modulith exige), SPEC-01 (tamanho de PR e ADR da política de testes). Começa logo depois do MVP comercial (onda A), com a SPEC-03 já concluída no MVP. Os módulos vendidos são os primeiros a migrar. O item 5 (front) fica para depois da SPEC-05, para a reorganização das pastas ter testes protegendo. |
| Origem | NordTool — Plano de specs (26/11/2026), seção SPEC-09 |

Reorganizar o código por domínio de negócio (bounded contexts) em vez de por camada técnica. As regras passam a morar em entidades e objetos de valor do domínio, com a persistência isolada atrás de interfaces. A refatoração é incremental, um contexto por vez, sem mudar comportamento.

Detalhes em [spec.md](spec.md). O plano de implementação (`plano.md`, `decisoes.md` e `contexto/`) é escrito quando a spec começar, pelos modelos de [templates/spec/](../../templates/spec/), conforme [policies/specs.md](../../policies/specs.md).

## Etapas

<!-- Etapas definidas no plano de implementação. Status: planejada, bloqueada, em-andamento, concluida ou descartada. Reserve com scripts/specs/specs.mjs pegar. -->

| Etapa | Título | Repositórios | Status | Responsável | Branch | PRs | Desde |
|---|---|---|---|---|---|---|---|
