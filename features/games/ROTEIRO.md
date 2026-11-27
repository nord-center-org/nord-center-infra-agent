# Games — roteiro para continuar (qualquer agente)

Documento de passagem de trabalho. Quem continuar o desenvolvimento dos Games (Claude, Lugia Nexus ou outro agente) deve ler este arquivo **inteiro** antes de começar, junto com as regras do [README](README.md) e as versões já entregues (`v1.md` em diante).

## Combinado com o Nick (dono)

- **Uma versão por jogo:** cada jogo é uma versão da feature `games`, com a branch `feature-games-vN` (a mesma em todos os repositórios tocados), um `vN.md` nesta pasta e as regras novas (RN) no README.
- **Regras e jogabilidade iguais às do gênero de referência**, sem copiar nomes, personagens, arte, música, fases nem o visual de um jogo existente.
- **Nada de arquivos de imagem ou áudio:** tudo é gerado por código, com canvas 2D ou three.js e o sintetizador em `components/games/audio/sintetizador.ts`.
- **Todos os jogos de 1 a 8 jogadores:** sozinho (com um desafio próprio ou contra bots), contra bots Fácil/Médio/Difícil e com celulares.
- **Os personagens são os avatares de corpo inteiro** (`sprites.ts`: `folhaDoCorpo` e `desenharCorpo`).
- **Sem custo adicional:** nada de serviço pago nem servidor de fora.
- **Novidade em toda entrega visível:** cada entrega ganha uma entrada no topo de `src/react-app/utils/novidades.ts`.
- **Fluxo de Git** (`policies/`):
  - nunca commitar em `develop`;
  - abrir PR para `develop`;
  - fazer squash merge quando o CI estiver verde;
  - mergear na ordem SQL → backend → frontend → infra.
- **Antes de abrir o PR**, rodar `npx tsc -b`, `npm test` (todo arquivo de teste novo entra no script `test` do `package.json`) e `npx eslint`. Depois, fazer um e2e com Playwright contra o backend local.

## Receita de um jogo novo (frontend)

Os seis primeiros jogos seguem este molde. A Guerra Naval (`naval`) e as Cartas (`cartas`) são bons exemplos para copiar.

1. **Regras puras em `src/react-app/utils/games/<id>.ts`**, sem DOM e com 60 passos por segundo:
   - `novaPartidaX({ modo, semente, jogadores: [{ bot }] })`;
   - `passoX(estado, entradas: Entrada[])`, que limpa e preenche `estado.eventos` a cada passo;
   - o sorteio sai de `rng(semente)` de `bombas.ts`, para a partida ser determinística;
   - os bots ficam no mesmo arquivo;
   - a pontuação é uma função `pontosX`.
2. **Testes em `utils/games/<id>.test.ts`**, com `import { test } from "node:test"` e `assert from "node:assert/strict"`. Os imports levam a extensão `.ts`, e o arquivo entra no script `test` do `package.json`.
3. **Motor em `components/games/jogos/<id>/motor<X>.ts`**:
   - `criarMotorX(caixa, vagas, modo, cenario, ganchos): MotorJogo` (contrato em `comum/MolduraPartida.tsx`), com `iniciarRodada`, `passo`, `desenhar`, `placar`, `redimensionar` e `destruir`;
   - **Espelho** (o jogo em cada celular): `quadro(para)` devolve `serializar({...estado, eventos: []})`, sem segredos de quem não é `para`; `tirarEventos()` devolve os eventos acumulados desde o último quadro; `aplicar(s, eventos)` faz o estado virar `desserializar(s)` e roda os efeitos dos eventos;
   - os efeitos (som e partículas) ficam numa função `efeitosDoPasso(e)`, chamada no `passo` e no `aplicar`;
   - `ganchos.morte(i)` e `ganchos.vibrarLocal(i, ms)` fazem o celular vibrar; `vagas[i].privada` marca a tela que é só daquele jogador.
4. **Invólucro em `jogos/<id>/<Nome>.tsx`:** `MolduraPartida` com título, modo, detalhe, os botões A/B e a ajuda do teclado (ver `GuerraNaval.tsx`).
5. **Ligações:**
   - em `utils/games/registroJogos.ts`, uma entrada em `JOGAVEIS` com os modos (pelo menos um com `rotuloSolo` e `regraSolo`), os cenários e os botões;
   - em `utils/games/catalogo.ts`, `disponivel: true` e as regras e controles reais;
   - em `pages/Games.tsx`, o `lazy(...)` e um ramo `partida.jogo === "<id>"`;
   - em `components/games/jogos/fabricas.ts`, um `case` para o celular montar o motor.
6. **Novidade e e2e:** a entrada em `novidades.ts` e um e2e com:
   - a partida sozinho até o fim;
   - 8 jogadores com bots;
   - o Modo Tela ou "Com celulares" com um Pixel 7 emulado, mostrando o jogo no celular e os botões.
7. **Documentação no infra:** `features/games/vN.md`, a RN nova no README, a linha na tabela de versões e o catálogo `features/README.md` apontando para a vN.

### Ambiente local de teste (container)

```bash
su postgres -c "/usr/lib/postgresql/16/bin/pg_ctl -D /var/tmp/pgtest -o '-p 55432' -l /var/tmp/pgtest/log start -w"
cd nord-tool-backend && NORD_CORS_ORIGINS=http://127.0.0.1:5199 SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:55432/t \
  SPRING_DATASOURCE_USERNAME=postgres SERVER_PORT=8091 nohup java -jar target/nord_tool_backend-1.0-SNAPSHOT.jar &
cd nord-tool-frontend && VITE_API_BASE_URL=http://127.0.0.1:8091/api/v1/nord-tool npx vite --host 127.0.0.1 --port 5199
```

Os usuários de teste ficam só no banco local; nunca vão para o repositório.

## Situação dos jogos

| Versão | Jogo | Situação |
|---|---|---|
| v1–v4 | Bombas Táticas | pronto |
| v5 | Sumô dos Hexágonos (3D) | pronto |
| v6 | Encaixe Versus | pronto |
| v7 | Duelo ao Meio-Dia | pronto |
| v8 | Guerra Naval | pronto |
| v9 | Cartas da Virada | pronto |
| v10 | Controles (teclas, toque, gamepad) | pronto |
| v11 | Jogo inteiro em cada celular (espelho) | pronto |
| v12 | Horda Zumbi | pronto |
| v13 | Fuga da Masmorra | pronto |
| v14 | Coroa Maldita | pronto |
| v15 | Corrida Espacial | pronto |
| v16 | Torres em Colapso | pronto |
| v17 | Defesa de Base | pronto |
| v18 | Pescaria & Submarino | pronto |
| v19 | Corrida do Ouro | pronto |
| v20 | Kart Turbo & Balões (3D) | pronto |
| v21 | Tanques de Aço (3D) | pronto |
| v22 | Caos Urbano (3D) | pronto |
| v23 | Arena Voxel (3D FPS) | pronto |
| v24 | Cozinha Caótica (3D) | pronto |
| v25+ | os 2 restantes | a fazer, na ordem da tabela seguinte (a partir de `ritmo`) |

> Desde a v18, um modo pode ter os próprios nomes de botões no celular (`botoes` dentro do modo, em `registroJogos.ts`); o aviso `lugar` leva o modo até o celular.

## Próximos jogos e regras do gênero

As regras estão resumidas para cada agente seguir; os modos vêm do catálogo (`catalogo.ts`).

| Ordem | id | Jogo | Gênero de referência e regras essenciais |
|---|---|---|---|
| 1 | `horda` | Horda Zumbi | Sobrevivência cooperativa vista de cima. Ondas crescentes de zumbis; entre as ondas, compra de melhorias com o dinheiro das mortes; barricadas consertáveis; aliado caído pode ser revivido; lanterna e escuridão. Modos: Ondas, Resgate (levar sobreviventes à saída) e Chefe. |
| 2 | `masmorra` | Fuga da Masmorra | Roguelite de salas: mapa procedural de salas com portas, chaves, armadilhas e baús, chefe no fim. Morreu, recomeça. Desafio Diário com semente do dia. |
| 3 | `coroa` | Coroa Maldita | Plataforma de arena: pegar a coroa e ficar com ela; quem encosta rouba. Vence quem somar mais tempo. Pega-Pega como modo alternativo. |
| 4 | `espacial` | Corrida Espacial | Naves com inércia (girar e empurrar), gravidade de planetas, lasers e escudo. Corrida por anéis, Asteroides (destruir) e Coleta. |
| 5 | `torres` | Torres em Colapso | Artilharia por turnos: ângulo e força, vento, materiais com resistência e estruturas que desabam. |
| 6 | `defesa` | Defesa de Base | Tower defense cooperativo: coletar recursos, construir e melhorar torres e defender a base das ondas. |
| 7 | `pescaria` | Pescaria & Submarino | Pescaria com linha e tensão, mais um submarino com oxigênio, arpão e tesouros. |
| 8 | `mineracao` | Corrida do Ouro | Cavar blocos, dinamite, carga com peso e entrega no carrinho para pontuar. |
| 9 | `kart` | Kart Turbo & Balões (3D) | Kart com drift que gera turbo, itens em caixas, voltas, e arena de balões (3 balões cada). |
| 10 | `tanques` | Tanques de Aço (3D) | Arena com muros destrutíveis, tiros que ricocheteiam e minas. |
| 11 | `caos` | Caos Urbano (3D) | Cidade procedural: fuga, entregas, derby e corrida. |
| 12 | `fps` | Arena Voxel (3D FPS) | Tiro rápido em primeira pessoa: slide, pulo encadeado e quatro armas; mata-mata e times. |
| 13 | `cozinha` | Cozinha Caótica | Cooperativo de pedidos: cortar, cozinhar, montar, lavar pratos e apagar fogo, contra o relógio. |
| 14 | `ritmo` | Batalha de Banda | Ritmo: notas caindo em pistas, janela de acerto, combos e versus que manda obstáculos. |
| 15 | `chefao` | Chefão Colossal | Cooperativo contra um chefe gigante com fases e padrões de ataque. |

Depois dos jogos vem uma fase de acabamento: revisar os jogos um por um com o Nick.

## Itens para o acabamento

- **Corrida Espacial:** os bots ainda explodem cerca de 8 vezes em 90 s nos Asteroides; calibrar o desvio.
- **Jogos cooperativos (Horda, Masmorra):** o cartão de fim da moldura diz "Empate!" quando o time perde; trocar por um texto de equipe.

## Pendências com o Nick (perguntar quando ele aparecer)

- Os módulos novos de acesso devem começar liberados ou bloqueados?
- Ele quer o app para iOS como PWA?
- O joystick do celular foi reforçado na v10, mas falta ele confirmar num aparelho real.
