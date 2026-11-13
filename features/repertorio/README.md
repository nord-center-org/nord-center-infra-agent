# Repertório

| | |
|---|---|
| Slug | `repertorio` |
| Status | ativa |
| Versão atual | [v7](v7.md) |
| Repositórios | nord-tool-frontend |
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

- **RN-01** As músicas ficam só no aparelho (IndexedDB do navegador): o áudio, a análise, a cifra, os tempos das linhas e os ajustes. Nada é enviado ao servidor, e cada aparelho tem o seu repertório. _(v1)_
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
- **RN-12** Em "Criar", cada criação fica só no aparelho, com 40–240 BPM, 1–64 compassos de 4 tempos, até 12 faixas e 4.000 notas por faixa; clicar numa célula da grade põe ou tira a nota. _(v6)_
- **RN-13** Gravar começa do início com um compasso de contagem e o metrônomo; as notas tocadas entram na faixa escolhida ao parar, encaixadas na grade (se ligado), sem duplicar. _(v6)_
- **RN-14** Com alguma faixa em solo, só as em solo soam; faixas mudas nunca soam (nem no WAV nem ao mandar para Músicas). _(v6)_
- **RN-15** Músicas e criações ficam na conta de quem as subiu/criou e abrem em qualquer aparelho com a mesma conta; ninguém mais as vê. _(v7)_
- **RN-16** Áudio na conta até 15 MB por música e 300 MB por pessoa (configurável), até 300 músicas e 200 criações; acima disso fica só no aparelho. Músicas do estúdio guardam a criação, não o áudio. _(v7)_
- **RN-17** Mudou em dois aparelhos: vale a mexida por último. Excluir apaga do aparelho e da conta; os outros aparelhos apagam a cópia ao abrir a lista. _(v7)_
- **RN-05** A separação das faixas é aproximada, sem IA: as quatro faixas somadas dão a música original. Ela é refeita a cada vez que se pede e não fica guardada. _(v1)_
- **RN-06** Sobre a cifra:
  - a hora de cada linha vem do alinhamento dos acordes da cifra com os acordes do áudio, testando os 12 tons;
  - se a cifra estiver em outro tom (por exemplo, com capotraste), o app oferece transpô-la para casar com o áudio;
  - linhas sem acorde ficam entre as vizinhas;
  - "Marcar linhas" grava os tempos à mão, e "Automático" volta ao cálculo. _(v1)_

## Onde está no código

- **SQL (v7):** `DDL/73.repertorio_ddl.sql` (`repertorio_musica`, `repertorio_projeto`; áudio em `arquivo_armazenado`).
- **Backend (v7):** `RepertorioReadController`/`RepertorioWriteController` (`/api/v1/nord-tool/repertorio`), `RepertorioServiceImpl`, `RepertorioRepositoryImpl`, `query/repertorio.properties`; cota em `nord-tool.repertorio.cota-mb`.
- **Frontend (v7):** `services/RepertorioService.ts`, `utils/musica/repertorioConta.ts`, `components/repertorio/sincronizacao.ts`.
- **Frontend:**
  - `pages/Repertorio.tsx`: lista, envio e exclusão;
  - `components/repertorio/`:
    - `PlayerRepertorio.tsx`: o player;
    - `CifraRolando.tsx`: a cifra;
    - `desenhoInstrumento.ts`: o canvas do instrumento;
    - `motorAudio.ts`: tom, andamento e faixas;
  - `utils/musica/` (puro, testado em node):
    - `teoria.ts`: notas, acordes e transposição;
    - `cifra.ts`;
    - `analise.ts`: FFT, tom, BPM, batidas, acordes e baixo;
    - `instrumentos.ts`: braço, digitação, formas de acorde e o que cai na tela;
    - `sincronia.ts`;
    - `separacao.ts`;
    - `repertorioDb.ts`: IndexedDB;
  - `workers/analiseMusica.worker.ts` e `workers/separacaoMusica.worker.ts`;
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
| [v7](v7.md) | 2026-11-13 | Músicas e criações na conta: abrem em qualquer aparelho | `feature-repertorio-v7` | _a preencher_ |

## Correções

| Data | Branch | O que foi corrigido | PRs |
|---|---|---|---|

## Dependências e impactos

Nenhuma dependência nova: tudo usa Web Audio, canvas, Web Workers e IndexedDB.

A CSP do build ganhou `media-src 'self' blob:`. Sem isso, os áudios do aparelho não tocariam no app publicado.

A tela antes era um "em construção".
