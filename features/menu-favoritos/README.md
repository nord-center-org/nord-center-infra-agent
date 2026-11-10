# Favoritos do menu

| | |
|---|---|
| Slug | `menu-favoritos` |
| Status | ativa |
| Versão atual | [v1](v1.md) |
| Repositórios | nord-tool-scripts-sql, nord-tool-backend, nord-tool-frontend |
| Onde no app | Menu lateral, em todas as telas |

## O que faz

Cada tela do menu lateral tem um tijolo; marcado, a tela entra no grupo "Favoritos", no topo do menu, para achar mais rápido as telas mais usadas.

## Regras de negócio vigentes

- **RN-01** Qualquer pessoa logada marca os próprios favoritos; até 40, na ordem em que foram marcados. _(v1)_
- **RN-02** O grupo "Favoritos" só mostra as telas que a pessoa pode abrir; a tela também continua no grupo dela. _(v1)_
- **RN-03** Os favoritos ficam no servidor (valem em todos os aparelhos), com uma cópia no aparelho para o menu abrir na hora; se o servidor recusar, a marcação volta como estava. _(v1)_

## Onde está no código

- **SQL:** `DDL/70.menu_favorito_ddl.sql` (`usuario_menu_favorito`).
- **Backend:** `MenuFavoritoReadController` e `MenuFavoritoWriteController` (`/api/v1/nord-tool/menu-favoritos`), `MenuFavoritoServiceImpl`, `MenuFavoritoRepositoryImpl`, `query/menu-favorito.properties`.
- **Frontend:** `components/Layout.tsx` (tijolo e grupo), `utils/menuFavoritos.ts`, `services/MenuFavoritoService.ts`.

## Versões

| Versão | Data | Resumo | Branch | PRs |
|---|---|---|---|---|
| [v1](v1.md) | 2026-11-10 | Tijolo para marcar telas e grupo Favoritos no topo do menu | `feature-menu-favoritos` | [sql#73](https://github.com/nord-center-org/nord-tool-scripts-sql/pull/73), [backend#118](https://github.com/nord-center-org/nord-tool-backend/pull/118), [frontend#163](https://github.com/nord-center-org/nord-tool-frontend/pull/163), [infra#34](https://github.com/nord-center-org/nord-center-infra-agent/pull/34) |

## Correções

| Data | Branch | O que foi corrigido | PRs |
|---|---|---|---|

## Dependências e impactos

Mexe no menu lateral (`Layout.tsx`), que todas as telas usam. O ícone é o `BrickWall` do `lucide-react`, que já estava no frontend.
