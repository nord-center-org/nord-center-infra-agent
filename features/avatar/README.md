# Avatar

| | |
|---|---|
| Slug | `avatar` |
| Status | ativa |
| Versão atual | [v2](v2.md) |
| Repositórios | nord-tool-backend, nord-tool-frontend |
| Onde no app | Configurações > Meu avatar (`/conta/avatar`); aparece no menu e na home |

## O que faz

Cada pessoa monta o próprio boneco em pixel art (32×32), com:
- função na obra (roupa e cor do capacete), pele, cabelo, olhos, sobrancelhas, boca, barba, acessórios, detalhes e fundo;
- traços masculinos ou femininos, batom e enfeites.

Ele aparece no menu e na home, pisca e "respira". Nas datas comemorativas veste o tema da época.

## Regras de negócio vigentes

- **RN-01** Quem nunca montou o avatar ganha um padrão estável, sorteado pelo id e com a roupa da função do cargo. _(v1)_
- **RN-02** O avatar salvo é lido com tolerância: o que faltar ou vier inválido cai no padrão da pessoa. _(v1)_
- **RN-03** Nas datas comemorativas (Natal, Ano Novo, Carnaval, Páscoa, festa junina, Halloween), o avatar veste o tema, se a pessoa deixou ligado. _(v1)_
- **RN-04** Traços femininos: cílios, bochechas rosadas e decote. Laço, tiara e flor só aparecem sem capacete; argolas e pérolas aparecem sempre. O padrão continua masculino, sem batom e sem enfeite, para quem já tinha avatar não ver mudança. _(v2)_

## Onde está no código

- **Frontend:** `utils/avatar.ts` (opções, padrão, leitura), `utils/avatarPixel.ts` (desenho), `components/avatar/`, `pages/MeuAvatar.tsx`, `hooks/useMeuAvatar.ts`.
- **Backend:** o avatar é guardado como JSON por usuário (serviço de avatar, `query/avatar.properties`).

## Versões

| Versão | Data | Resumo | Branch | PRs |
|---|---|---|---|---|
| [v1](v1.md) | 2026-10 (retroativo) | Criador de avatar em pixel art com funções da obra e datas comemorativas | não registrada | não registrados |
| [v2](v2.md) | 2026-11-10 | Versão feminina: traços, batom, cabelos e enfeites | `feature-avatar-v2` | [frontend#168](https://github.com/nord-center-org/nord-tool-frontend/pull/168), [infra#39](https://github.com/nord-center-org/nord-center-infra-agent/pull/39) |

## Correções

| Data | Branch | O que foi corrigido | PRs |
|---|---|---|---|

## Dependências e impactos

Só desenho no frontend; o JSON salvo ganhou campos opcionais e não muda no banco.
