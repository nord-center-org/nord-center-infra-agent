# Games

| | |
|---|---|
| Slug | `games` |
| Status | ativa |
| Versão atual | [v26](v26.md) |
| Para continuar | [ROTEIRO.md](ROTEIRO.md) (receita de jogo novo, regras dos próximos jogos e pendências) |
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
  - quem perde a frota inteira está fora e vence a última frota; com 6 minutos de batalha, vence a frota com mais partes intactas (no empate, quem acertou mais);
  - sozinho: Caçada, que é afundar a frota escondida em até 60 tiros. _(v8)_

- **RN-28** Cartas da Virada, com as regras do gênero de descarte por cor ou número:
  - baralho de 108 cartas, 7 por jogador (5 no Rápido); a mesa começa sempre com um número;
  - descarta-se uma carta da mesma cor, número ou símbolo; o Coringa troca a cor; o +4 também, e só vale sem carta da cor da mesa;
  - sem jogada, compra-se uma, e a comprada pode ser jogada na hora se servir;
  - Pular: o próximo perde a vez. Inverter: muda o sentido (com 2 jogadores, vale como Pular). +2/+4: o próximo compra e perde a vez;
  - quem fica com uma carta avisa VIRADA! (seta para cima) até 2 s depois de jogar; sem aviso, compra 2;
  - Empilhamento Caótico: +2/+4 acumulam (+2 sobre +2; +4 sobre qualquer compra), e quem não empilha compra tudo; o 7 troca a mão com quem tem menos cartas e o 0 passa todas as mãos no sentido do jogo. Rápido: 5 cartas e 8 s por vez (20 s nos outros modos; quando o tempo acaba, compra e passa);
  - vence a rodada quem zera a mão e leva os pontos das cartas dos rivais: o número vale o próprio valor, a ação 20 e o coringa 50;
  - sozinho, joga contra 3 bots;
  - quem joga pelo celular vê a própria mão só no celular, e a tela mostra apenas o verso das cartas. _(v9)_

- **RN-29** O direcional e os botões de toque nunca podem ser cancelados como rolagem de página: o direcional acompanha cada dedo pelo identificador e mostra um pino que segue o polegar. O celular usado como controle manda o comando assim que ele muda, repete o estado periodicamente e mostra o que está mandando; um toque rápido numa seta conta uma vez também na tela. _(v10)_
- **RN-30** Cada aparelho guarda as próprias preferências de controle, que valem na hora, inclusive na partida em andamento:
  - as teclas de cada ação, que podem ser trocadas;
  - o controle na tela (automático só em tela de toque, sempre ou nunca);
  - o estilo do direcional (analógico ou setas), o tamanho, o modo canhoto e a vibração;
  - no controle de videogame, a troca de A com B e a sensibilidade do analógico. _(v10)_
- **RN-31** Controles de videogame (Bluetooth ou USB) funcionam em qualquer aparelho:
  - cruz ou analógico andam, A ou X é o botão A, B ou Y é o B e Start pausa;
  - na tela, o 1º controle livre joga junto com quem está nela, e os outros podem entrar como jogadores próprios;
  - no celular usado como controle, o gamepad conectado nele também comanda. _(v10)_

- **RN-32** Jogando com celulares, cada celular mostra o jogo inteiro rodando, com o controle embaixo, e dá para jogar sem TV:
  - a tela de quem hospeda roda a partida e manda os quadros;
  - o celular desenha o mesmo jogo, com sons, efeitos, placar, contagem e as telas de fim;
  - um botão no celular alterna para ver só o controle. _(v11)_
- **RN-33** A transmissão para os celulares não pode gerar custo nem passar por servidores de fora:
  - no mesmo Wi-Fi, a conexão é direta entre os aparelhos (WebRTC só pela rede local, sem STUN/TURN);
  - sem ela, os quadros passam pela sala do NordTool em ritmo menor;
  - o celular mostra o caminho em uso. _(v11)_
- **RN-34** Cada celular recebe só o que o jogador dele pode ver:
  - nas Cartas, só a própria mão;
  - na Guerra Naval, só a própria frota, que aparece somente no celular do dono;
  - nas Bombas, nada do que está escondido nas caixas. _(v11)_

- **RN-35** Horda Zumbi, com as regras do gênero de sobrevivência cooperativa vista de cima:
  - todos juntos contra ondas crescentes de zumbis (normal, corredor e brutamontes);
  - a casa tem 4 portas com 5 tábuas cada; os zumbis quebram as tábuas e quem segura B na porta repõe uma por vez, ganhando dinheiro;
  - os abates dão dinheiro e pontos, gastos nas bancadas: arma (espingarda e depois rifle), vida e dano;
  - quem cai é levantado por um aliado que segure B perto por 2 s; sem ajuda em 30 s, volta na próxima onda; todos no chão encerram a partida;
  - modos: Ondas (até a 10ª; sozinho, até a 5ª), Resgate (levar 3 sobreviventes ao centro da casa) e Chefão (3 ondas e um gigante que investe e chama reforços);
  - a noite é escura e cada jogador ilumina com a lanterna; a mira ajuda a achar o zumbi à frente. _(v12)_

- **RN-36** Fuga da Masmorra, com as regras do gênero roguelite de salas:
  - masmorra sorteada a cada partida, com salas ligadas por portas, do início até o guardião;
  - ao entrar numa sala com monstros (slime, morcego, esqueleto), as portas trancam até todos caírem;
  - a sala do guardião só abre com a chave, que aparece numa sala fora do caminho principal depois de limpa;
  - há baús com melhorias (coração, vida máxima, dano, velocidade), moedas e espinhos que sobem e descem;
  - o jogador ataca com a espada (A) em arco à frente e se esquiva (B), ficando invulnerável por um instante; começa com 3 corações;
  - quem zera vira fantasma e volta com 1 coração quando a sala for limpa; todos fantasmas encerram a fuga;
  - derrotar o guardião vence; no Desafio Diário, a masmorra é a mesma para todos no dia. _(v13)_

- **RN-37** Coroa Maldita, com as regras do gênero de pique-pega de plataforma:
  - visão lateral, com pulo, pulo duplo no ar, descer da plataforma e investida; quem cai em cima de outro jogador o atordoa por meio segundo;
  - modo Coroa: quem encosta em quem está com a coroa rouba (quem acabou de pegar fica protegido por 1 s), quem está com a coroa anda um pouco mais devagar e vence quem somar mais tempo com ela em 90 s;
  - modo Pega-Pega: a bomba passa por toque, explode a cada 20 s e tira do jogo quem está com ela; o último que sobra vence;
  - sozinho: pegar 20 moedas em 60 s. _(v14)_

- **RN-38** Corrida Espacial, com as regras do gênero de naves com inércia:
  - ←/→ giram a nave, A ou ↑ acelera na direção do bico e ↓ freia; sem atrito, a nave segue andando, e o espaço dá a volta nas bordas;
  - planetas puxam pela gravidade, e bater num deles explode a nave, que volta em 2 s; o laser (B) atordoa outra nave por 1 s e quebra asteroides (os grandes se partem);
  - Corrida: passar pelos anéis na ordem durante 2 voltas, vence quem chegar primeiro; Asteroides: mais pontos em 90 s; Coleta: mais cristais em 90 s (explodir ou levar laser faz largar cristais);
  - sozinho, há uma meta: as 2 voltas em 75 s, 1500 pontos ou 25 cristais. _(v15)_

- **RN-39** Torres em Colapso, com as regras do gênero de artilharia por turnos:
  - cada jogador tem uma torre de blocos (madeira 1, pedra 2 e aço 3 de resistência) com o rei no topo;
  - na sua vez (25 s), ajusta o ângulo (←/→) e a força (↑/↓) e atira; o vento muda a cada vez;
  - a explosão enfraquece os blocos em volta, blocos sem apoio caem e a torre desaba;
  - rei atingido pela explosão ou esmagado por um bloco está fora; o último rei de pé vence;
  - a bomba pesada (B) tem raio maior e é uma por partida; sozinho, o objetivo é derrubar 5 alvos em 12 tiros. _(v16)_

- **RN-40** Defesa de Base, com as regras do gênero tower defense cooperativo:
  - os inimigos seguem a estrada até a base; cada um que chega tira vida da base (20); a base zerou, fim de jogo;
  - o ouro é do time: vem dos cristais do mapa (passar por cima) e de cada inimigo derrubado, com bônus no fim de cada onda;
  - num ponto de obra, B ergue a torre escolhida (Flecha rápida, Canhão em área, Gelo que deixa lento) ou melhora a que já existe, até o nível 3; fora do ponto, B troca a torre escolhida;
  - A atira na mão, com mira assistida; blindados e chefões levam menos dano;
  - Cooperativo: aguentar 10 ondas (sozinho, 8), a última com o chefão; Infinito: ondas sem fim, chefão a cada 5, e a rodada fica com quem mais pontuou. _(v17)_

- **RN-41** Pescaria & Submarino, com as regras do gênero (partidas de 3 minutos; vence quem fizer mais pontos e, no empate, quem capturou mais; sozinho, meta de 500 na Pescaria e 400 no Mergulho):
  - Pescaria: ←/→ move o barco e ↑/↓ o anzol; a isca atrai o peixe que passa perto; fisgado, A puxa e B solta a linha; puxar enquanto o peixe briga sobe a tensão e, no limite, a linha arrebenta; linha frouxa por 1,5 s deixa o peixe escapar; peixes grandes brigam mais vezes (fôlego) e valem mais;
  - Mergulho: o oxigênio acaba debaixo d'água (mais rápido no fundo) e enche na superfície; tesouros e peixes caçados com o arpão (A) viram carga, que só pontua entregue na superfície; B dá um impulso que gasta ar; água-viva e tubarão tiram oxigênio (o tubarão caça e leva metade da carga); sem ar, perde a carga e volta à superfície depois de 3 s. _(v18)_

- **RN-42** Corrida do Ouro, com as regras do gênero de mineração (4 minutos; vence quem entregar mais pontos, e no empate quem entregou mais peças; sozinho, meta de 600 na Corrida e 400 na Sobrevivência):
  - o subsolo é de blocos: terra e cascalho (1 golpe), pedra e prata e ouro (2), diamante (3) e rocha dura (não quebra); a picareta (A) cava para o lado em que o mineiro olha;
  - ↑ pula na superfície e, no subsolo, sobe pelo túnel com a corda;
  - minério vai para a carga (até 8 peças), cada peça deixa mais lento, e a carga só pontua no carrinho, que também repõe as 3 dinamites;
  - dinamite (B) explode em 2 s, abre buraco (sem quebrar rocha dura nem minério) e quem estiver perto fica tonto e perde metade da carga;
  - cascalho sem apoio cai; se cair em alguém, atordoa, derruba uma peça e esfarela;
  - Sobrevivência: a lava sobe uma fileira a cada 18 s; quem encosta perde a carga e volta à superfície depois de 5 s. _(v19)_

- **RN-43** Kart Turbo & Balões (3D), com as regras do gênero de kart:
  - o kart acelera sozinho; ←/→ vira, ↓ freia; segurar A numa curva faz drift, que carrega o turbo em três níveis (azul, laranja, roxo), e soltar dispara o turbo; fora da pista o kart fica lento;
  - caixas de item dão míssil (persegue o kart à frente), escudo (segura um golpe), óleo (deixado para trás) ou turbo; B usa; quem está atrás tira itens melhores;
  - Grande Prêmio: 3 voltas, a chegada dá os pontos (10, 8, 6, 5, 4, 3, 2, 1); a corrida acaba quando todos chegam ou 15 s depois do primeiro; sozinho, contra o relógio;
  - Arena de Balões: 3 balões cada; míssil, óleo ou batida de quem está no turbo estoura um; fica quem tiver balão (3 min; no fim vence quem tem mais); sozinho, estoure 10 balões-alvo em 90 s;
  - a câmera segue o próprio kart no celular e quando há só uma pessoa na tela; com várias, mostra a pista inteira. _(v20)_

- **RN-44** Tanques de Aço (3D), com as regras do gênero de tanques em arena:
  - ↑/↓ anda, ←/→ gira o chassi; a torre gira separada e mira sozinha no inimigo à vista mais perto (sem ninguém à vista, acompanha o chassi); A atira, B solta mina;
  - os tiros ricocheteiam nos muros de pedra até 2 vezes e, depois do ricochete, acertam até quem atirou; tiros que se cruzam se anulam; até 3 tiros e 2 minas por tanque;
  - caixotes quebram com 2 tiros (ou com a mina); pedra não quebra; minas armam em 1 s e explodem quando um inimigo passa perto (ou em 25 s), com dano 2 e abrindo os caixotes em volta;
  - 3 de blindagem; Mata-Mata: fica o último; Times (vermelho × azul, número par): fica o time; 3 minutos, no tempo vence quem tiver mais blindagem; sozinho, destrua 10 alvos em 90 s. _(v21)_

- **RN-45** Caos Urbano (3D), numa cidade em grade com prédios (sólidos) e praças (abertas):
  - o carro acelera sozinho; ←/→ vira, ↓ freia e dá ré; A segurado é o nitro (barra que recarrega devagar); B é o freio de mão (derrapa, com marca e fumaça);
  - Fuga Policial: a polícia persegue pelas ruas; a cada 30 s sobe uma estrela (até 5), chegam mais viaturas e elas ficam mais rápidas; parado com viatura colada por 2,5 s, é preso; pontos por tempo livre e 100 a mais para quem termina livre; sozinho, 2 minutos livre;
  - Entrega Expressa: pegar a encomenda passando por cima e levar ao destino (anel verde); de 300 a 50 pontos conforme a demora; 3 min; sozinho, 6 entregas;
  - Derby de Demolição: na praça central cercada; batidas tiram lataria (quem bate mais rápido leva menos dano); fica o último carro; no tempo, mais lataria; sozinho, destruir 6 sucatas em 2 min;
  - Corrida de Rua: 8 postos em sequência; quem completar primeiro vence, com pontos pela chegada; sozinho, contra o relógio. _(v22)_
- **RN-46** Arena Voxel (3D, primeira pessoa), numa arena simétrica de blocos com alturas (borda alta, pilares, coberturas de um nível e a colina no meio):
  - ↑/↓ anda, ←/→ gira a visão; A atira com mira assistida (puxa a mira para o inimigo visível dentro do cone, inclusive na altura); a recarga é sozinha quando o pente acaba; B pula; pular de novo logo ao cair encadeia (até 40% mais rápido); segurar B ao cair desliza por meio segundo, mais rápido e mais baixo;
  - começa com a pistola (munição infinita); rifle, escopeta (6 chumbos, perde força com a distância) e sniper ficam nos pedestais e voltam 10 s depois de pegos; sem munição, volta para a pistola; atirar seguido abre o recuo;
  - 100 de vida; abatido, volta em 3 s no ponto de partida mais longe dos inimigos;
  - Mata-Mata: 10 abates ou 3 min (desempate por menos mortes); Captura de Bandeira (vermelho × azul, número par): levar a bandeira inimiga até a própria base com a sua no lugar, 3 capturas; tocar a própria bandeira caída a devolve; Rei da Colina: só pontua quem está sozinho (ou só o seu time) no topo, 60 pontos; Contra Bots: todos contra 2 + n drones;
  - sozinho, qualquer modo vira Contra Bots: 10 abates em 3 min;
  - a tela de uma pessoa só (o celular dela ou um humano só na tela) mostra a primeira pessoa; com várias pessoas na mesma tela, a arena vista do alto. _(v23)_
- **RN-47** Cozinha Caótica (3D), numa cozinha em grade com caixas de ingredientes, tábuas, fogões, pia, pilha de pratos, retorno, lixeira, entrega e um extintor:
  - setas andam; A pega, solta e junta no prato o que está à frente; B (segurado) corta na tábua, lava na pia ou, com o extintor na mão, apaga o fogo à frente e ao lado;
  - receitas: Salada (alface + tomate picados), Hambúrguer (pão + carne picada e frita), Hambúrguer com salada (+ alface) e Sopa (3 tomates picados cozidos na panela); o prato só aceita o que leva a uma receita;
  - no fogão, a frigideira fica pronta em 5 s e a panela cheia em 7 s; esquecidas, queimam (vira lixo) e depois pegam fogo, que se espalha pelos balcões a cada 4 s até ser apagado;
  - pedidos chegam com prazo (as quatro receitas a cada quatro pedidos); entregar dá a base da receita + gorjeta pelo tempo que sobrou × combo (até 4); vencido tira 10 e zera o combo; o prato volta sujo ao retorno 5 s depois;
  - Cooperativo: 3 min; a 1ª estrela pede 250 pontos com uma pessoa (+40% por pessoa a mais, até 6); 2 e 3 estrelas pedem 1,5× e 2×; com a 1ª estrela, vence quem mais pontuou; Duelo de Cozinhas (número par): vermelho × azul, uma cozinha cada, os mesmos pedidos; mais pontos vence;
  - sozinho: Desafio Solo, 250 pontos em 3 min. _(v24)_
- **RN-48** Batalha de Banda (2D, ritmo), cada pessoa na própria pista de 4 trilhas (← ↓ ↑ →), todos com a mesma partitura gerada pela semente e pelo andamento (Lento 100, Médio 128, Rápido 156 BPM), em cerca de 100 s:
  - a nota cai até a linha; apertar a direção da trilha na hora acerta: perfeito (±50 ms, 100), ótimo (±100 ms, 70) ou bom (±150 ms, 40); nota longa: segurar a direção até o fim soma pontos a cada instante; trilha repetida sempre com meia batida de folga para soltar e apertar;
  - o multiplicador sobe a cada 10 acertos seguidos (até ×4); cada 25 de combo enche um quarto da energia; B com energia pela metade liga o Show (pontos em dobro enquanto a energia escoa);
  - o público (vida) sobe nos acertos e cai nas notas perdidas (e um pouco no toque sem nota, que também quebra o combo); zerado, quem toca é vaiado e sai;
  - Solo: terminar a música sem ser vaiado e com 70% de acertos; Duelo: A com o ataque cheio (20 acertos) manda ao líder adversário neblina, notas aceleradas ou trilhas espelhadas por 6 s; vence quem tiver mais pontos sem ser vaiado (ou o último em pé); Banda: o público é um só e todos somam; a banda vence se terminar a música;
  - a música (bateria, baixo e a melodia das notas acertadas) é tocada pelo próprio jogo no compasso das notas; a tela de uma pessoa só (o celular dela) mostra só a própria pista. _(v25)_
- **RN-49** Chefão Colossal (2D), arena vista de cima contra um chefe gigante (Golem de Pedra, Hidra do Pântano ou Máquina de Guerra):
  - setas andam; A atira com mira sozinha (lacaio colado, pilares do escudo, lacaios por perto, o chefe); B é a esquiva: arrancada invulnerável, com 1,5 s de recarga;
  - todo ataque é avisado no chão antes de machucar: martelo em área, raio em linha, onda em anel com uma brecha (verde) e investida; a rajada de balas é lenta; cada chefe prefere uns ataques;
  - três fases (100%, 66% e 33% da vida): cada uma ergue de novo o escudo de 3 pilares (com pilar de pé, o tiro no chefe não tira vida), ataca mais rápido e com mais área; na 3ª, o chefe chama lacaios;
  - 4 corações por pessoa; caído, um aliado parado perto por 2 s o levanta com 2 corações; sozinho, 3 vidas;
  - Cooperativo: derrubar o chefe antes de todos caírem ao mesmo tempo (6 min); Competitivo (2 ou mais): todos contra o chefe, caído volta sozinho em 5 s perdendo 25 pontos, e vence quem mais pontuou (dano, pilares e lacaios) se o chefe cair; Boss Rush: três chefes seguidos, cada um com mais vida e ataques mais rápidos. _(v26)_

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
| [v8](v8.md) | 2026-11-22 | Guerra Naval (batalha naval por turnos, até 8 frotas) | `feature-games-v8` | [frontend#220](https://github.com/nord-center-org/nord-tool-frontend/pull/220), [infra#90](https://github.com/nord-center-org/nord-center-infra-agent/pull/90) |
| [v9](v9.md) | 2026-11-22 | Cartas da Virada (descarte por cor ou número, mão no celular) | `feature-games-v9` | [frontend#221](https://github.com/nord-center-org/nord-tool-frontend/pull/221), [infra#91](https://github.com/nord-center-org/nord-center-infra-agent/pull/91) |
| [v10](v10.md) | 2026-11-22 | Controles configuráveis, controle de videogame e direcional do celular mais firme | `feature-games-v10` | [frontend#222](https://github.com/nord-center-org/nord-tool-frontend/pull/222), [infra#92](https://github.com/nord-center-org/nord-center-infra-agent/pull/92) |
| [v11](v11.md) | 2026-11-22 | O jogo inteiro em cada celular (espelho por conexão direta no Wi-Fi) | `feature-games-v11` | [backend#136](https://github.com/nord-center-org/nord-tool-backend/pull/136), [frontend#223](https://github.com/nord-center-org/nord-tool-frontend/pull/223), [infra#93](https://github.com/nord-center-org/nord-center-infra-agent/pull/93) |
| [v12](v12.md) | 2026-11-22 | Horda Zumbi (sobrevivência cooperativa, 1 a 8) | `feature-games-v12` | [frontend#224](https://github.com/nord-center-org/nord-tool-frontend/pull/224), [infra#95](https://github.com/nord-center-org/nord-center-infra-agent/pull/95) |
| [v13](v13.md) | 2026-11-22 | Fuga da Masmorra (roguelite de salas em equipe, 1 a 8) | `feature-games-v13` | [frontend#225](https://github.com/nord-center-org/nord-tool-frontend/pull/225), [infra#96](https://github.com/nord-center-org/nord-center-infra-agent/pull/96) |
| [v14](v14.md) | 2026-11-22 | Coroa Maldita (pique-pega de plataforma, coroa e bomba) | `feature-games-v14` | [frontend#226](https://github.com/nord-center-org/nord-tool-frontend/pull/226), [infra#97](https://github.com/nord-center-org/nord-center-infra-agent/pull/97) |
| [v15](v15.md) | 2026-11-22 | Corrida Espacial (inércia, gravidade, anéis, asteroides e cristais) | `feature-games-v15` | [frontend#227](https://github.com/nord-center-org/nord-tool-frontend/pull/227), [infra#98](https://github.com/nord-center-org/nord-center-infra-agent/pull/98) |
| [v16](v16.md) | 2026-11-22 | Torres em Colapso (artilharia por turnos com vento e torres que desabam) | `feature-games-v16` | [frontend#228](https://github.com/nord-center-org/nord-tool-frontend/pull/228), [infra#99](https://github.com/nord-center-org/nord-center-infra-agent/pull/99) |
| [v17](v17.md) | 2026-11-22 | Defesa de Base (tower defense cooperativo com torres, cristais e chefão) | `feature-games-v17` | [frontend#229](https://github.com/nord-center-org/nord-tool-frontend/pull/229), [infra#100](https://github.com/nord-center-org/nord-center-infra-agent/pull/100) |
| [v18](v18.md) | 2026-11-22 | Pescaria & Submarino (linha com tensão; mergulho com oxigênio, arpão e tesouros) | `feature-games-v18` | [frontend#230](https://github.com/nord-center-org/nord-tool-frontend/pull/230), [infra#101](https://github.com/nord-center-org/nord-center-infra-agent/pull/101) |
| [v19](v19.md) | 2026-11-22 | Corrida do Ouro (picareta, dinamite, carga, cascalho e lava) | `feature-games-v19` | [frontend#231](https://github.com/nord-center-org/nord-tool-frontend/pull/231), [infra#102](https://github.com/nord-center-org/nord-center-infra-agent/pull/102) |
| [v20](v20.md) | 2026-11-23 | Kart Turbo & Balões em 3D (drift com turbo, itens, Grande Prêmio e arena) | `feature-games-v20` | [frontend#234](https://github.com/nord-center-org/nord-tool-frontend/pull/234), [infra#105](https://github.com/nord-center-org/nord-center-infra-agent/pull/105) |
| [v21](v21.md) | 2026-11-23 | Tanques de Aço em 3D (ricochete, caixotes, minas, Mata-Mata e Times) | `feature-games-v21` | [frontend#235](https://github.com/nord-center-org/nord-tool-frontend/pull/235), [infra#106](https://github.com/nord-center-org/nord-center-infra-agent/pull/106) |
| [v22](v22.md) | 2026-11-23 | Caos Urbano em 3D (fuga, entregas, derby e corrida numa cidade) | `feature-games-v22` | [frontend#236](https://github.com/nord-center-org/nord-tool-frontend/pull/236), [infra#107](https://github.com/nord-center-org/nord-center-infra-agent/pull/107) |
| [v23](v23.md) | 2026-11-23 | Arena Voxel em 3D (tiro em primeira pessoa: pulo encadeado, deslize, quatro armas e quatro modos) | `feature-games-v23` | [frontend#237](https://github.com/nord-center-org/nord-tool-frontend/pull/237), [infra#108](https://github.com/nord-center-org/nord-center-infra-agent/pull/108) |
| [v24](v24.md) | 2026-11-23 | Cozinha Caótica em 3D (pedidos, corte, fogão, fogo, pia; Cooperativo e Duelo) | `feature-games-v24` | [frontend#238](https://github.com/nord-center-org/nord-tool-frontend/pull/238), [infra#109](https://github.com/nord-center-org/nord-center-infra-agent/pull/109) |
| [v25](v25.md) | 2026-11-23 | Batalha de Banda (ritmo em 4 trilhas com música gerada, Show, Duelo com obstáculos e Banda) | `feature-games-v25` | [frontend#239](https://github.com/nord-center-org/nord-tool-frontend/pull/239), [infra#110](https://github.com/nord-center-org/nord-center-infra-agent/pull/110) |
| [v26](v26.md) | 2026-11-23 | Chefão Colossal (chefe em três fases, ataques avisados, escudo de pilares, esquiva; Cooperativo, Competitivo e Boss Rush) — fecha o catálogo | `feature-games-v26` | frontend (link no PR), infra (este PR) |

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
