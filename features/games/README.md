# Games

| | |
|---|---|
| Slug | `games` |
| Status | ativa |
| Versão atual | [v1](v1.md) |
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

## Onde está no código

- **Frontend:**
  - `pages/Games.tsx`;
  - `components/games/`: `motor2d`, `audio`, `entrada`, `central` e `jogos/<jogo>`;
  - `utils/games/`: regras puras, com teste.
- **Backend:** `Modulo.GAMES`.
- **SQL:** `DML/10.acesso_games_dml.sql`.

## Versões

| Versão | Data | Resumo | Branch | PRs |
|---|---|---|---|---|
| [v1](v1.md) | 2026-11-21 | Fase 1: Central de Jogos, motor 2D, sintetizador e Bombas Táticas contra bots | `feature-games` | [sql#81](https://github.com/nord-center-org/nord-tool-scripts-sql/pull/81), [backend#132](https://github.com/nord-center-org/nord-tool-backend/pull/132), [frontend#212](https://github.com/nord-center-org/nord-tool-frontend/pull/212), infra#PRINFRA |

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
