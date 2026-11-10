# Avatar

| | |
|---|---|
| Slug | `avatar` |
| Status | ativa |
| Versão atual | [v3](v3.md) |
| Repositórios | nord-tool-backend, nord-tool-frontend |
| Onde no app | Configurações > Meu avatar (`/conta/avatar`); aparece no menu e na home |

## O que faz

Cada pessoa monta o próprio boneco em pixel art (32×32), com:
- função na obra (roupa e cor do capacete), pele, cabelo, olhos, sobrancelhas, boca, barba, acessórios, detalhes e fundo;
- traços masculinos ou femininos, batom e enfeites.

Ele aparece no menu e na home, pisca e "respira". Nas datas comemorativas veste o tema da época. O avatar do dono do NordTool conta as novidades na tela inicial, com um cafezinho ou o rádio na mão.

## Regras de negócio vigentes

- **RN-01** Quem nunca montou o avatar ganha um padrão estável, sorteado pelo id e com a roupa da função do cargo. _(v1)_
- **RN-02** O avatar salvo é lido com tolerância: o que faltar ou vier inválido cai no padrão da pessoa. _(v1)_
- **RN-03** Nas datas comemorativas (Natal, Ano Novo, Carnaval, Páscoa, festa junina, Halloween), o avatar veste o tema, se a pessoa deixou ligado. _(v1)_
- **RN-04** Traços femininos: cílios, bochechas rosadas e decote. Laço, tiara e flor só aparecem sem capacete; argolas e pérolas aparecem sempre. O padrão continua masculino, sem batom e sem enfeite, para quem já tinha avatar não ver mudança. _(v2)_
- **RN-05** As novidades da tela inicial são contadas pelo avatar do porta-voz: o usuário ativo do e-mail configurado no servidor ou, sem ele, o ADMIN ativo mais antigo. Só o primeiro nome dele aparece. Sem porta-voz, quem conta é o Lugia Nexus. _(v3)_
- **RN-06** O porta-voz segura uma caneca de café nas horas pares e o rádio de obra nas ímpares. _(v3)_

## Onde está no código

- **Frontend:** `utils/avatar.ts` (opções, padrão, leitura), `utils/avatarPixel.ts` (desenho), `components/avatar/`, `pages/MeuAvatar.tsx`, `hooks/useMeuAvatar.ts`; v3: `components/mascote/LugiaNexus.tsx` e `utils/nexus.ts`.
- **Backend:** o avatar é guardado como JSON por usuário (serviço de avatar, `query/avatar.properties`); v3: `GET /avatares/porta-voz` e `nord-tool.novidades.porta-voz-email`.

## Versões

| Versão | Data | Resumo | Branch | PRs |
|---|---|---|---|---|
| [v1](v1.md) | 2026-10 (retroativo) | Criador de avatar em pixel art com funções da obra e datas comemorativas | não registrada | não registrados |
| [v2](v2.md) | 2026-11-10 | Versão feminina: traços, batom, cabelos e enfeites | `feature-avatar-v2` | [frontend#168](https://github.com/nord-center-org/nord-tool-frontend/pull/168), [infra#39](https://github.com/nord-center-org/nord-center-infra-agent/pull/39) |
| [v3](v3.md) | 2026-11-10 | O avatar do dono conta as novidades, com cafezinho ou rádio | `feature-avatar-v3` | [backend#122](https://github.com/nord-center-org/nord-tool-backend/pull/122), [frontend#170](https://github.com/nord-center-org/nord-tool-frontend/pull/170), [infra#41](https://github.com/nord-center-org/nord-center-infra-agent/pull/41) |

## Correções

| Data | Branch | O que foi corrigido | PRs |
|---|---|---|---|

## Dependências e impactos

Só desenho no frontend; o JSON salvo ganhou campos opcionais e não muda no banco. A v3 usa a variável `NORD_NOVIDADES_PORTA_VOZ_EMAIL` (opcional; padrão `NORD_ADMIN_EMAIL`) e substitui o mascote das novidades.
