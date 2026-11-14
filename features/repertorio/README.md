# Repertório

| | |
|---|---|
| Slug | `repertorio` |
| Status | ativa |
| Versão atual | [v13](v13.md) |
| Repositórios | nord-tool-scripts-sql, nord-tool-backend, nord-tool-frontend |
| Onde no app | Gestão Individual > Repertório (`/gestao/repertorio`) |

## O que faz

A pessoa envia uma música (MP3, WAV, M4A, OGG ou FLAC) e o app reconhece, no próprio aparelho, o tom, o BPM, as batidas, os acordes e a linha do baixo.

No player dá para:
- mudar o tom e o andamento, um sem mexer no outro;
- separar a música em voz, baixo, bateria e outros, com volume, mudo e solo em cada faixa.

Ao lado da letra, o instrumento escolhido mostra as notas descendo até onde se toca, como nos vídeos de piano. Cada nota traz o nome, escrito como na cifra (C, G, F#, Bb…), e, no braço, a casa; a próxima já aparece marcada no braço antes de chegar. Com "Todas as notas" ligado, o braço (ou o teclado) mostra o nome de todas as notas em cinza e só a que toca acende na cor. O instrumento pode ser:
- baixo de 4 ou 5 cordas, com a linha do baixo;
- violão/guitarra, com as formas dos acordes;
- teclado.

A cifra é colada no formato do Cifra Club. Ela muda de tom junto com o áudio, a linha atual fica em destaque e vai se preenchendo, e a letra rola sozinha. Sem cifra, dá para gerar uma com os acordes reconhecidos.

## Regras de negócio vigentes

- **RN-01** As músicas (áudio, análise, cifra, tempos das linhas e ajustes) ficam no aparelho (IndexedDB) e, desde a v7, também na conta de quem as subiu: abrem em qualquer aparelho com a mesma conta (veja RN-15 a RN-17; áudio acima de 15 MB fica só no aparelho). _(v1, alterada na v7)_
- **RN-02** Arquivo de áudio de até 60 MB. Título e artista vêm do nome do arquivo ("Artista - Música") e podem ser editados. _(v1)_
- **RN-03** A análise é feita ao abrir a música pela primeira vez e fica guardada. É refeita sozinha quando foi feita por uma versão anterior do analisador, ou à mão em "Refazer análise". Mede:
  - o tom, pelos perfis de Krumhansl;
  - o BPM e as batidas;
  - os acordes maiores e menores por batida;
  - as notas do baixo (E1 a E3). Cada nota começa num ataque no grave; o nome sai por votação no meio do trecho, só com a parte que sustenta; batidas (bumbo, caixa) e trechos sem nota clara são descartados. _(v1; v2: nova detecção do baixo)_
- **RN-04** Tom de −12 a +12 semitons e andamento de 50% a 150%. O tom, o andamento, o instrumento e a transposição da cifra ficam salvos na música. _(v1)_
- **RN-07** As notas no instrumento mostram o nome no tom que está tocando, já com a transposição, como na cifra: com bemol nos tons escritos com bemol (F, Bb, Eb, Ab, Db, Gb e as menores relativas) e com sustenido nos outros. _(v2)_
- **RN-08** "Todas as notas" é uma preferência do aparelho (vale para todas as músicas), guardada no navegador; começa desligada. _(v3)_
- **RN-09** No baixo e no violão dá para ver as notas caindo ou o mapa do braço em pé, com todas as notas coloridas pela letra escrita (C verde, D vermelho, E amarelo, F azul, G rosa, A marrom, B grafite); a nota que toca acende. A escolha é do aparelho. _(v4)_
- **RN-10** O sintetizador (desligado no começo) toca as notas que o instrumento mostra, com timbre de baixo, violão ou teclado, no tom e no andamento escolhidos, nas duas vistas; liga/desliga e volume são do aparelho; pausa, pulo e troca de instrumento/tom cortam o som. _(v5)_
- **RN-11** O instrumento online toca baixo, teclado, violão, sintetizador e bateria pela tela ou pelo teclado do computador; não grava nada. _(v6)_
- **RN-12** Em "Criar", cada criação fica no aparelho e, desde a v7, na conta (abre em qualquer aparelho), com 40–240 BPM, 1–64 compassos de 4 tempos, até 12 faixas e 4.000 notas por faixa; clicar numa célula da grade põe ou tira a nota. _(v6, alterada na v7)_
- **RN-13** Gravar começa do início com um compasso de contagem e o metrônomo; as notas tocadas entram na faixa escolhida ao parar, encaixadas na grade (se ligado), sem duplicar. _(v6)_
- **RN-14** Com alguma faixa em solo, só as em solo soam; faixas mudas nunca soam (nem no WAV nem ao mandar para Músicas). _(v6)_
- **RN-15** Músicas e criações ficam na conta de quem as subiu/criou e abrem em qualquer aparelho com a mesma conta; ninguém mais as vê. _(v7)_
- **RN-16** Áudio na conta até 15 MB por música e 300 MB por pessoa (configurável), até 300 músicas e 200 criações; acima disso fica só no aparelho. Músicas do estúdio guardam a criação, não o áudio. _(v7)_
- **RN-17** Mudou em dois aparelhos: vale a mexida por último. Excluir apaga do aparelho e da conta; os outros aparelhos apagam a cópia ao abrir a lista. _(v7)_
- **RN-18** Cada instrumento tem timbres para escolher; a faixa do estúdio guarda o seu (e o WAV sai com ele); no instrumento online e no sintetizador do player a escolha é do aparelho. _(v8)_
- **RN-19** No instrumento online: sustentar (botão ou Shift), transpor (−12 a +12), escala destacada (as de fora ficam apagadas, mas tocam), acorde com uma tecla (ou do campo harmônico da escala), força e, no baixo e no violão, tocar no braço. Preferências do aparelho. _(v8)_
- **RN-20** Na grade do estúdio, "Pôr notas" põe (ou tira) uma nota de um quadradinho por clique e estica arrastando; "Selecionar" seleciona por clique ou retângulo para copiar, recortar, colar no ponto escolhido (em qualquer faixa), duplicar, apagar e mover. _(v9)_
- **RN-21** O player mostra a cifra e o instrumento, só a cifra ou só o instrumento (escolha do aparelho); escrevendo a cifra, ela sempre aparece. _(v10)_
- **RN-22** "Escrever cifra" tem dois passos: a letra (colada ou identificada) e os acordes postos com o mouse em cima das sílabas (RN-31). Não se marca tempo: o tempo de cada linha vem da letra identificada ou dos acordes postos (sincronia com o áudio). A letra fica na música e na conta. _(v10, alterada na v11 e na v13)_
- **RN-23** A letra do primeiro passo vira a cifra (sem acordes), com as horas da letra identificada como tempos das linhas. Se a música já tem cifra, pede confirmação. _(v10, alterada na v11 e na v13)_
- **RN-24** "Identificar letra" reconhece a letra no aparelho:
  - o áudio não sai do aparelho; o reconhecedor (Whisper) baixa uma vez do Hugging Face (~80 MB o rápido, ~250 MB o mais preciso) e fica no cache do navegador;
  - usa a voz separada, se as faixas já foram separadas;
  - cada verso vem com a hora em que começa;
  - frases que o reconhecedor inventa em trecho instrumental (legendas, "obrigado por assistir", interjeições soltas) saem;
  - trocar uma letra que já existe pede confirmação.

  _(v11)_
- **RN-25** Na linha escolhida do editor:
  - "Ouvir" toca só o trecho dela;
  - "Cifra da linha" analisa só esse trecho do áudio e troca os acordes da linha pelos reconhecidos.

  O trecho é o tempo automático da linha, até a próxima. _(v11, alterada na v13)_
- **RN-26** "Tom da cifra" − e + sobem ou descem meio tom a cifra escrita (e o que está sendo escrito) sem mudar o áudio: os acordes ficam sobre a mesma sílaba e a linha "Tom:" acompanha. _(v11)_
- **RN-27** O instrumento (braço, teclado e sintetizador) segue a cifra escrita — os acordes das linhas com tempo, na posição de cada um, e no baixo a fundamental (ou o baixo invertido) — ou o que foi reconhecido no áudio. A escolha é do aparelho; sem acordes com tempo na cifra, segue o áudio. _(v11)_
- **RN-28** "Compartilhar" manda a cifra como está na tela (no tom que se ouve), sem o áudio, para pessoas ativas do NordTool:
  - cada uma recebe a sua cópia, com um recado opcional (até 300 caracteres);
  - até 30 pessoas por envio e 300 cópias por pessoa por dia;
  - não dá para mandar para si mesmo;
  - a cifra vai com até 64 mil caracteres.

  _(v12)_
- **RN-29** As cifras recebidas aparecem na aba "Recebidas", das mais novas para as mais antigas, e a aba mostra quantas ainda não foram abertas:
  - abrir marca como lida;
  - dá para mudar o tom, gerar a imagem e pôr a cifra numa música própria (troca a cifra dela, com confirmação se já tiver);
  - excluir apaga só a cópia de quem recebeu.

  _(v12)_
- **RN-30** A imagem da cifra (PNG) tem título, artista, tom, a cifra com os acordes sobre as sílabas e o rodapé do NordTool:
  - uma coluna (1080 px de largura) ou duas (1920 px) quando não cabe em 1920 px de altura;
  - a fonte diminui para a linha mais comprida caber;
  - baixa no computador e, no celular que permite, abre o compartilhar do aparelho.

  _(v12)_
- **RN-31** Em "Mexer nos acordes":
  - clicar numa sílaba e tocar num acorde põe o acorde em cima dela (o que já estava naquela coluna é trocado);
  - arrastar um acorde o leva para outra sílaba ou linha;
  - Delete tira o acorde escolhido e Backspace desfaz.

  Só as linhas de acordes do texto mudam: um verso sem acordes ganha a linha de cima, uma linha de acordes que fica vazia some, e a letra não muda. _(v13)_
- **RN-32** Clicar no nome de um acorde na cifra:
  - toca o acorde como o instrumento escolhido toca, com o timbre escolhido;
  - acende as notas no braço ou no teclado por 1,5 s;
  - não muda o ponto da música.

  _(v13)_
- **RN-05** A separação das faixas é aproximada, sem IA: as quatro faixas somadas dão a música original. Ela é refeita a cada vez que se pede e não fica guardada. _(v1)_
- **RN-06** Sobre a cifra:
  - a hora de cada linha vem do alinhamento dos acordes da cifra com os acordes do áudio, testando os 12 tons;
  - se a cifra estiver em outro tom (por exemplo, com capotraste), o app oferece transpô-la para casar com o áudio;
  - linhas sem acorde ficam entre as vizinhas;
  - "Marcar linhas" grava os tempos à mão, e "Automático" volta ao cálculo. _(v1)_
  - "Escrever cifra" monta a cifra a partir da letra, com os acordes postos com o mouse e o tempo achado sozinho (RN-22, RN-23 e RN-31). _(v10, alterada na v13)_

## Onde está no código

- **SQL (v7):** `DDL/73.repertorio_ddl.sql` (`repertorio_musica`, `repertorio_projeto`; áudio em `arquivo_armazenado`).
- **SQL (v12):** `DDL/74.repertorio_cifra_enviada_ddl.sql` (`repertorio_cifra_enviada`).
- **Backend (v7):** `RepertorioReadController`/`RepertorioWriteController` (`/api/v1/nord-tool/repertorio`), `RepertorioServiceImpl`, `RepertorioRepositoryImpl`, `query/repertorio.properties`; cota em `nord-tool.repertorio.cota-mb`. Na v12: `/pessoas`, `/cifras-enviadas`, `/cifras-recebidas`, `RepertorioCifraDto`, `RepertorioEnvioDto` e `RepertorioCifraEnvioForm`.
- **Frontend (v7):** `services/RepertorioService.ts`, `utils/musica/repertorioConta.ts`, `components/repertorio/sincronizacao.ts`.
- **Frontend (v12):** `components/repertorio/CompartilharCifra.tsx`, `CifrasRecebidas.tsx`, `desenhoCifra.ts` e `utils/musica/imagemCifra.ts`.
- **Frontend (v13):** `components/repertorio/EditorAcordes.tsx`, `utils/musica/edicaoCifra.ts`, os acordes clicáveis em `CifraRolando.tsx` e o `tocarAcorde`/destaque no `PlayerRepertorio.tsx`.
- **Frontend:**
  - `pages/Repertorio.tsx`: lista, envio e exclusão;
  - `components/repertorio/`:
    - `PlayerRepertorio.tsx`: o player;
    - `CifraRolando.tsx`: a cifra;
    - `EscreverCifra.tsx`: escrever a cifra tocando (v10), na sílaba, por trecho e com a letra identificada (v11);
    - `desenhoInstrumento.ts`: o canvas do instrumento;
    - `motorAudio.ts`: tom, andamento e faixas;
  - `utils/musica/` (puro, testado em node):
    - `teoria.ts`: notas, acordes e transposição;
    - `cifra.ts`;
    - `escritaCifra.ts`: campo harmônico e montagem da cifra escrita (v10), acordes na sílaba e trechos (v11);
    - `letra.ts`: janelas, limpeza e linhas da letra identificada (v11);
    - `seguirCifra.ts`: o instrumento segue a cifra (v11);
    - `analise.ts`: FFT, tom, BPM, batidas, acordes e baixo;
    - `instrumentos.ts`: braço, digitação, formas de acorde e o que cai na tela;
    - `sincronia.ts`;
    - `separacao.ts`;
    - `repertorioDb.ts`: IndexedDB;
  - `workers/analiseMusica.worker.ts`, `workers/separacaoMusica.worker.ts` e `workers/letraMusica.worker.ts` (v11);
  - rota em `App.tsx` e `media-src blob:` na CSP (`vite.config.ts`).

## Versões

| Versão | Data | Resumo | Branch | PRs |
|---|---|---|---|---|
| [v1](v1.md) | 2026-11-12 | Músicas com tom, BPM, acordes e baixo reconhecidos, tom/andamento, faixas separadas, cifra rolando e instrumento animado | `feature-repertorio` | [frontend#176](https://github.com/nord-center-org/nord-tool-frontend/pull/176), [infra#47](https://github.com/nord-center-org/nord-center-infra-agent/pull/47) |
| [v2](v2.md) | 2026-11-12 | Nome das notas (como na cifra) e casa no instrumento; próxima nota marcada no braço; linha do baixo mais limpa | `feature-repertorio-v2` | [frontend#177](https://github.com/nord-center-org/nord-tool-frontend/pull/177), [infra#48](https://github.com/nord-center-org/nord-center-infra-agent/pull/48) |
| [v3](v3.md) | 2026-11-12 | "Todas as notas": braço/teclado com todas as notas em cinza, a que toca acende | `feature-repertorio-v3` | [frontend#178](https://github.com/nord-center-org/nord-tool-frontend/pull/178), [infra#49](https://github.com/nord-center-org/nord-center-infra-agent/pull/49) |
| [v4](v4.md) | 2026-11-13 | "Mapa do braço": braço em pé com todas as notas coloridas pela letra, a que toca acende | `feature-repertorio-v4` | [frontend#184](https://github.com/nord-center-org/nord-tool-frontend/pull/184), [infra#55](https://github.com/nord-center-org/nord-center-infra-agent/pull/55) |
| [v5](v5.md) | 2026-11-13 | Sintetizador do instrumento tocando junto com a música | `feature-repertorio-v5` | [frontend#185](https://github.com/nord-center-org/nord-tool-frontend/pull/185), [infra#56](https://github.com/nord-center-org/nord-center-infra-agent/pull/56) |
| [v6](v6.md) | 2026-11-13 | Instrumento online e aba "Criar" (estúdio de faixas com grade, gravação, WAV) | `feature-repertorio-v6` | [frontend#186](https://github.com/nord-center-org/nord-tool-frontend/pull/186), [infra#57](https://github.com/nord-center-org/nord-center-infra-agent/pull/57) |
| [v7](v7.md) | 2026-11-13 | Músicas e criações na conta: abrem em qualquer aparelho | `feature-repertorio-v7` | [sql#76](https://github.com/nord-center-org/nord-tool-scripts-sql/pull/76), [backend#126](https://github.com/nord-center-org/nord-tool-backend/pull/126), [frontend#187](https://github.com/nord-center-org/nord-tool-frontend/pull/187), [infra#58](https://github.com/nord-center-org/nord-center-infra-agent/pull/58) |
| [v8](v8.md) | 2026-11-13 | Timbres por instrumento e ferramentas para tocar (braço, sustentar, transpor, escala, acorde com 1 tecla, metrônomo) | `feature-repertorio-v8` | [frontend#189](https://github.com/nord-center-org/nord-tool-frontend/pull/189), [infra#60](https://github.com/nord-center-org/nord-center-infra-agent/pull/60) |
| [v9](v9.md) | 2026-11-13 | Grade do estúdio: um quadradinho por clique, modos pôr/selecionar, copiar e colar notas | `feature-repertorio-v9` | [frontend#190](https://github.com/nord-center-org/nord-tool-frontend/pull/190), [infra#61](https://github.com/nord-center-org/nord-center-infra-agent/pull/61) |
| [v10](v10.md) | 2026-11-13 | Escolher o que mostrar no player; escrever a cifra tocando, com a letra (chamado #5) | `feature-repertorio-v10` | [frontend#192](https://github.com/nord-center-org/nord-tool-frontend/pull/192), [infra#63](https://github.com/nord-center-org/nord-center-infra-agent/pull/63) |
| [v11](v11.md) | 2026-11-14 | Identificar a letra (no aparelho), acorde em cima da sílaba, cifra do trecho, tom da cifra e instrumento seguindo a cifra | `feature-repertorio-v11` | [frontend#193](https://github.com/nord-center-org/nord-tool-frontend/pull/193), [infra#64](https://github.com/nord-center-org/nord-center-infra-agent/pull/64) |
| [v12](v12.md) | 2026-11-14 | Compartilhar a cifra com pessoas do NordTool (aba "Recebidas") e imagem da cifra | `feature-repertorio-v12` | [sql#77](https://github.com/nord-center-org/nord-tool-scripts-sql/pull/77), [backend#127](https://github.com/nord-center-org/nord-tool-backend/pull/127), [frontend#194](https://github.com/nord-center-org/nord-tool-frontend/pull/194), [infra#65](https://github.com/nord-center-org/nord-center-infra-agent/pull/65) |
| [v13](v13.md) | 2026-11-14 | Mexer nos acordes na cifra (pôr e arrastar), som do acorde no instrumento escolhido e braço acendendo | `feature-repertorio-v13` | [frontend#195](https://github.com/nord-center-org/nord-tool-frontend/pull/195), [infra#66](https://github.com/nord-center-org/nord-center-infra-agent/pull/66) |

## Correções

| Data | Branch | O que foi corrigido | PRs |
|---|---|---|---|
| 2026-11-13 | `fix-repertorio-baixo-picotado` | Notas do baixo picotadas: a mesma nota em seguida só se separa se o som do grave caiu antes do novo ataque (nota segurada com bumbo por cima vira uma só). Ataques e batidas eram marcados ~40 ms cedo (o fluxo espectral reage quando o som entra na janela); agora vão para a metade da subida da energia (<10 ms do ataque real), o que acerta a troca das notas e a cifra rolando. Análise na versão 3 (o player refaz as músicas guardadas). Testes em `analise.test.ts` com áudio sintético (nota segurada com bumbo, notas curtas rápidas, troca sem ataque, trocas no meio de acordes e bateria). | [frontend#188](https://github.com/nord-center-org/nord-tool-frontend/pull/188) |

## Dependências e impactos

Até a v10, nenhuma dependência: tudo usa Web Audio, canvas, Web Workers e IndexedDB.

Na v11 entraram `@huggingface/transformers` e `onnxruntime-web` (versões exatas), que fazem o reconhecimento de fala no aparelho.
- O motor (`.wasm`, ~27 MB, ~7 MB comprimido) vai nos arquivos do app e só é baixado quando se identifica uma letra.
- O modelo vem do Hugging Face. Por isso o `connect-src` da CSP inclui `huggingface.co`, `*.huggingface.co` e `*.hf.co`.

A CSP do build ganhou `media-src 'self' blob:`. Sem isso, os áudios do aparelho não tocariam no app publicado.

A tela antes era um "em construção".
