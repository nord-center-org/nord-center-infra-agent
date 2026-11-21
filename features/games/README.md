# Games

| | |
|---|---|
| Slug | `games` |
| Status | ativa |
| Versão atual | [v2](v2.md) |
| Repositórios | nord-tool-scripts-sql, nord-tool-backend, nord-tool-frontend |
| Onde no app | Individual > Games (`/gestao/games`) |

## O que faz

A Central de Jogos do NordTool, no estilo launcher. Mostra 21 jogos com capas, filtros, favoritos e detalhes. Dá para jogar sozinho contra bots, no celular (modo portátil) e, a partir da fase 3, com até 8 celulares como controle. A especificação foi estruturada pelo Lugia Ark, assistente do Nick, e é entregue em fases.

## Regras de negócio vigentes

- **RN-01** Nenhum arquivo de imagem ou de som. Capas, cenários, personagens, efeitos e músicas são gerados por código (Canvas, Three.js e Web Audio). Um teste do frontend falha se aparecer arquivo de mídia nas pastas dos jogos. _(v1)_
- **RN-02** Regras e jogabilidade iguais às dos jogos de referência de cada gênero. Nomes, personagens, arte, mapas e sons são próprios do NordTool; nenhum nome comercial aparece nos jogos. _(v1)_
- **RN-03** Os personagens são os avatares pixel do NordTool. P1 a P8 têm cores fixas (vermelho, azul, verde, amarelo, roxo, laranja, ciano e rosa). O P1 é quem está jogando; cada bot tem um avatar fixo por vaga. _(v1)_
- **RN-04** A aba depende do acesso GAMES. O perfil padrão já vem liberado. _(v1)_
- **RN-05** Os bots têm três dificuldades, Fácil, Médio e Difícil, com tempo de reação, erros e agressividade diferentes. _(v1)_
- **RN-06** No celular sem teclado aparecem o direcional e os botões virtuais. Um toque rápido nunca se perde. _(v1)_
- **RN-07** Bombas Táticas, com as regras do gênero de bombas em grade:
  - pavio de 2,5 s;
  - chama em cruz que para no pilar e na primeira caixa;
  - reação em cadeia;
  - power-ups: bomba, fogo, patins, chute, luva, detonador, escudo, fogo total e caveira;
  - morte súbita em espiral no último minuto;
  - modos Sobrevivência, Times (vagas ímpares contra pares) e Caça às Moedas (2 min; morrer derruba até 3 moedas);
  - biomas Fábrica, Gelo e Vulcão;
  - 2 a 8 jogadores. _(v1)_
- **RN-08** Cada partida jogada por quem está logado vai para a própria conta: jogo, modo, pontos, vitória, colocação, jogadores, bots, dificuldade e duração. Nunca se registra partida em nome de outra pessoa. _(v2)_
- **RN-09** Pontos do Bombas Táticas: 100 por rodada vencida + 300 por vencer a partida + 25 por adversário, vezes o peso dos bots (Fácil 1, Médio 2, Difícil 3; sem bots, 2). O recorde é a maior pontuação numa partida. _(v2)_
- **RN-10** Ranking de cada jogo: top 10 das pessoas ativas, por vitórias, depois recorde, depois menos partidas. _(v2)_
- **RN-11** Nove conquistas, ganhas uma vez só: Primeiro controle, Primeira vitória, Dez na conta, Veterano (50 vitórias), Maratonista (100 partidas), Explorador (5 jogos), Sem moleza (vencer no Difícil), Casa cheia (vencer com 8) e Campeão da Copa. _(v2)_
- **RN-12** Modo Copa: 3, 5 ou 7 partidas com as mesmas vagas. Pontos por colocação 10, 7, 5, 3, 2, 1, 1, 1; o vencedor da partida é o 1º e os demais vão pelas vitórias de rodada (empate divide a colocação). Desempate da Copa: mais 1º lugares, depois mais 2º, depois a ordem das vagas. O fim mostra o pódio e salva a Copa no histórico. _(v2)_
- **RN-13** Os favoritos da Central ficam na conta (até 21), com cópia no navegador. Se a conta ainda não tem favoritos, os do navegador sobem para ela. _(v2)_

## Onde está no código

- **Frontend:**
  - `pages/Games.tsx`;
  - `components/games/`: `motor2d`, `audio`, `entrada`, `central` e `jogos/<jogo>`;
  - `utils/games/`: regras puras, com teste.
- **Backend:** `Modulo.GAMES`; `GameServiceImpl`, `GameRepositoryImpl`, `query/game.properties` e os controllers em `/api/v1/nord-tool/games` (`partidas`, `resumo`, `conquistas`, `favoritos`, `copas`).
- **SQL:** `DML/10.acesso_games_dml.sql`; `DDL/77.games_ddl.sql` (`game_partida`, `game_conquista`, `game_favorito`, `game_copa`).

## Versões

| Versão | Data | Resumo | Branch | PRs |
|---|---|---|---|---|
| [v1](v1.md) | 2026-11-21 | Fase 1: Central de Jogos, motor 2D, sintetizador e Bombas Táticas contra bots | `feature-games` | [sql#81](https://github.com/nord-center-org/nord-tool-scripts-sql/pull/81), [backend#132](https://github.com/nord-center-org/nord-tool-backend/pull/132), [frontend#212](https://github.com/nord-center-org/nord-tool-frontend/pull/212), [infra#82](https://github.com/nord-center-org/nord-center-infra-agent/pull/82) |
| [v2](v2.md) | 2026-11-21 | Fase 2: recordes, ranking, conquistas, histórico, favoritos na conta e Modo Copa | `feature-games-v2` | [sql#82](https://github.com/nord-center-org/nord-tool-scripts-sql/pull/82), [backend#133](https://github.com/nord-center-org/nord-tool-backend/pull/133), [frontend#213](https://github.com/nord-center-org/nord-tool-frontend/pull/213), infra (este PR) |

## Correções

| Data | Branch | O que foi corrigido | PRs |
|---|---|---|---|

## Dependências e impactos

Usa os avatares pixel (`utils/avatarPixel.ts`, `utils/avatar.ts`, `AvatarService`) e o `three` (já usado na Escadinha) a partir da fase 4. O backend ganha WebSocket na fase 3.

## Plano por fases

| Fase | Entrega |
|---|---|
| 1 | Central, motor 2D, sintetizador e Bombas Táticas contra bots |
| 2 | Recordes, conquistas, ranking, histórico e Modo Copa (backend) |
| 3 | Multiplayer: celular como controle, sala com código curto e QR Code, até 8 jogadores (WebSocket) |
| 4 | Motor 3D e Sumô dos Hexágonos |
| 5 | Cartas da Virada, Duelo ao Meio-Dia, Encaixe Versus e Guerra Naval |
| 6 | Horda Zumbi, Fuga da Masmorra, Coroa Maldita e Corrida Espacial |
| 7 | Torres em Colapso, Defesa de Base, Pescaria & Submarino e Corrida do Ouro |
| 8 | Kart Turbo & Balões, Tanques de Aço e Caos Urbano |
| 9 | Arena Voxel, Cozinha Caótica, Batalha de Banda e Chefão Colossal |
| 10 | Acabamento: balanceamento, desempenho, acessibilidade e ajustes no app Android |
