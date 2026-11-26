# SPEC-02 — Subagentes especializados, orquestração e Lugia via MCP

| Campo | Valor |
|---|---|
| ID | SPEC-02 |
| Tipo | implementacao |
| Prioridade | P2 |
| Plano | pendente |
| Responsável pela spec | zzNICK |
| Depende de | SPEC-01 (regras e steerings); SPEC-06 para o agente de diagnóstico; SPEC-24 para o contexto por funcionalidade |
| Origem | NordTool — Plano de specs (26/11/2026), seção SPEC-02 |

Troca o agente generalista único por um orquestrador que delega a subagentes com papel, contexto e ferramentas restritos. Cada subagente devolve uma saída estruturada e validada por schema. Detalhes em [spec.md](spec.md), [plano.md](plano.md), [decisoes.md](decisoes.md) e [contexto/](contexto/).

## Etapas

Fora do MVP. As etapas marcadas como bloqueadas esperam outra spec ou etapa; o motivo está no [plano](plano.md).

| Etapa | Título | Repositórios | Status | Responsável | Branch | PRs | Desde |
|---|---|---|---|---|---|---|---|
| E01 | Formato neutro e definição dos subagentes | infra | planejada | — | — | — | — |
| E02 | Saída tipada com schema e grau de confiança | infra | planejada | — | — | — | — |
| E03 | Ferramentas do MCP por papel | infra | planejada | — | — | — | — |
| E04 | MCP remoto publicado (fases 8 e 9 do roadmap) | infra | planejada | — | — | — | — |
| E05 | Modo agente da Lugia pelo MCP | backend, infra | bloqueada | — | — | — | — |
| E06 | Fluxo orquestrado de ponta a ponta | infra, sql, backend, frontend | bloqueada | — | — | — | — |
| E07 | Revisão de PR com Claude Code Action | infra, sql, backend, frontend | planejada | — | — | — | — |
| E08 | Agente de diagnóstico | infra | bloqueada | — | — | — | — |
| E09 | Grafo de código para contexto | infra, sql, backend, frontend | planejada | — | — | — | — |
| E10 | Estudo de memória de longo prazo (neural memory) | infra | planejada | — | — | — | — |
