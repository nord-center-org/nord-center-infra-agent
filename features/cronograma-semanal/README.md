# Cronograma semanal

| | |
|---|---|
| Slug | `cronograma-semanal` |
| Status | ativa |
| Versão atual | [v2](v2.md) |
| Repositórios | nord-tool-scripts-sql, nord-tool-backend, nord-tool-frontend |
| Onde no app | Organizacional > Cronograma semanal (`/organizacional/cronograma`) |

## O que faz

Organiza as demandas e a rotina de cada pessoa da obra. As demandas aparecem em três visões: Kanban (por fila), Lista (tabela com filtros) e Rotina (calendário de semana ou mês, com as atividades fixas). Dá para compartilhar demandas, ver as da equipe, criar demandas conversando com a Lugia e exportar a Lista ou a Rotina como uma imagem pronta para mandar. A tela lembra a visão e os filtros que a pessoa deixou.

## Regras de negócio vigentes

- **RN-01** Cada pessoa vê as próprias demandas, as compartilhadas com ela e as das equipes de que participa; só quem criou edita o conteúdo. _(v1)_
- **RN-02** A Rotina mostra a atividade fixa em todo dia da semana marcado e a demanda pontual no dia agendado e no dia do prazo. _(v1)_
- **RN-03** A imagem exportada mostra exatamente as demandas que a tela mostra com os filtros atuais, e cada observação aparece inteira. _(v2)_
- **RN-04** A visão e os filtros do Cronograma ficam guardados por pessoa, no aparelho, e voltam ao abrir a tela. _(v2)_

## Onde está no código

- **SQL:** tabelas do cronograma semanal, exceções da rotina e equipes (`cronograma_equipe`).
- **Backend:** endpoints `/cronogramaSemanal` (listar, salvar, mover status, exceções, equipes, compartilhamento); módulo `CRONOGRAMA` e sub-permissões `CRONOGRAMA_EXCLUIR`, `CRONOGRAMA_COMPARTILHAR`, `CRONOGRAMA_ROTINA`, `CRONOGRAMA_RELATORIO_IA`.
- **Frontend:** `pages/Cronograma_semanal.tsx`, `components/cronograma/` (inclui `ExportarImagem.tsx`), `services/CronogramaSemanalService.ts`, `utils/preferenciasCronograma.ts`, `utils/exportacaoCronograma.ts`.

## Versões

| Versão | Data | Resumo | Branch | PRs |
|---|---|---|---|---|
| [v1](v1.md) | 2026-11-03 | Registro retroativo do que a tela já fazia | — | — |
| [v2](v2.md) | 2026-11-03 | Exportar Lista e Rotina em imagem e lembrar os filtros | `feature-cronograma-semanal-v2` | [frontend#151](https://github.com/nord-center-org/nord-tool-frontend/pull/151), [infra#20](https://github.com/nord-center-org/nord-center-infra-agent/pull/20) |

## Correções

| Data | Branch | O que foi corrigido | PRs |
|---|---|---|---|

## Dependências e impactos

Usa o tema claro/escuro do app (a imagem exportada é sempre clara) e as novidades do Lugia Nexus. Demandas criadas, alteradas, movidas e compartilhadas e os horários e prazos geram avisos no celular pela feature [notificacoes](../notificacoes/README.md).
