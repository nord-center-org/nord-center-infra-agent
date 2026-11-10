# Conversor de arquivos

| | |
|---|---|
| Slug | `conversor-arquivos` |
| Status | ativa |
| Versão atual | [v1](v1.md) |
| Repositórios | nord-tool-frontend |
| Onde no app | Mapeamentos > Bloco de notas > Converter |

## O que faz

Ferramentas no estilo do ILovePDF, todas no aparelho:
- juntar, dividir e organizar páginas de PDF;
- imagem, Word e Excel para PDF;
- PDF para imagem;
- comprimir PDF;
- numerar páginas;
- marca d'água;
- trocar o formato de imagens.

## Regras de negócio vigentes

- **RN-01** Nenhum arquivo vai ao servidor: tudo é feito no navegador e o resultado é baixado (ou, se for PDF, vira um caderno do bloco de notas). _(v1)_
- **RN-02** Páginas são escolhidas por intervalo ("1-3, 5, 8-"; vazio = todas); erro explica o que corrigir. _(v1)_
- **RN-03** Comprimir refaz as páginas como imagem (3 níveis) e mostra o antes e o depois; se não diminuir, fica o original. O texto do PDF comprimido deixa de ser selecionável. _(v1)_
- **RN-04** Mais de um arquivo de resultado (dividir página por página, PDF para várias imagens, várias imagens convertidas) sai num .zip. _(v1)_

## Onde está no código

- **Frontend:** `components/bloco/conversor/Conversor.tsx` (tela), `components/bloco/conversor/ferramentasNavegador.ts` (pdf.js, canvas, mammoth, xlsx, jszip), `utils/conversor.ts` (pdf-lib, testado em node), atalho em `pages/BlocoNotas.tsx`.

## Versões

| Versão | Data | Resumo | Branch | PRs |
|---|---|---|---|---|
| [v1](v1.md) | 2026-11-10 | 11 ferramentas estilo ILovePDF na central do bloco de notas | `feature-conversor-arquivos` | [frontend#165](https://github.com/nord-center-org/nord-tool-frontend/pull/165), [infra#36](https://github.com/nord-center-org/nord-center-infra-agent/pull/36) |

## Correções

| Data | Branch | O que foi corrigido | PRs |
|---|---|---|---|

## Dependências e impactos

`pdf-lib`, `pdfjs-dist`, `mammoth` e `xlsx`, que já estavam no frontend, e `jszip` (já vinha com o mammoth; agora é dependência direta). Usa `paginasDoDocumento` e `planilhaParaHtml` do bloco de notas.
