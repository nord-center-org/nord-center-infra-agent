# Bloco de notas

| | |
|---|---|
| Slug | `bloco-notas` |
| Status | ativa |
| Versão atual | [v1](v1.md) |
| Repositórios | nord-tool-scripts-sql, nord-tool-backend, nord-tool-frontend |
| Onde no app | Mapeamentos > Bloco de notas (`/mapeamentos/bloco-notas`) |

## O que faz

Cadernos pessoais para escrever à mão, no estilo dos apps de anotação em PDF: páginas com papel pautado, quadriculado, pontilhado ou em branco; caneta que sente a pressão da caneta stylus, marca-texto, borracha, formas, texto, imagens e laço para selecionar; PDFs importados viram páginas para anotar por cima; o caderno inteiro sai em PDF.

## Regras de negócio vigentes

- **RN-01** Qualquer pessoa logada usa o bloco de notas (não há permissão em Acessos); cada caderno é só de quem o criou e ninguém mais o vê, nem o administrador. _(v1)_
- **RN-02** Até 200 cadernos por pessoa e 500 páginas por caderno; o caderno tem sempre ao menos uma página. _(v1)_
- **RN-03** Cada página tem um papel (branco, pautado, quadriculado, pontilhado) que pode ser trocado, ou é uma página de PDF (a imagem da página do PDF, que não muda). _(v1)_
- **RN-04** O desenho é salvo sozinho cerca de 1 s depois da última alteração; se a página mudou em outro aparelho, o salvamento é recusado e a pessoa escolhe ver a versão mais nova. _(v1)_
- **RN-05** Importar PDF: até 200 páginas por PDF e 60 MB; cada página vira uma imagem de até 5 MB. Exportar: cada página do caderno vira uma página do PDF, no mesmo tamanho. _(v1)_
- **RN-06** Imagens coladas: JPEG/PNG reduzidos no aparelho (até 1280 px) e enviados ao servidor. _(v1)_

## Onde está no código

- **SQL:** `DDL/66.bloco_notas_ddl.sql` (`bloco_caderno`, `bloco_pagina`, `bloco_imagem`).
- **Backend:** `BlocoNotasReadController` e `BlocoNotasWriteController` (`/api/v1/nord-tool/blocos-notas`), `BlocoNotasServiceImpl`, `BlocoNotasRepositoryImpl`, `query/bloco-notas.properties`.
- **Frontend:** `pages/BlocoNotas.tsx`, `components/bloco/` (`EditorCaderno`, `PaginaVista`, `desenho.ts`, `pdfBloco.ts`, `imagensBloco.ts`), `services/BlocoNotasService.ts`, `utils/blocoNotas.ts`.

## Versões

| Versão | Data | Resumo | Branch | PRs |
|---|---|---|---|---|
| [v1](v1.md) | 2026-11-09 | Cadernos à mão no estilo dos apps de anotação, com PDF importado e exportado | `feature-bloco-notas` | [sql#69](https://github.com/nord-center-org/nord-tool-scripts-sql/pull/69), [backend#114](https://github.com/nord-center-org/nord-tool-backend/pull/114), [frontend#159](https://github.com/nord-center-org/nord-tool-frontend/pull/159), [infra#30](https://github.com/nord-center-org/nord-center-infra-agent/pull/30) |

## Correções

| Data | Branch | O que foi corrigido | PRs |
|---|---|---|---|

## Dependências e impactos

Usa o armazenamento de arquivos (páginas de PDF e imagens), `pdfjs-dist` e `pdf-lib`, que já estavam no frontend, e o redimensionamento de fotos do relatório fotográfico (`utils/imagem.ts`).
