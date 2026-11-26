# SPEC-01 — Regras dos agentes de IA, programação incremental e autonomia progressiva

| Campo | Valor |
|---|---|
| ID | SPEC-01 |
| Tipo | implementacao |
| Prioridade | P0 |
| Plano | pendente |
| Responsável pela spec | zzNICK |
| Depende de | SPEC-11 (backup) pronta antes, de preferência |
| Origem | NordTool — Plano de specs (26/11/2026), seção SPEC-01 |

Transforma as regras dos agentes de texto em verificação automática: o GitHub, o CI, os hooks e o MCP recusam o que estiver fora da regra. Detalhes em [spec.md](spec.md), [plano.md](plano.md), [decisoes.md](decisoes.md) e [contexto/](contexto/).

## Etapas

As etapas E01 a E04 são o item 2 do MVP. Antes de pegar uma etapa, leia o [plano](plano.md) e siga [policies/specs.md](../../policies/specs.md).

| Etapa | Título | Repositórios | Status | Responsável | Branch | PRs | Desde |
|---|---|---|---|---|---|---|---|
| E01 | Identidade do agente e autonomia nível 0 (MVP) | infra, backend, GitHub | planejada | — | — | — | — |
| E02 | Proteção nativa com rulesets (MVP) | GitHub, infra | planejada | — | — | — | — |
| E03 | Programação incremental com limite de 500 linhas (MVP) | infra, sql, backend, frontend | planejada | — | — | — | — |
| E04 | Hooks que falham fechado (MVP) | infra, sql, backend, frontend | planejada | — | — | — | — |
| E05 | Inconsistências e ADR da política de testes | infra, backend | planejada | — | — | — | — |
| E06 | Porquê, checklist de código de IA e plano obrigatório | infra, sql, backend, frontend | planejada | — | — | — | — |
| E07 | Mínimo privilégio dos agentes | GitHub, infra | planejada | — | — | — | — |
| E08 | Steerings por tipo de classe | infra | planejada | — | — | — | — |
| E09 | Skills, comandos e scripts de verificação | infra, sql, backend, frontend | planejada | — | — | — | — |
| E10 | Padrões de código verificáveis e decisão sobre MapStruct | infra, backend | planejada | — | — | — | — |
