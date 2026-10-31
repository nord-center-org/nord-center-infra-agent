# Cronograma semanal

| | |
|---|---|
| Slug | `cronograma-semanal` |
| Status | ativa |
| Versão atual | [v1](v1.md) (retroativa) |
| Repositórios | nord-tool-scripts-sql, nord-tool-backend, nord-tool-frontend |
| Onde no app | Organizacional > Cronograma semanal (`/organizacional/cronograma`) |

## O que faz

Organiza as demandas e a rotina de cada pessoa. A demanda passa por cinco filas (Pendentes, Executar, Aguardar retorno, Acompanhar andamento, Finalizada) e aparece em três vistas: Kanban, Lista e Rotina (calendário da semana ou do mês). Cada demanda tem um dono, que pode compartilhá-la com colegas; quem está na mesma equipe da obra vê as demandas dos outros membros e pode movê-las entre as filas. A Lugia monta demandas a partir de um pedido em texto livre, e um link secreto deixa um assistente de IA (Gemini ou outro) ler o cronograma da pessoa.

## Regras de negócio vigentes

Todas registradas a partir do código de 2026-10-30; o porquê das decisões antigas não foi registrado.

**Demandas e filas**

- **RN-01** A demanda tem título obrigatório, categoria, fila, observação, frente/projeto (`nm_tag`) e data planejada (`dt_prazo`). Categorias: Pessoal, Acadêmica, Atlética, Musical, Devocional, Engenharia e Programação; a tela abre uma demanda nova em Engenharia e em Pendentes. _(v1)_
- **RN-02** As filas são `pendentes`, `executar`, `aguardar`, `acompanhar` e `finalizada`. Mover de fila (arrastar no Kanban ou mover em massa na Lista) só troca o status e é validado contra essa lista. Criar e editar não validam categoria nem fila no servidor. _(v1)_
- **RN-03** No Kanban e na Lista, as demandas são ordenadas pela data planejada (sem data por último); a Lista agrupa primeiro pela ordem das filas. _(v1)_

**Rotina**

- **RN-04** Uma atividade fixa se repete toda semana num dia (`id_dia_semana`) e tem um horário em texto livre. O dia é obrigatório para atividade fixa. Os dias aceitos são segunda a sexta (1–5) e sábado (7); o id 6 é "Sem agendamento" e não há domingo. _(v1)_
- **RN-05** Cada item fixo guarda um único dia. Marcar vários dias no formulário cria um item por dia; na edição, o item continua no dia dele, se ainda estiver marcado, e os outros dias viram cópias independentes. _(v1)_
- **RN-06** Uma demanda não fixa aparece na Rotina no dia do agendamento (data e hora opcionais) e também no dia da data planejada. _(v1)_
- **RN-07** O dono pode desmarcar uma atividade fixa só num dia (exceção). A exceção só vale para itens fixos e pode ser desfeita. _(v1)_

**Dono, compartilhamento e equipes**

- **RN-08** Quem cria é o dono. Só o dono altera o conteúdo, exclui, compartilha e marca exceções. Qualquer pessoa que enxerga o item (RN-09) e tem ESCRITA no módulo pode movê-lo de fila. _(v1)_
- **RN-09** Uma pessoa vê as próprias demandas, as compartilhadas com ela e as dos colegas de qualquer equipe de que participa. O ADMIN do módulo vê todas, inclusive os itens antigos sem dono, e também altera e exclui os itens sem dono. _(v1)_
- **RN-10** O compartilhamento substitui a lista inteira de pessoas: no máximo 200 usuários ativos, sem incluir o próprio dono. A lista de pessoas mostra os usuários ativos e aprovados e marca quem está abaixo da pessoa na hierarquia (`id_superior`). _(v1)_
- **RN-11** As equipes pertencem a uma obra, têm nome único na obra, líder opcional (sempre incluído como membro) e de 1 a 200 membros ativos. "Puxar da hierarquia" sugere o líder e todos os que estão abaixo dele. Só o ADMIN do módulo cria, altera e exclui equipes. _(v1)_
- **RN-12** A visibilidade por equipe não depende da obra escolhida: participar de qualquer equipe basta para ver as demandas dos outros membros dela. _(v1)_

**Lugia e relatório para IA**

- **RN-13** "Criar com a Lugia" envia o pedido (até 2000 caracteres, com até 6 pedidos anteriores do chat) e recebe até 10 demandas montadas, sem salvar. A pessoa cria direto ou revisa no formulário. Fora da lista, a categoria vira Engenharia e a fila vira Pendentes; os dias inválidos são descartados. _(v1)_
- **RN-14** O relatório para IA é um link secreto (`ntk_` + 43 caracteres) de leitura, criado pela pessoa. Cada pessoa tem no máximo 5 links ativos, que podem ser revogados. O servidor guarda só o hash SHA-256 e mostra a chave uma única vez. _(v1)_
- **RN-15** O link mostra, em texto ou JSON, a pauta de hoje, as atrasadas (prazo vencido e não finalizadas), os próximos dias (7 por padrão, de 1 a 14) e as pendentes sem data, no fuso de Brasília. Ele lê as demandas próprias e as compartilhadas com o dono do link, mas não as das equipes. Aceita no máximo 30 leituras por minuto e deixa de funcionar se o dono ficar inativo, deixar de estar aprovado ou perder o subacesso. _(v1)_

**Permissões**

- **RN-16** Ler exige `CRONOGRAMA` LEITURA; criar, editar, mover e usar a Lugia exigem ESCRITA; equipes exigem ADMIN. Subacessos: `CRONOGRAMA_EXCLUIR` (excluir), `CRONOGRAMA_COMPARTILHAR` (compartilhar), `CRONOGRAMA_ROTINA` (criar ou alterar atividade fixa e marcar exceções) e `CRONOGRAMA_RELATORIO_IA` (criar link). Sem linha própria, o subacesso herda o módulo; com `NENHUM`, fica bloqueado. _(v1)_
- **RN-17** Os cargos de estagiário e trainee não têm `CRONOGRAMA_EXCLUIR` (DML 08, reexecutável e sem sobrescrever ajustes feitos na tela de Acessos). _(v1)_

## Onde está no código

- **SQL:** `cronograma_semanal` (DDL 05, dono em DDL 49), `cronograma_semanal_excecao` (DDL 38), `cronograma_compartilhamento` (DDL 49), `cronograma_equipe` e `cronograma_equipe_membro` (DDL 59), `integracao_token` (DDL 58), `dia_semana` (DDL/DML 01) e o subacesso dos estagiários (DML 08).
- **Backend:** `/api/v1/nord-tool/cronogramaSemanal` (`CronogramaSemanalRead/WriteController`, `CronogramaSemanalServiceImpl`), `/cronogramaSemanal/equipes` (`CronogramaEquipeRead/WriteController`, `CronogramaEquipeServiceImpl`), `/integracoes/tokens` e `/publico/cronograma/{chave}` (`IntegracaoRead/WriteController`, `IntegracaoServiceImpl`), `/statusCronogramaSemanal`; consultas em `query/cronograma-semanal.properties` e `query/integracao.properties`; permissões em `security/Modulo.java`.
- **Frontend:** `pages/Cronograma_semanal.tsx`, `components/cronograma/*` (`ChatDemanda`, `CompartilharItem`, `EquipesModal`, `FiltroPessoas`, `RelatorioIA`), `services/CronogramaSemanalService.ts`, `services/IntegracaoService.ts` e as regras puras em `utils/rotinaDias.ts`, `utils/rascunhoDemanda.ts`, `utils/filtroPessoas.ts`, `utils/compartilhamento.ts` e `utils/integracao.ts`.

## Versões

| Versão | Data | Resumo | Branch | PRs |
|---|---|---|---|---|
| [v1](v1.md) | 2026-10-30 | Registro retroativo do que já existia no código | `docs-inventario-features` | PR_INFRA_LINK |

## Correções

| Data | Branch | O que foi corrigido | PRs |
|---|---|---|---|

## Dependências e impactos

- Usa a **Lugia** (chat de IA, módulo `LUGIA`, ainda sem pasta) para montar demandas: `LugiaService.responderUmaVez`.
- Usa a hierarquia de usuários (`usuario.id_superior`) e as obras (`obra`) do cadastro e da administração, ainda sem pasta.
