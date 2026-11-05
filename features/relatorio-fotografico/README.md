# Relatório fotográfico

| | |
|---|---|
| Slug | `relatorio-fotografico` |
| Status | ativa |
| Versão atual | [v2](v2.md) |
| Repositórios | nord-tool-scripts-sql, nord-tool-backend, nord-tool-frontend |
| Onde no app | Mapeamentos > Relatório fotográfico (`/mapeamentos/relatorio-fotografico`) |

## O que faz

Relatórios com fotos organizadas por item (observação + fotos), criados livres ou a partir de modelos, com edição de foto (cortar, girar, marcar) e PDF no layout escolhido. Cada relatório é de quem criou; dá para compartilhar com pessoas e equipes, e o administrador do módulo vê todos.

## Regras de negócio vigentes

- **RN-01** Permissão `RELATORIO_FOTOGRAFICO`: Ver lista, abre e baixa; Editar cria e preenche os próprios; Admin mantém os modelos e vê, altera e compartilha os relatórios de todos. _(v1, v2)_
- **RN-02** Um modelo traz itens, layout da página, fonte, cabeçalho, marca d'água e ícone; modelo desativado não serve para relatório novo. _(v1)_
- **RN-03** Até 200 fotos por relatório; cada imagem até 5 MB, reduzida no aparelho (até 1280 px) antes de enviar. _(v1)_
- **RN-04** Relatório concluído não é editado; reabrir volta para preenchimento. _(v1)_
- **RN-05** O relatório é de quem criou, não da obra/fase: cada pessoa vê os seus e os compartilhados com ela. _(v2)_
- **RN-06** Quem criou (ou o administrador) compartilha com pessoas, com a própria equipe da hierarquia ou com uma equipe do cronograma (marca todos os membros); até 200 pessoas ativas. Quem recebe vê e baixa o PDF, mas não altera. _(v2)_

## Onde está no código

- **SQL:** `DDL/*relatorio_fotografico*` (relatórios, itens, fotos e modelos), `DDL/65.relatorio_compartilhamento_ddl.sql`.
- **Backend:** `RelatorioFotograficoReadController` e `RelatorioFotograficoWriteController` (`/api/v1/nord-tool/relatorios-fotograficos`), `RelatorioFotograficoServiceImpl`, `RelatorioFotograficoRepositoryImpl`, `RelatorioLayouts`, `query/relatorio-fotografico.properties`.
- **Frontend:** `pages/RelatorioFotografico.tsx`, `components/relatorio/` (`EditorRelatorio`, `NovoRelatorioModal`, `ModelosModal`, `EditorFoto`, `CapturaFoto`, `SeletorLayout`), `components/cronograma/CompartilharItem.tsx`, `services/RelatorioFotograficoService.ts`, `utils/relatorioFotografico.ts`, `utils/pdfRelatorioFotografico.ts`.

## Versões

| Versão | Data | Resumo | Branch | PRs |
|---|---|---|---|---|
| [v1](v1.md) | — (retroativo) | Relatórios por obra/fase, modelos, edição de fotos e PDF | — | não registrados |
| [v2](v2.md) | 2026-11-05 | Relatórios por usuário, administrador vê todos e compartilhamento com pessoas e equipes | `feature-relatorio-fotografico-v2` | _(a preencher)_ |

## Correções

| Data | Branch | O que foi corrigido | PRs |
|---|---|---|---|

## Dependências e impactos

Usa as pessoas (hierarquia) e as equipes do [cronograma semanal](../cronograma-semanal/README.md) para compartilhar e o armazenamento de arquivos para as fotos e imagens dos modelos.
