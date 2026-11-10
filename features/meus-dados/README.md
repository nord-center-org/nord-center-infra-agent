# Meus dados

| | |
|---|---|
| Slug | `meus-dados` |
| Status | ativa |
| Versão atual | [v1](v1.md) |
| Repositórios | nord-tool-backend, nord-tool-frontend |
| Onde no app | Configurações > Meus dados (`/conta/dados`) |

## O que faz

Cada pessoa preenche e altera os próprios dados (nome, celular e empresa), como o administrador faz por ela em Acessos. Cargo e e-mail aparecem na tela.

## Regras de negócio vigentes

- **RN-01** Qualquer pessoa logada vê e altera só os próprios dados. _(v1)_
- **RN-02** O cargo não muda por aqui: ele dá os acessos e é definido pelo administrador. Um cargo enviado pela API é ignorado. _(v1)_
- **RN-03** O e-mail de login muda só pela tela "Alterar e-mail", que pede a senha. _(v1)_
- **RN-04** A empresa precisa existir no cadastro; o celular aceita 8 a 20 caracteres entre números, espaço, parênteses, + e -. _(v1)_

## Onde está no código

- **Backend:**
  - `MeusDadosReadController` e `MeusDadosWriteController` (`/api/v1/nord-tool/conta/dados`);
  - `MeusDadosServiceImpl`, que reusa `AcessoRepository.alterarDados` e `EmpresaRepository`;
  - `MeusDadosDto` e `MeusDadosForm`.
- **Frontend:**
  - `pages/MeusDados.tsx`;
  - `services/MeusDadosService.ts`;
  - o botão em `pages/Settings.tsx` e a rota em `App.tsx`.

## Versões

| Versão | Data | Resumo | Branch | PRs |
|---|---|---|---|---|
| [v1](v1.md) | 2026-11-10 | Cada pessoa altera o próprio nome, celular e empresa | `feature-meus-dados` | [backend#120](https://github.com/nord-center-org/nord-tool-backend/pull/120), [frontend#167](https://github.com/nord-center-org/nord-tool-frontend/pull/167), [infra#38](https://github.com/nord-center-org/nord-center-infra-agent/pull/38) |

## Correções

| Data | Branch | O que foi corrigido | PRs |
|---|---|---|---|

## Dependências e impactos

Usa a mesma gravação dos dados que a tela de Acessos (administração) e o `/auth/refresh` para o nome novo aparecer sem novo login.
