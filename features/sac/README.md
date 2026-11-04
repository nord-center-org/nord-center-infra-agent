# SAC

| | |
|---|---|
| Slug | `sac` |
| Status | ativa |
| Versão atual | [v1](v1.md) |
| Repositórios | nord-tool-scripts-sql, nord-tool-backend, nord-tool-frontend |
| Onde no app | Visão Geral > SAC (`/sac`) |

## O que faz

Canal para quem usa o NordTool pedir mudanças no sistema aos administradores. A pessoa escreve o pedido, tira prints de qualquer tela com a ferramenta de captura, marca os prints com seta, círculo, quadrado ou rabisco e envia. Os administradores veem todos os chamados, respondem e mudam o status; quem abriu acompanha em "Meus chamados".

## Regras de negócio vigentes

- **RN-01** Qualquer pessoa logada abre chamados (título até 120 caracteres, descrição até 4.000, até 6 imagens PNG/JPEG de até 5 MB) e vê só os dela. _(v1)_
- **RN-02** Quem tem ADMIN no módulo SAC (os administradores, pelo curinga, ou quem receber em Acessos) vê os chamados de todos, responde e muda o status: aberto, em andamento, resolvido ou recusado. _(v1)_
- **RN-03** Quem abriu pode excluir o chamado enquanto ele está aberto; o administrador pode excluir sempre. _(v1)_
- **RN-04** Os prints de um chamado só são vistos por quem abriu e pelos administradores. _(v1)_
- **RN-05** O rascunho (texto e prints) fica guardado enquanto a pessoa vai a outra tela tirar o print. _(v1)_

## Onde está no código

- **SQL:** `DDL/61.sac_chamado_ddl.sql` (`sac_chamado`, `sac_chamado_imagem`, imagens em `arquivo_armazenado`).
- **Backend:** `SacReadController` e `SacWriteController` (`/api/v1/nord-tool/sac`), `SacServiceImpl`, `SacRepositoryImpl`, `query/sac.properties`, módulo `SAC` em `Modulo`.
- **Frontend:** `pages/Sac.tsx`, `services/SacService.ts`, `utils/sac.ts`; captura em `components/lugia/CapturaLugiaProvider.tsx` (com destino); marcação com `components/relatorio/EditorFoto.tsx`.

## Versões

| Versão | Data | Resumo | Branch | PRs |
|---|---|---|---|---|
| [v1](v1.md) | 2026-11-04 | Chamados com prints marcados, resposta e status pelos administradores | `feature-sac` | [sql#64](https://github.com/nord-center-org/nord-tool-scripts-sql/pull/64), [backend#107](https://github.com/nord-center-org/nord-tool-backend/pull/107), [frontend#154](https://github.com/nord-center-org/nord-tool-frontend/pull/154), [infra#25](https://github.com/nord-center-org/nord-center-infra-agent/pull/25) |

## Correções

| Data | Branch | O que foi corrigido | PRs |
|---|---|---|---|

## Dependências e impactos

Reaproveita a ferramenta de captura da Lugia (agora o print volta para a tela que pediu) e o editor de fotos do [relatório fotográfico](../README.md). Permissão nova `SAC` na tela de Acessos.
