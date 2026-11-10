# Bloco de notas

| | |
|---|---|
| Slug | `bloco-notas` |
| Status | ativa |
| Versão atual | [v2](v2.md) |
| Repositórios | nord-tool-scripts-sql, nord-tool-backend, nord-tool-frontend |
| Onde no app | Mapeamentos > Bloco de notas (`/mapeamentos/bloco-notas`) |

## O que faz

Cadernos pessoais para escrever à mão, no estilo dos apps de anotação em PDF: páginas com papel pautado, quadriculado, pontilhado ou em branco; caneta que sente a pressão da caneta stylus, marca-texto, borracha, formas, texto, imagens e laço para selecionar; PDFs, imagens, Word, planilhas e textos importados viram páginas para anotar por cima, e os PDFs ficam nítidos em qualquer zoom; caixas de texto formatadas; páginas que giram; um documento de texto no estilo do Word por caderno, em páginas ou contínuo, que pode ficar lado a lado com o desenho; o caderno inteiro sai em PDF.

## Regras de negócio vigentes

- **RN-01** Qualquer pessoa logada usa o bloco de notas (não há permissão em Acessos); cada caderno é só de quem o criou e ninguém mais o vê, nem o administrador. _(v1)_
- **RN-02** Até 200 cadernos por pessoa e 500 páginas por caderno; o caderno tem sempre ao menos uma página. _(v1)_
- **RN-03** Cada página tem um papel (branco, pautado, quadriculado, pontilhado) que pode ser trocado, ou é uma página de PDF (a imagem da página do PDF, que não muda). _(v1)_
- **RN-04** O desenho é salvo sozinho cerca de 1 s depois da última alteração; se a página mudou em outro aparelho, o salvamento é recusado e a pessoa escolhe ver a versão mais nova. _(v1)_
- **RN-05** Importar PDF: até 200 páginas por PDF e 60 MB; cada página vira uma imagem de até 5 MB. Exportar: cada página do caderno vira uma página do PDF, no mesmo tamanho. _(v1)_
- **RN-06** Imagens coladas: JPEG/PNG reduzidos no aparelho (até 1280 px) e enviados ao servidor. _(v1)_
- **RN-07** Cada página pode ser girada de 90 em 90 graus; o que está desenhado gira junto, e em 90°/270° a largura e a altura trocam. _(v2)_
- **RN-08** Caixa de texto: negrito, itálico, sublinhado, tamanho e cor por trecho; alinhamento e largura da caixa. _(v2)_
- **RN-09** Cada caderno tem um documento de texto (até 2 MB), salvo sozinho com controle de versão como as páginas; só aceita formatação de texto, tabelas e imagens (nada de scripts). No PDF exportado ele vem antes das páginas. _(v2)_
- **RN-10** PDFs de até 15 MB guardam o original: a página é desenhada na resolução da tela e exportada vetorial. Maiores entram só como imagem, com aviso. Também viram páginas: imagens (1 página), .docx, planilhas e .txt (folhas A4); PowerPoint, .doc e HEIC são recusados. _(v2)_
- **RN-11** Tocar de novo na ferramenta ativa (ou Esc) solta o lápis: o toque só rola e dá zoom. _(v2)_

## Onde está no código

- **SQL:** `DDL/66.bloco_notas_ddl.sql` (`bloco_caderno`, `bloco_pagina`, `bloco_imagem`) e `DDL/68.bloco_notas_v2_ddl.sql` (rotação, documento, `bloco_pdf`).
- **Backend:** `BlocoNotasReadController` e `BlocoNotasWriteController` (`/api/v1/nord-tool/blocos-notas`), `BlocoNotasServiceImpl`, `BlocoNotasRepositoryImpl`, `query/bloco-notas.properties`.
- **Frontend:** `pages/BlocoNotas.tsx`, `components/bloco/` (`EditorCaderno`, `PaginaVista`, `desenho.ts`, `pdfBloco.ts`, `imagensBloco.ts`, `EditorCaixaTexto`, `DocumentoCaderno`, `documento.ts`, `pdfOriginal.ts`, `arquivosBloco.ts`), `services/BlocoNotasService.ts`, `utils/blocoNotas.ts`.

## Versões

| Versão | Data | Resumo | Branch | PRs |
|---|---|---|---|---|
| [v1](v1.md) | 2026-11-09 | Cadernos à mão no estilo dos apps de anotação, com PDF importado e exportado | `feature-bloco-notas` | [sql#69](https://github.com/nord-center-org/nord-tool-scripts-sql/pull/69), [backend#114](https://github.com/nord-center-org/nord-tool-backend/pull/114), [frontend#159](https://github.com/nord-center-org/nord-tool-frontend/pull/159), [infra#30](https://github.com/nord-center-org/nord-center-infra-agent/pull/30) |
| [v2](v2.md) | 2026-11-10 | Texto formatado, documento estilo Word lado a lado, girar página, PDF nítido, outros formatos e soltar o lápis | `feature-bloco-notas-v2` | [sql#71](https://github.com/nord-center-org/nord-tool-scripts-sql/pull/71), [backend#116](https://github.com/nord-center-org/nord-tool-backend/pull/116), [frontend#161](https://github.com/nord-center-org/nord-tool-frontend/pull/161), [infra#32](https://github.com/nord-center-org/nord-center-infra-agent/pull/32) |

## Correções

| Data | Branch | O que foi corrigido | PRs |
|---|---|---|---|

## Dependências e impactos

Usa o armazenamento de arquivos (páginas de PDF e imagens), `pdfjs-dist`, `pdf-lib` e `xlsx`, que já estavam no frontend, `mammoth` (nova na v2, para ler .docx) e o redimensionamento de fotos do relatório fotográfico (`utils/imagem.ts`).
