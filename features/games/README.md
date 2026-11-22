# Games

| | |
|---|---|
| Slug | `games` |
| Status | ativa |
| Versão atual | [v8](v8.md) |
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
- **RN-14** Multiplayer: a tela grande abre uma sala (código de 4 letras, sem O/0/I/1, e QR Code) e roda o jogo. Até 8 jogadores entram pelo celular, cada um logado na própria conta com acesso GAMES, e o celular vira o controle. Os bots completam as vagas. _(v3)_
- **RN-15** Cada conexão abre com um bilhete de uso único (60 s) emitido para quem está logado. Quem cair volta para a mesma vaga pelo mesmo código; o mesmo usuário em outro aparelho derruba a conexão anterior. _(v3)_
- **RN-16** Limites da sala: mensagens de até 2 KB e 90 por segundo por conexão; uma sala hospedada por pessoa (abrir outra fecha a anterior); no máximo 500 salas; sala sem ninguém conectado fecha em 10 min e qualquer sala em 6 h. As salas vivem só na memória do backend. _(v3)_
- **RN-17** No multiplayer, cada celular registra a própria partida na própria conta. A tela registra a sua só se também jogou; se só hospedou, a Copa não entra no histórico de ninguém. _(v3)_
- **RN-18** Todos os jogos, sem exceção, vão de 1 a 8 jogadores: sozinho (contra bots ou num desafio solo) até 8. O teste do catálogo falha se algum jogo fugir disso. _(v4)_
- **RN-19** Bombas Táticas sozinho (0 bots): Sobrevivência vira o Desafio (explodir todas as caixas antes do tempo, sem cair) e Caça às Moedas vira a meta de 10 moedas em 2 minutos. Cada tentativa fecha a partida e vai para a conta. A quantidade de bots é escolhida de 0 a 7, até completar 8 na arena. _(v4)_
- **RN-20** Modo Tela: o tablet, a TV ou o computador vira o servidor da jogatina, com a sala aberta, o QR Code e o código em tamanho grande. Por padrão a tela não joga (dá para marcar "Eu também jogo nesta tela"); ao sair do Modo Tela, a sala fecha. _(v4)_
- **RN-21** Os personagens dos jogos são os avatares de corpo inteiro, no estilo pixel do NordTool: a cabeça do avatar da pessoa, a roupa da função e o corpo desenhados por código, com animações de parado, andando nas 4 direções (de costas quando sobe), caindo e comemorando. _(v4)_
- **RN-22** Sumô dos Hexágonos (3D), com as regras do gênero: na Queda, o piso pisado brilha, racha e cai cerca de 0,7 s depois; são 3 camadas, quem cai vai para a de baixo e quem cai da última está fora. No Sumô, uma camada só, cuja borda desmorona a cada 7 s, e o dash (com recarga) empurra os rivais para fora. Pulo atravessa buracos. Vence o último em pé; no fim do tempo, quem estiver mais alto. Sozinho: sobreviver 60 s. _(v5)_
- **RN-23** Todo jogo novo usa a mesma moldura de partida (rodadas, contagem, pausa, placar, fim, Copa, recorde e controles de teclado, toque e celular) e entra no registro de jogos jogáveis com modos, modo solo, cenários e os rótulos dos botões A/B. Um teste falha se o catálogo e o registro divergirem ou se faltar modo solo. _(v5)_
- **RN-24** Encaixe Versus, com as regras do gênero:
  - tabuleiro 10 × 20; as 7 peças vêm em sacos de 7, na mesma sequência para todos;
  - rotação com chutes de parede, segurar peça (uma vez por peça), fantasma, queda rápida e suave, repetição ao segurar a seta e atraso de trava;
  - Versus: 2 linhas mandam 1 de lixo, 3 mandam 2 e 4 mandam 4, mais bônus de combo, de 4 linhas seguidas e de tabuleiro limpo. O lixo vai para os rivais em rodízio, limpar linhas cancela o lixo pendente, e quem chega ao topo está fora;
  - Sprint: 40 linhas. Sozinho: Maratona (50 linhas, a velocidade sobe a cada 10) ou Sprint;
  - placar do próprio jogo vai para o recorde. _(v6)_
- **RN-25** Nos controles, um toque rápido numa seta conta como um movimento, mesmo se soltar antes do próximo passo, como já acontecia com os botões. _(v6)_

- **RN-26** Duelo ao Meio-Dia, com as regras do gênero de reflexo:
  - todos esperam o sinal "FOGO!", que sai num momento aleatório; quem atira antes queima a largada e perde a vez na rodada;
  - fintas (pássaro, foguete, sino) aparecem antes do sinal para enganar;
  - o tiro só vale segurando a direção contra o vento mostrado na bandeira; vence quem acerta primeiro;
  - Duelo: até 8 de uma vez, cada um com a sua garrafa. Torneio: chave eliminatória em pares até o campeão. Sozinho: Treino de reflexo com 5 tiros, e média abaixo de 450 ms vence;
  - pontos por reação (1000 − ms, mínimo 50) vão para o recorde. _(v7)_

- **RN-27** Guerra Naval, com as regras do gênero de batalha naval:
  - cada frota tem 5 navios (5, 4, 3, 3 e 2) sorteados numa grade 10 × 10, sem se encostarem; com 5 ou mais frotas, 4 navios (4, 3, 3 e 2);
  - na sua vez, mira-se numa frota rival e atira-se: água, acerto ou "afundou", sempre anunciado;
  - Clássico: um tiro por vez. Salva: um tiro por navio de pé. Especiais: mais um sonar (conta partes intactas num 3 × 3) e um bombardeio em cruz (5 casas), uma vez cada; usar um especial gasta a vez;
  - a vez tem 20 s (na Salva, 40 s); se acabar, sai um tiro automático;
  - quem perde a frota inteira está fora e vence a última frota; com 6 minutos de batalha, vence a frota com mais partes intactas;
  - sozinho: Caçada, que é afundar a frota escondida em até 60 tiros. _(v8)_

## Onde está no código

- **Frontend:**
  - `pages/Games.tsx`;
  - `components/games/`: `motor2d`, `audio`, `entrada`, `central` e `jogos/<jogo>`;
  - `utils/games/`: regras puras, com teste.
- **Backend:** `Modulo.GAMES`; `GameServiceImpl`, `GameRepositoryImpl`, `query/game.properties` e os controllers em `/api/v1/nord-tool/games` (`partidas`, `resumo`, `conquistas`, `favoritos`, `copas`).
- **SQL:** `DML/10.acesso_games_dml.sql`; `DDL/77.games_ddl.sql` (`game_partida`, `game_conquista`, `game_favorito`, `game_copa`).
- **Multiplayer (v3):** `GameSalaServiceImpl`, `websocket/GameSalaWebSocketHandler`, `config/WebSocketConfig` e `POST /games/salas`; no frontend, `pages/GamesControle.tsx`, `components/games/rede/ClienteSala.ts`, `components/games/central/SalaPainel.tsx`, `utils/games/sala.ts` e `utils/games/qrcode.ts`.
- **Base dos jogos e 3D (v5):** `components/games/comum/MolduraPartida.tsx` (moldura + contrato `MotorJogo`), `utils/games/registroJogos.ts`, `utils/games/hexagonos.ts` (regras) e `components/games/jogos/hexagonos/` (motor 3D e tela).
- **Visual e corpo (v4):** `utils/games/corpo.ts` (avatar de corpo inteiro), `components/games/central/sprites.ts` (`folhaDoCorpo`, `desenharCorpo`), `AvatarCorpo.tsx`, `FundoGamer.tsx`, `ConfigPartida.tsx`, `ModoTela.tsx` e `utils/games/configBombas.ts`.

## Versões

| Versão | Data | Resumo | Branch | PRs |
|---|---|---|---|---|
| [v1](v1.md) | 2026-11-21 | Fase 1: Central de Jogos, motor 2D, sintetizador e Bombas Táticas contra bots | `feature-games` | [sql#81](https://github.com/nord-center-org/nord-tool-scripts-sql/pull/81), [backend#132](https://github.com/nord-center-org/nord-tool-backend/pull/132), [frontend#212](https://github.com/nord-center-org/nord-tool-frontend/pull/212), [infra#82](https://github.com/nord-center-org/nord-center-infra-agent/pull/82) |
| [v2](v2.md) | 2026-11-21 | Fase 2: recordes, ranking, conquistas, histórico, favoritos na conta e Modo Copa | `feature-games-v2` | [sql#82](https://github.com/nord-center-org/nord-tool-scripts-sql/pull/82), [backend#133](https://github.com/nord-center-org/nord-tool-backend/pull/133), [frontend#213](https://github.com/nord-center-org/nord-tool-frontend/pull/213), [infra#83](https://github.com/nord-center-org/nord-center-infra-agent/pull/83) |
| [v3](v3.md) | 2026-11-21 | Fase 3: multiplayer com o celular como controle (WebSocket, QR Code, reconexão, até 8) | `feature-games-v3` | [backend#134](https://github.com/nord-center-org/nord-tool-backend/pull/134), [frontend#214](https://github.com/nord-center-org/nord-tool-frontend/pull/214), [infra#84](https://github.com/nord-center-org/nord-center-infra-agent/pull/84) |
| [v4](v4.md) | 2026-11-21 | Modo Tela (servidor), avatares de corpo inteiro animados, 1 a 8 em todos os jogos (Bombas sozinho) e visual gamer | `feature-games-v4` | [frontend#216](https://github.com/nord-center-org/nord-tool-frontend/pull/216), [infra#86](https://github.com/nord-center-org/nord-center-infra-agent/pull/86) |
| [v5](v5.md) | 2026-11-21 | Motor 3D e Sumô dos Hexágonos; base genérica dos jogos (moldura, registro) | `feature-games-v5` | [frontend#217](https://github.com/nord-center-org/nord-tool-frontend/pull/217), [infra#87](https://github.com/nord-center-org/nord-center-infra-agent/pull/87) |
| [v6](v6.md) | 2026-11-21 | Encaixe Versus (puzzle de peças que caem, até 8) | `feature-games-v6` | [frontend#218](https://github.com/nord-center-org/nord-tool-frontend/pull/218), [infra#88](https://github.com/nord-center-org/nord-center-infra-agent/pull/88) |
| [v7](v7.md) | 2026-11-22 | Duelo ao Meio-Dia (reflexo de faroeste, duelo, torneio e treino) | `feature-games-v7` | [frontend#219](https://github.com/nord-center-org/nord-tool-frontend/pull/219), [infra#89](https://github.com/nord-center-org/nord-center-infra-agent/pull/89) |
| [v8](v8.md) | 2026-11-22 | Guerra Naval (batalha naval por turnos, até 8 frotas) | `feature-games-v8` | frontend (link no PR), infra (este PR) |

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
