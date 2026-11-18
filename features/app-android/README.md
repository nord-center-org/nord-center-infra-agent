# App Android

| | |
|---|---|
| Slug | `app-android` |
| Status | ativa |
| Versão atual | [v1](v1.md) |
| Repositórios | nord-tool-frontend |
| Onde no app | Menu lateral > Baixar app Android |

## O que faz

App Android (APK) que abre o NordTool publicado numa WebView. O APK é baixado pelo botão no rodapé do menu lateral e instalado fora da loja.

## Regras de negócio vigentes

- **RN-01** O botão "Baixar app Android" aparece no rodapé do menu lateral, menos dentro do próprio app (user agent com `NordToolAndroid`) e no iPhone/iPad. _(v1)_
- **RN-02** O APK é servido pelo próprio frontend em `/app/nordtool.apk`, sem hospedagem extra. _(v1)_
- **RN-03** O app abre o endereço publicado do NordTool. Links de outros sites abrem no navegador do celular. _(v1)_
- **RN-04** Os downloads feitos no app, inclusive os gerados no navegador (PDF, planilhas, imagens), vão para a pasta Downloads do celular. _(v1)_
- **RN-05** A chave de assinatura nunca vai para o repositório. Toda atualização do APK é assinada com a mesma chave, senão o Android não instala por cima. _(v1)_

## Onde está no código

- **Frontend:**
  - `android/`: projeto Gradle e `MainActivity.java`;
  - `public/app/nordtool.apk`: APK publicado;
  - `utils/appAndroid.ts`: regra do botão;
  - o botão no rodapé de `components/Layout.tsx`.

## Versões

| Versão | Data | Resumo | Branch | PRs |
|---|---|---|---|---|
| [v1](v1.md) | 2026-11-18 | APK em WebView e botão de download no menu lateral | `feature-app-android` | [frontend#206](https://github.com/nord-center-org/nord-tool-frontend/pull/206), infra#PRINFRA |

## Correções

| Data | Branch | O que foi corrigido | PRs |
|---|---|---|---|

## Dependências e impactos

Nenhuma dependência nova no frontend. O build do APK precisa do Android SDK (35) e do JDK 17 ou mais novo, só na máquina de quem gera o APK. O app depende do endereço publicado do NordTool: se o domínio mudar, gere um novo APK com `-PenderecoNordTool=<url>`.
