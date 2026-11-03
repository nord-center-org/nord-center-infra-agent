# Aparência

| | |
|---|---|
| Slug | `aparencia` |
| Status | ativa |
| Versão atual | [v2](v2.md) |
| Repositórios | nord-tool-frontend |
| Onde no app | Configurações > Aparência (`/configuracoes#aparencia`) e o botão de sol/lua no canto de cada tela |

## O que faz

Deixa cada pessoa escolher como o app aparece no aparelho dela: tema claro, escuro ou igual ao aparelho, com tema próprio por tela, e as animações seguindo o aparelho, sempre ligadas ou desligadas.

## Regras de negócio vigentes

- **RN-01** Cada tela mostra o tema próprio, se tiver; senão, o tema geral. _(v1)_
- **RN-02** As escolhas valem por aparelho. _(v1)_
- **RN-03** As animações seguem o "reduzir movimento" do aparelho, a não ser que a pessoa escolha "Sempre ligadas" ou "Desligadas"; a escolha vale para todo o app, inclusive o login. _(v2)_

## Onde está no código

- **Frontend:** `utils/tema.ts`, `utils/movimento.ts`, `components/tema/` (`TemaProvider`, `BotaoTema`, `AparenciaConfig`), `tema-escuro.css`, script no `index.html`, e as regras `html.nt-menos-movimento` em `index.css` e nos CSS das cenas.

## Versões

| Versão | Data | Resumo | Branch | PRs |
|---|---|---|---|---|
| [v1](v1.md) | 2026-11-03 | Registro retroativo do tema claro/escuro | — | — |
| [v2](v2.md) | 2026-11-03 | Opção de animações (seguir o aparelho, sempre ligadas, desligadas) | `feature-aparencia-v2` | [frontend#152](https://github.com/nord-center-org/nord-tool-frontend/pull/152), [infra#21](https://github.com/nord-center-org/nord-center-infra-agent/pull/21) |

## Correções

| Data | Branch | O que foi corrigido | PRs |
|---|---|---|---|

## Dependências e impactos

As cenas animadas do login e do início (cena da obra, desfile, avatares), o tutorial, o Lugia Nexus e o Davi Job respeitam a escolha de animações.
