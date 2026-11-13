# Bloco de notas

| | |
|---|---|
| Slug | `bloco-notas` |
| Status | ativa |
| Versão atual | [v6](v6.md) |
| Repositórios | nord-tool-scripts-sql, nord-tool-backend, nord-tool-frontend |
| Onde no app | Mapeamentos > Bloco de notas (`/mapeamentos/bloco-notas`) |

## O que faz

A central dos arquivos de cada pessoa:
- **cadernos** para escrever à mão e anotar PDFs (com documento estilo Word, páginas que giram e outros formatos como página);
- **planilhas** no estilo do Google Sheets em português (funções, datas e números no jeito brasileiro), com Excel de ida e volta;
- **documentos** no estilo do Word.

Tudo fica numa lista só, com filtro e busca.

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
- **RN-12** A central reúne cadernos, planilhas e documentos da pessoa (até 500 planilhas e documentos), com filtro por tipo e busca pelo nome. _(v3)_
- **RN-13** Planilha: várias páginas, fórmulas (também em português, como =SOMA e =SE com ";") e números com vírgula; até 5 MB; salva sozinha com versão; baixa em Excel. _(v3)_
- **RN-14** Documento avulso: o mesmo editor do documento do caderno, até 2 MB, sem scripts; baixa em PDF. _(v3)_
- **RN-15** Na central, "Abrir arquivo" abre Excel/CSV como planilha, Word como documento e PDF, imagem e texto como caderno. _(v3)_
- **RN-16** "Perguntar à Lugia" (quem tem acesso ao módulo Lugia) responde com base nas caixas de texto, nos documentos e nas planilhas da própria pessoa, nunca nos de outra; aceita foto e PDF. _(v4)_
- **RN-17** As ações sugeridas (abrir, criar caderno, anotar, criar documento, criar planilha, renomear) só acontecem quando a pessoa toca em "Fazer"; não há ação de excluir. _(v4)_
- **RN-18** Na planilha, as funções têm o nome do Google Sheets em português, na célula e na ajuda. Dá para digitar com `;` e vírgula decimal; a célula guarda a fórmula com vírgula entre os argumentos. Critérios (CONT.SE, SOMASE…) não diferenciam maiúsculas nem acentos. Data digitada é dd/mm/aaaa. _(v5)_
- **RN-19** No caderno, o zoom vai de 10% a 1600% em qualquer folha. A rodinha do mouse dá zoom no ponto do cursor (pode ser trocada para rolar; Ctrl + rodinha sempre dá zoom) e arrastar com a rodinha apertada move a folha. O PDF entra pela barra de ferramentas. _(v6)_
- **RN-20** Enquanto a pessoa digita (caixa de texto, documento ou campo), Ctrl+Z, Ctrl+Y, Delete e Esc agem no texto, nunca no desenho. _(v6)_

## Onde está no código

- **SQL:** `DDL/66.bloco_notas_ddl.sql` (`bloco_caderno`, `bloco_pagina`, `bloco_imagem`) e `DDL/68.bloco_notas_v2_ddl.sql` (rotação, documento, `bloco_pdf`) e `DDL/71.bloco_arquivo_ddl.sql` (planilhas e documentos avulsos).
- **Backend:** `BlocoNotasReadController` e `BlocoNotasWriteController` (`/api/v1/nord-tool/blocos-notas`), `BlocoNotasServiceImpl`, `BlocoNotasRepositoryImpl`, `query/bloco-notas.properties`; v3: `BlocoArquivoReadController`/`WriteController` (`/blocos-notas/arquivos`), `BlocoArquivoServiceImpl`, `query/bloco-arquivo.properties`; v4: `BlocoAssistenteServiceImpl`, `BlocoAssistenteRepositoryImpl`, `query/bloco-assistente.properties` e o contexto em `LugiaServiceImpl`.
- **Frontend:** `pages/BlocoNotas.tsx`, `components/bloco/` (`EditorCaderno`, `PaginaVista`, `desenho.ts`, `pdfBloco.ts`, `imagensBloco.ts`, `EditorCaixaTexto`, `DocumentoCaderno`, `documento.ts`, `pdfOriginal.ts`, `arquivosBloco.ts`, `EditorDocumentoAvulso`, `planilha/EditorPlanilha`, `planilha/idiomaPlanilha.ts`), `utils/planilha.ts`, `utils/centralBloco.ts`, v4: `components/bloco/assistente/ChatCadernos.tsx`, `utils/chatCadernos.ts`, v5: `utils/funcoesPlanilha.ts`, `utils/funcoesExtras.ts`, `planilha/idiomaPlanilhaMais.ts`, `services/BlocoNotasService.ts`, `utils/blocoNotas.ts`.

## Versões

| Versão | Data | Resumo | Branch | PRs |
|---|---|---|---|---|
| [v1](v1.md) | 2026-11-09 | Cadernos à mão no estilo dos apps de anotação, com PDF importado e exportado | `feature-bloco-notas` | [sql#69](https://github.com/nord-center-org/nord-tool-scripts-sql/pull/69), [backend#114](https://github.com/nord-center-org/nord-tool-backend/pull/114), [frontend#159](https://github.com/nord-center-org/nord-tool-frontend/pull/159), [infra#30](https://github.com/nord-center-org/nord-center-infra-agent/pull/30) |
| [v2](v2.md) | 2026-11-10 | Texto formatado, documento estilo Word lado a lado, girar página, PDF nítido, outros formatos e soltar o lápis | `feature-bloco-notas-v2` | [sql#71](https://github.com/nord-center-org/nord-tool-scripts-sql/pull/71), [backend#116](https://github.com/nord-center-org/nord-tool-backend/pull/116), [frontend#161](https://github.com/nord-center-org/nord-tool-frontend/pull/161), [infra#32](https://github.com/nord-center-org/nord-center-infra-agent/pull/32) |
| [v3](v3.md) | 2026-11-10 | Central do bloco: planilhas estilo Google Sheets e documentos estilo Word ao lado dos cadernos | `feature-bloco-notas-v3` | [sql#74](https://github.com/nord-center-org/nord-tool-scripts-sql/pull/74), [backend#119](https://github.com/nord-center-org/nord-tool-backend/pull/119), [frontend#164](https://github.com/nord-center-org/nord-tool-frontend/pull/164), [infra#35](https://github.com/nord-center-org/nord-center-infra-agent/pull/35) |
| [v4](v4.md) | 2026-11-10 | Chat dos cadernos: a Lugia pesquisa no Bloco de notas, lê fotos e cria ou anota com confirmação | `feature-bloco-notas-v4` | [backend#121](https://github.com/nord-center-org/nord-tool-backend/pull/121), [frontend#169](https://github.com/nord-center-org/nord-tool-frontend/pull/169), [infra#40](https://github.com/nord-center-org/nord-center-infra-agent/pull/40) |
| [v5](v5.md) | 2026-11-11 | Planilha em português: funções do Sheets em português, PROCX, UNIRTEXTO, MÁXIMOSES, datas e números no jeito brasileiro | `feature-bloco-notas-v5` | [frontend#171](https://github.com/nord-center-org/nord-tool-frontend/pull/171), [infra#42](https://github.com/nord-center-org/nord-center-infra-agent/pull/42) |
| [v6](v6.md) | 2026-11-13 | Caderno: zoom com a rodinha no cursor até 1600%, arrastar com a rodinha, PDF na barra e atalhos que respeitam o texto | `feature-bloco-notas-v6` | _a preencher_ |

## Correções

| Data | Branch | O que foi corrigido | PRs |
|---|---|---|---|
| 2026-11-12 | `fix-bloco-notas-planilha-mover` | Planilha: não dava para mover linhas e colunas (o editor não tem isso pronto), Shift + rodinha do mouse não rolava para os lados (o Chrome manda deltaY com Shift e o editor só rola na horizontal com deltaX) e dois cliques na borda do cabeçalho não ajustavam a largura ao texto. Entraram: botões "Mover" e Alt+Shift+setas (as células vão inteiras, a largura/altura acompanha e as fórmulas da página passam a apontar para as mesmas células; não move por cima de células mescladas), o reenvio do giro com Shift como horizontal e o ajuste da largura pelo texto mais largo (todas as colunas selecionadas, se a borda for de uma delas). Código em `utils/moverPlanilha.ts`, `utils/larguraColuna.ts` (testados) e `components/bloco/planilha/EditorPlanilha.tsx`. | [frontend#180](https://github.com/nord-center-org/nord-tool-frontend/pull/180), [infra#51](https://github.com/nord-center-org/nord-center-infra-agent/pull/51) |

## Dependências e impactos

Usa o armazenamento de arquivos (páginas de PDF e imagens), `pdfjs-dist`, `pdf-lib` e `xlsx`, que já estavam no frontend, `mammoth` (nova na v2, para ler .docx) `@fortune-sheet/react` e `@fortune-sheet/core` (nova na v3, planilha; v5 usa também `@fortune-sheet/formula-parser`, que já vinha com ele), a Lugia (v4, chat dos cadernos) e o redimensionamento de fotos do relatório fotográfico (`utils/imagem.ts`).
