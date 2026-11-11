# Editor de imagens

| | |
|---|---|
| Slug | `editor-imagens` |
| Status | ativa |
| Versão atual | [v2](v2.md) |
| Repositórios | nord-tool-frontend |
| Onde no app | Mapeamentos > Bloco de notas > Editar imagem; botão do pincel nas fotos do relatório fotográfico e nas imagens das placas |

## O que faz

Editor de imagens no estilo do Paint.net, no aparelho:
- camadas;
- ferramentas: pincel, borracha, linha, retângulo, elipse, texto, balde de tinta, conta-gotas, seleção retangular e varinha mágica;
- varinha mágica: seleciona sozinha a área de cor parecida (contínua ou na imagem toda), com tolerância, modos nova/somar/tirar/cruzar e borda suave;
- com a seleção: recortar, apagar, apagar o resto (tirar o fundo), inverter e preencher;
- girar, espelhar e redimensionar;
- ajustes: brilho, contraste, saturação, matiz, temperatura, desfoque, nitidez, preto e branco, sépia e inverter;
- desfazer e refazer;
- baixar em PNG ou JPG.

## Regras de negócio vigentes

- **RN-01** Nada é enviado ao servidor enquanto se edita. Pela central, a imagem é baixada (PNG/JPG) ou vira um caderno; pelas outras telas, "Salvar" devolve a imagem editada para a tela de origem. _(v1)_
- **RN-02** A imagem pode ser escolhida, arrastada para o botão "Editar imagem" ou colada com Ctrl+V. Imagens com lado maior que 4096 px são reduzidas para editar (com aviso). _(v1)_
- **RN-03** O histórico guarda até 30 passos, menos em imagens grandes (no máximo ~400 MB de memória). _(v1)_
- **RN-04** Nas placas a imagem volta em PNG (mantém a transparência), com a mesma largura na folha; no relatório fotográfico volta em JPG e substitui a foto. _(v1)_
- **RN-05** A varinha mágica escolhe pela cor da camada ativa. Apagar, "Apagar o resto" e preencher agem só na camada ativa; recortar com a seleção da varinha corta na caixa dela e deixa transparente o que fica fora, em todas as camadas. Para manter o fundo transparente é preciso baixar em PNG (o JPG põe fundo branco). _(v2)_

## Onde está no código

- **Frontend:** `components/imagem/EditorImagem.tsx` (o editor), `components/imagem/EditorImagemTelaCheia.tsx` (por cima de outras telas), `utils/editorImagem.ts` (ajustes, balde, histórico; testado em node), `utils/varinhaMagica.ts` (máscara de seleção da varinha; testado em node), atalho em `pages/BlocoNotas.tsx`, botão em `components/relatorio/EditorFoto.tsx` e em `components/placas/ImagensNaFolha.tsx` (com `pages/Placas.tsx`).

## Versões

| Versão | Data | Resumo | Branch | PRs |
|---|---|---|---|---|
| [v1](v1.md) | 2026-11-10 | Editor de imagens estilo Paint.net na central do bloco, no relatório fotográfico e nas placas | `feature-editor-imagens` | [frontend#166](https://github.com/nord-center-org/nord-tool-frontend/pull/166), [infra#37](https://github.com/nord-center-org/nord-center-infra-agent/pull/37) |
| [v2](v2.md) | 2026-11-11 | Varinha mágica: seleção por cor para tirar o fundo | `feature-editor-imagens-v2` | frontend (a abrir), infra (a abrir) |

## Correções

| Data | Branch | O que foi corrigido | PRs |
|---|---|---|---|

## Dependências e impactos

Só canvas do navegador; nenhuma dependência nova. Mexe no editor de foto do relatório fotográfico e na barra das imagens das placas (um botão a mais em cada).
