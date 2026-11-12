# Cronograma semanal

| | |
|---|---|
| Slug | `cronograma-semanal` |
| Status | ativa |
| Versão atual | [v4](v4.md) |
| Repositórios | nord-tool-scripts-sql, nord-tool-backend, nord-tool-frontend |
| Onde no app | Organizacional > Cronograma semanal (`/organizacional/cronograma`) |

## O que faz

Organiza as demandas e a rotina de cada pessoa da obra. As demandas aparecem em três visões: Kanban (por fila), Lista (tabela com filtros) e Rotina (calendário de semana ou mês, com as atividades fixas). Dá para compartilhar demandas, ver as da equipe, criar demandas escrevendo num chat ("Criar pelo chat", lido no aparelho, sem IA) e exportar a Lista ou a Rotina como uma imagem pronta para mandar. A tela lembra a visão e os filtros que a pessoa deixou.

## Regras de negócio vigentes

- **RN-01** Cada pessoa vê as próprias demandas, as compartilhadas com ela e as das equipes de que participa; só quem criou edita o conteúdo. _(v1)_
- **RN-02** A Rotina mostra a atividade fixa em todo dia da semana marcado e a demanda pontual no dia agendado e no dia do prazo. _(v1)_
- **RN-03** A imagem exportada mostra exatamente as demandas que a tela mostra com os filtros atuais, e cada observação aparece inteira. _(v2)_
- **RN-04** A visão e os filtros do Cronograma ficam guardados por pessoa, no aparelho, e voltam ao abrir a tela. _(v2)_
- **RN-05** A demanda pontual pode durar vários dias: do início (dia e horário) ao dia de fim, no máximo um ano. Na Rotina ela aparece em todos os dias do período. Sem fim, vale só o dia do início; atividade fixa não tem período. _(v3)_
- **RN-06** O "Criar pelo chat" monta as demandas a partir do texto sem IA e sem servidor. Entende:
  - uma demanda por linha;
  - dias da semana e repetição ("toda segunda e quarta", "de segunda a sexta", "dias úteis", "todo dia");
  - datas ("hoje", "amanhã", "sexta que vem", "dia 6", "20/11", "25 de novembro"), horários ("9h", "14:30", "às 3 da tarde") e período ("de 15 a 20/12");
  - prazo ("prazo dia 6", "até dia 15"), detalhes entre parênteses (observação), `#tag` e `categoria X`.

  Sem horário, a demanda pontual fica às 9h, como no formulário, e o chat avisa. Domingo não existe no cronograma e fica de fora, com aviso. A categoria sai por palavras-chave (padrão Engenharia) e a fila, por "aguardar", "acompanhar" ou "urgente" (padrão Pendentes). Um ajuste ("muda para quinta às 10h", "às 15h", "categoria pessoal") vale para a última demanda montada, ou para todas se a pessoa disser "todas". _(v4)_

## Onde está no código

- **SQL:** tabelas do cronograma semanal, exceções da rotina e equipes (`cronograma_equipe`); v3: `DDL/72.cronograma_duracao_ddl.sql` (`dt_fim_agendamento`).
- **Backend:** endpoints `/cronogramaSemanal` (listar, salvar, mover status, exceções, equipes, compartilhamento); módulo `CRONOGRAMA` e sub-permissões `CRONOGRAMA_EXCLUIR`, `CRONOGRAMA_COMPARTILHAR`, `CRONOGRAMA_ROTINA`, `CRONOGRAMA_RELATORIO_IA`.
- **Frontend:** `pages/Cronograma_semanal.tsx`, `components/cronograma/` (inclui `ExportarImagem.tsx`), `services/CronogramaSemanalService.ts`, `utils/preferenciasCronograma.ts`, `utils/exportacaoCronograma.ts`, `utils/periodoAgenda.ts` (v3), `utils/interpretadorDemanda.ts` (v4, o chat sem IA).

## Versões

| Versão | Data | Resumo | Branch | PRs |
|---|---|---|---|---|
| [v1](v1.md) | 2026-11-03 | Registro retroativo do que a tela já fazia | — | — |
| [v2](v2.md) | 2026-11-03 | Exportar Lista e Rotina em imagem e lembrar os filtros | `feature-cronograma-semanal-v2` | [frontend#151](https://github.com/nord-center-org/nord-tool-frontend/pull/151), [infra#20](https://github.com/nord-center-org/nord-center-infra-agent/pull/20) |
| [v3](v3.md) | 2026-11-11 | Atividade com dia de início e de fim, escolhidos no calendário (chamado #2) | `feature-cronograma-semanal-v3` | [sql#75](https://github.com/nord-center-org/nord-tool-scripts-sql/pull/75), [backend#124](https://github.com/nord-center-org/nord-tool-backend/pull/124), [frontend#173](https://github.com/nord-center-org/nord-tool-frontend/pull/173), [infra#44](https://github.com/nord-center-org/nord-center-infra-agent/pull/44) |
| [v4](v4.md) | 2026-11-12 | Chat de demandas sem IA (interpretado no aparelho) | `feature-cronograma-semanal-v4` | frontend (a abrir), infra (a abrir) |

## Correções

| Data | Branch | O que foi corrigido | PRs |
|---|---|---|---|

## Dependências e impactos

Usa o tema claro/escuro do app (a imagem exportada é sempre clara) e as novidades do Lugia Nexus. Demandas criadas, alteradas, movidas e compartilhadas e os horários e prazos geram avisos no celular pela feature [notificacoes](../notificacoes/README.md). A tela de compartilhar, as pessoas e as equipes também servem ao [relatório fotográfico](../relatorio-fotografico/README.md).
