# SPEC-18 — Banco escalável: índices, réplicas, particionamento e CQRS

| Campo | Valor |
|---|---|
| ID | SPEC-18 |
| Tipo | implementacao |
| Prioridade | P3 |
| Plano | pendente |
| Responsável pela spec | zzNICK |
| Bloqueada por | SPEC-06 |
| Depende de | SPEC-06 (medição). Réplica e particionamento dependem da SPEC-07 e da carga medida na SPEC-08. Os itens 1 a 4 são baratos e podem ser antecipados. |
| Origem | NordTool — Plano de specs (26/11/2026), seção SPEC-18 |

Preparar o banco para volume maior, do mais barato para o mais caro: medir, indexar, otimizar consultas e, só quando os números pedirem, adicionar réplica de leitura e particionar tabelas grandes. O CQRS entra como regra de organização: leitura e escrita por caminhos separados. Isso permite mandar as leituras para a réplica sem reescrever o sistema.

Detalhes em [spec.md](spec.md). **Ainda sem plano de implementação.** Quem pegar esta spec monta primeiro o `plano.md`, o `decisoes.md` com as perguntas ao responsável e o `contexto/`, pelos modelos de [templates/spec/](../../templates/spec/), e pede a aprovação antes de qualquer código ([policies/specs.md](../../policies/specs.md), seção 3).

## Etapas

<!-- Etapas definidas no plano de implementação. Status: planejada, bloqueada, em-andamento, concluida ou descartada. Reserve com scripts/specs/specs.mjs pegar. -->

| Etapa | Título | Repositórios | Status | Responsável | Branch | PRs | Desde |
|---|---|---|---|---|---|---|---|
