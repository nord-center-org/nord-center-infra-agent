# Controle de chaves

| | |
|---|---|
| Slug | `controle-chaves` |
| Status | ativa |
| Versão atual | [v1](v1.md) (retroativa) |
| Repositórios | nord-tool-scripts-sql, nord-tool-backend, nord-tool-frontend |
| Onde no app | Organizacional > Controle de chaves (`/organizacional/controle-chaves`) |

## O que faz

Registra quem retirou e quem devolveu as chaves dos apartamentos e as ferramentas da obra. Quem está no quadro registra a retirada, escolhendo o item e a pessoa que leva, e depois confirma o recebimento. A tela mostra os indicadores do quadro, as retiradas em aberto separadas entre chaves e ferramentas e o histórico completo, com busca e filtros.

## Regras de negócio vigentes

Todas registradas a partir do código de 2026-10-30; o porquê das decisões antigas não foi registrado.

- **RN-01** Uma retirada é de um único item: a chave de um apartamento (`APARTAMENTO`) ou uma ferramenta (`FERRAMENTA`). O item precisa combinar com o tipo, e informar os dois é recusado. _(v1)_
- **RN-02** Quem retira é escolhido entre os usuários ativos. Quem libera é sempre o usuário logado; um `idUserLiberacao` enviado no corpo é ignorado. _(v1)_
- **RN-03** O item precisa estar nas fases que a pessoa pode ver, na obra escolhida no topo da tela. A ferramenta sem fase vale para todos e só entram as ferramentas ativas. _(v1)_
- **RN-04** A retirada nasce `ABERTO`, com a data e a hora do servidor e um código `RET-` seguido de até 6 dígitos tirados do relógio; o código é único. _(v1)_
- **RN-05** Só uma retirada `ABERTO` pode ser recebida. Quem recebe é sempre o usuário logado, o servidor grava a data e a hora e o status passa a `RECEBIDO`. Se outra pessoa receber antes, a segunda tentativa é recusada. _(v1)_
- **RN-06** O status precisa combinar com os dados de recebimento: `ABERTO` sem recebedor e sem data, `RECEBIDO` com os dois. Uma retirada inconsistente gera erro ao ser lida ou recebida. _(v1)_
- **RN-07** Os indicadores da tela são calculados no navegador. **Em campo** são as retiradas abertas (chaves e ferramentas). **No quadro** são os apartamentos ainda não entregues mais as ferramentas ativas que não estão em campo. **Entregues** são os apartamentos com status de vistoria `APROVADO` ou `APROVADO DAT`. Com um filtro de obra, as ferramentas ficam fora de "Em campo" e de "No quadro", porque o filtro olha o código do apartamento. _(v1)_
- **RN-08** O histórico permite buscar por apartamento, ferramenta, quem retirou ou código e filtrar por status (Aberta ou Recebida). Cada coluna tem filtro e ordenação; a lista mostra 20 por página (ou todas), com as abertas primeiro. _(v1)_
- **RN-09** O filtro de obra do controle de chaves é escolhido em Configurações (`/configuracoes`) e fica guardado no navegador como prefixo (`N1`, `N2` ou `EN`). Ele não depende do seletor de obra do topo. _(v1)_
- **RN-10** As retiradas antigas foram importadas de planilha com códigos `HIST-NNNN` e horários nominais de 08:00 (retirada) e 17:00 (recebimento). As pessoas da base antiga (`users`) aparecem pelo nome antigo quando não há usuário novo correspondente. _(v1)_
- **RN-11** Consultar exige `CONTROLE_CHAVES` LEITURA; registrar retirada e recebimento exige ESCRITA. A tela não esconde os botões, e o servidor recusa quem não tem permissão. _(v1)_

## Onde está no código

- **SQL:** `requisicoes_chaves` (DDL 10; colunas de usuário da base única em DDL 42), `apartamento_vistoria`, `ferramentas` (DDL 11), fases nos módulos (DDL 45) e a importação histórica (DML 03).
- **Backend:** `/api/v1/nord-tool/controleChaves` (`ControleChavesRead/WriteController`, `ControleChavesServiceImpl`), consultas em `query/controle-chaves.properties`, enums `StatusRequisicaoChaveEnum` e `TipoItemControleChavesEnum` e escopo de fase em `ContextoFaseServiceImpl`.
- **Frontend:** `pages/Controle_de_chaves.tsx`, `services/ControleChavesService.ts`, `utils/preferenciasControleChaves.ts` e a escolha da obra em `pages/Settings.tsx`.

## Versões

| Versão | Data | Resumo | Branch | PRs |
|---|---|---|---|---|
| [v1](v1.md) | 2026-10-30 | Registro retroativo do que já existia no código | `docs-inventario-features` | PR_INFRA_LINK |

## Correções

| Data | Branch | O que foi corrigido | PRs |
|---|---|---|---|

## Dependências e impactos

- Lê os apartamentos e o status de vistoria das **entregas e apartamentos** (`apartamento_vistoria`, ainda sem pasta) para o quadro e os entregues.
- Lê as **ferramentas** do cadastro (`ferramentas`, tela de cadastros, ainda sem pasta).
- Depende do escopo de fases e obras da administração (`ContextoFaseService`).
