# Placas

| | |
|---|---|
| Slug | `placas` |
| Status | ativa |
| Versão atual | [v2](v2.md) |
| Repositórios | nord-tool-scripts-sql, nord-tool-backend, nord-tool-frontend |
| Onde no app | Mapeamentos > Placas (`/mapeamentos/placas`) |

## O que faz

Monta placas de aviso da obra para imprimir. Cada placa sai de um modelo de formato (foto de fundo com marca d'água, logo, caixa "OBRA:", painel com o quadro de texto e rodapé com a política) e baixa em PNG ou PDF A4. Dá para pôr imagens em qualquer lugar da folha, no modelo ou na placa, e mexer nelas como no Canva. Os administradores mantêm os modelos; quem edita cria as placas da obra.

## Regras de negócio vigentes

- **RN-01** Modelos valem para todas as obras; placas são da obra escolhida no topo. _(v1)_
- **RN-02** Permissão `PLACAS`: Ver vê e baixa; Editar cria, altera e exclui placas; Admin cria, altera, copia e exclui modelos e envia a foto de fundo e o logo (PNG/JPEG até 5 MB). _(v1)_
- **RN-03** Um modelo com placas não é apagado: só deixa de aparecer para placas novas. _(v1)_
- **RN-04** O modelo define folha (A4 deitada ou em pé), cor e quanto escurece a foto de fundo, logo e altura, caixa do cabeçalho e rótulo, cor e cantos do painel, quadro (borda, cores, fonte, negrito, alinhamento, tamanho da letra fixo ou automático) e rodapé (título, texto, cores, tamanho); cada parte pode ser ligada ou desligada. _(v1)_
- **RN-05** A placa tem nome, o valor do cabeçalho, uma linha de texto por item (até 12) e, se quiser, um rodapé próprio; no tamanho automático, a letra é a maior que cabe no quadro. _(v1)_
- **RN-06** Imagens soltas na folha: no modelo (saem em todas as placas dele; Admin) e na placa (só nela; Editar), até 20 em cada, JPEG/PNG até 5 MB (o PNG mantém a transparência). Cada uma tem posição, tamanho, giro, ordem e camada: atrás do painel (por cima da foto de fundo) ou na frente de tudo. As do modelo ficam embaixo das da placa. _(v2)_
- **RN-07** Editar a imagem na prévia: arrastar move (encaixa no centro e nas bordas da folha), os cantos redimensionam mantendo a proporção (Shift solta), os lados esticam, a bolinha de baixo gira (encaixa a cada 90°); setas movem 1 px (Shift: 10 px) e Delete apaga. _(v2)_

## Onde está no código

- **SQL:** `DDL/63.placa_ddl.sql` (`placa_modelo`, `placa`; imagens em `arquivo_armazenado`), `DDL/67.placa_imagem_ddl.sql` (`placa_imagem`).
- **Backend:** `PlacaReadController` e `PlacaWriteController` (`/api/v1/nord-tool/placas`), `PlacaServiceImpl`, `PlacaRepositoryImpl`, `query/placa.properties`, módulo `PLACAS`.
- **Frontend:** `pages/Placas.tsx`, `components/placas/PlacaVisual.tsx`, `components/placas/ImagensNaFolha.tsx`, `services/PlacaService.ts`, `utils/placas.ts`.

## Versões

| Versão | Data | Resumo | Branch | PRs |
|---|---|---|---|---|
| [v1](v1.md) | 2026-11-04 | Modelos de placa, placas por obra e exportação em PNG/PDF A4 | `feature-placas` | [sql#66](https://github.com/nord-center-org/nord-tool-scripts-sql/pull/66), [backend#109](https://github.com/nord-center-org/nord-tool-backend/pull/109), [frontend#156](https://github.com/nord-center-org/nord-tool-frontend/pull/156), [infra#27](https://github.com/nord-center-org/nord-center-infra-agent/pull/27) |
| [v2](v2.md) | 2026-11-10 | Imagens na folha (modelo e placa), editadas como no Canva | `feature-placas-v2` | [sql#70](https://github.com/nord-center-org/nord-tool-scripts-sql/pull/70), [backend#115](https://github.com/nord-center-org/nord-tool-backend/pull/115), [frontend#160](https://github.com/nord-center-org/nord-tool-frontend/pull/160), [infra#31](https://github.com/nord-center-org/nord-center-infra-agent/pull/31) |

## Correções

| Data | Branch | O que foi corrigido | PRs |
|---|---|---|---|

## Dependências e impactos

Usa a obra do contexto (`X-Obra`) e o armazenamento de arquivos. Permissão nova `PLACAS` na tela de Acessos.
