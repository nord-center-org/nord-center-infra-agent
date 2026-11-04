# Placas

| | |
|---|---|
| Slug | `placas` |
| Status | ativa |
| Versão atual | [v1](v1.md) |
| Repositórios | nord-tool-scripts-sql, nord-tool-backend, nord-tool-frontend |
| Onde no app | Mapeamentos > Placas (`/mapeamentos/placas`) |

## O que faz

Monta placas de aviso da obra para imprimir. Cada placa sai de um modelo de formato (foto de fundo com marca d'água, logo, caixa "OBRA:", painel com o quadro de texto e rodapé com a política) e baixa em PNG ou PDF A4. Os administradores mantêm os modelos; quem edita cria as placas da obra.

## Regras de negócio vigentes

- **RN-01** Modelos valem para todas as obras; placas são da obra escolhida no topo. _(v1)_
- **RN-02** Permissão `PLACAS`: Ver vê e baixa; Editar cria, altera e exclui placas; Admin cria, altera, copia e exclui modelos e envia a foto de fundo e o logo (PNG/JPEG até 5 MB). _(v1)_
- **RN-03** Um modelo com placas não é apagado: só deixa de aparecer para placas novas. _(v1)_
- **RN-04** O modelo define folha (A4 deitada ou em pé), cor e quanto escurece a foto de fundo, logo e altura, caixa do cabeçalho e rótulo, cor e cantos do painel, quadro (borda, cores, fonte, negrito, alinhamento, tamanho da letra fixo ou automático) e rodapé (título, texto, cores, tamanho); cada parte pode ser ligada ou desligada. _(v1)_
- **RN-05** A placa tem nome, o valor do cabeçalho, uma linha de texto por item (até 12) e, se quiser, um rodapé próprio; no tamanho automático, a letra é a maior que cabe no quadro. _(v1)_

## Onde está no código

- **SQL:** `DDL/63.placa_ddl.sql` (`placa_modelo`, `placa`; imagens em `arquivo_armazenado`).
- **Backend:** `PlacaReadController` e `PlacaWriteController` (`/api/v1/nord-tool/placas`), `PlacaServiceImpl`, `PlacaRepositoryImpl`, `query/placa.properties`, módulo `PLACAS`.
- **Frontend:** `pages/Placas.tsx`, `components/placas/PlacaVisual.tsx`, `services/PlacaService.ts`, `utils/placas.ts`.

## Versões

| Versão | Data | Resumo | Branch | PRs |
|---|---|---|---|---|
| [v1](v1.md) | 2026-11-04 | Modelos de placa, placas por obra e exportação em PNG/PDF A4 | `feature-placas` | [sql#66](https://github.com/nord-center-org/nord-tool-scripts-sql/pull/66), [backend#109](https://github.com/nord-center-org/nord-tool-backend/pull/109), [frontend#156](https://github.com/nord-center-org/nord-tool-frontend/pull/156), [infra#27](https://github.com/nord-center-org/nord-center-infra-agent/pull/27) |

## Correções

| Data | Branch | O que foi corrigido | PRs |
|---|---|---|---|

## Dependências e impactos

Usa a obra do contexto (`X-Obra`) e o armazenamento de arquivos. Permissão nova `PLACAS` na tela de Acessos.
