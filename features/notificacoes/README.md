# Notificações no celular

| | |
|---|---|
| Slug | `notificacoes` |
| Status | ativa |
| Versão atual | [v1](v1.md) |
| Repositórios | nord-tool-scripts-sql, nord-tool-backend, nord-tool-frontend |
| Onde no app | Configurações > Notificações no celular (`/configuracoes#notificacoes`) |

## O que faz

Manda avisos do NordTool direto para o celular (ou computador), mesmo com o app fechado, por Web Push. Cada pessoa ativa em cada aparelho e escolhe o que quer receber: demanda nova, demanda alterada, horário agendado chegando, prazo do dia e resposta no SAC.

## Regras de negócio vigentes

- **RN-01** As notificações são ligadas por aparelho, por quem está logado, em Configurações; no iPhone/iPad só depois de adicionar o NordTool à Tela de Início (iOS 16.4+). _(v1)_
- **RN-02** As preferências valem para todos os aparelhos da pessoa; quem nunca mexeu recebe tudo, com o lembrete de horário 30 min antes. _(v1)_
- **RN-03** Demanda do cronograma: avisa o dono e as pessoas com quem ela é compartilhada quando ela é criada, alterada ou muda de etapa; ao compartilhar, avisa só quem entrou agora. Quem fez a ação também recebe se deixou ligado "O que eu mesmo fiz". _(v1)_
- **RN-04** Horário: demanda agendada (não fixa, não finalizada) avisa a antecedência escolhida (na hora, 10, 15, 30, 60 ou 120 min antes), uma vez por horário. _(v1)_
- **RN-05** Prazo: a partir das 8h (Brasília), uma vez por dia, das demandas com prazo hoje que não estão finalizadas. _(v1)_
- **RN-06** SAC: avisa quem abriu o chamado quando outra pessoa responde ou muda o status. _(v1)_
- **RN-07** Um aparelho é de quem ativou por último; sair da conta desliga o aviso naquele aparelho; o servidor apaga aparelhos cuja inscrição expirou. _(v1)_
- **RN-08** Um aviso que falha nunca impede a ação na tela (gravar, mover, responder). _(v1)_

## Onde está no código

- **SQL:** `DDL/64.notificacao_push_ddl.sql` (`push_inscricao`, `notificacao_preferencia`, `notificacao_enviada`, `push_chave`).
- **Backend:** `NotificacaoReadController` e `NotificacaoWriteController` (`/api/v1/nord-tool/notificacoes`), `NotificacaoServiceImpl`, `NotificacaoRepositoryImpl`, `query/notificacao.properties`, `service/push/` (`WebPushCripto`, `PushEnviador`, `LembretesAgendador`), ganchos em `CronogramaSemanalServiceImpl` e `SacServiceImpl`.
- **Frontend:** `public/sw.js`, `public/manifest.webmanifest`, `public/icones/`, `components/notificacoes/NotificacoesConfig.tsx`, `services/NotificacaoService.ts`, `utils/notificacoes.ts`.

## Versões

| Versão | Data | Resumo | Branch | PRs |
|---|---|---|---|---|
| [v1](v1.md) | 2026-11-05 | Web Push por aparelho com avisos do cronograma, lembretes de horário e prazo e respostas do SAC | `feature-notificacoes` | [sql#67](https://github.com/nord-center-org/nord-tool-scripts-sql/pull/67), [backend#110](https://github.com/nord-center-org/nord-tool-backend/pull/110), [frontend#157](https://github.com/nord-center-org/nord-tool-frontend/pull/157), [infra#28](https://github.com/nord-center-org/nord-center-infra-agent/pull/28) |

## Correções

| Data | Branch | O que foi corrigido | PRs |
|---|---|---|---|

## Dependências e impactos

Ouve eventos do [cronograma semanal](../cronograma-semanal/README.md) e do [SAC](../sac/README.md). Configuração opcional no backend: `NORD_PUSH_VAPID_PUBLIC`/`NORD_PUSH_VAPID_PRIVATE` (senão o par é gerado e guardado no banco), `NORD_PUSH_SUBJECT` (ou `NORD_APP_URL`) e `NORD_PUSH_LEMBRETES=false` para desligar os lembretes numa instância.
