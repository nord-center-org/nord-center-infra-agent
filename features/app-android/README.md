# App Android

| | |
|---|---|
| Slug | `app-android` |
| Status | ativa |
| Versão atual | [v3](v3.md) |
| Repositórios | nord-tool-scripts-sql, nord-tool-backend, nord-tool-frontend |
| Onde no app | Menu lateral > Baixar app Android |

## O que faz

App Android (APK) que abre o NordTool publicado numa WebView. O APK é baixado pelo botão no rodapé do menu lateral e instalado fora da loja. Desde a v2, a sessão não cai e o app fica ativo em segundo plano, mostrando os avisos do NordTool nas notificações do celular.

## Regras de negócio vigentes

- **RN-01** O botão "Baixar app Android" aparece no rodapé do menu lateral, menos dentro do próprio app (user agent com `NordToolAndroid`) e no iPhone/iPad. _(v1)_
- **RN-02** O APK é servido pelo próprio frontend em `/app/nordtool.apk`, sem hospedagem extra. _(v1)_
- **RN-03** O app abre o endereço publicado do NordTool. Links de outros sites abrem no navegador do celular. _(v1)_
- **RN-04** Os downloads feitos no app, inclusive os gerados no navegador (PDF, planilhas, imagens), vão para a pasta Downloads do celular. _(v1)_
- **RN-05** A chave de assinatura nunca vai para o repositório. Toda atualização do APK é assinada com a mesma chave, senão o Android não instala por cima. _(v1)_

- **RN-06** Quem baixa o app recebe sempre todas as funções atuais: as mudanças do site chegam sozinhas pela WebView, e toda mudança no próprio app gera um APK novo no mesmo PR, assinado com a mesma chave ([policies/app-android.md](../../policies/app-android.md)). _(v1)_
- **RN-07** No app, a sessão não cai. Ao entrar com a senha, o aparelho é registrado e passa a abrir sessões novas sozinho: ao reabrir, sem atividade, no fim da sessão e depois de um 401. _(v2)_
- **RN-08** O aparelho é desconectado (e pede a senha de novo) quando a pessoa sai da conta, troca a senha, o administrador encerra as sessões ou reseta a senha, a conta é desativada ou o app fica 60 dias sem uso. Cada pessoa tem no máximo 10 aparelhos. _(v2)_
- **RN-09** O app fica ativo em segundo plano, com uma notificação fixa "NordTool ativo", e volta sozinho quando o celular reinicia. A cada 30 segundos mostra os avisos novos da caixa de notificações. _(v2)_
- **RN-10** O token do aparelho fica só no armazenamento privado do app; no servidor fica só o hash. A ponte com a página só responde com o NordTool aberto. _(v2)_
- **RN-11** Ao abrir o app, ele confere `/app/versao.json`. Havendo versão nova, baixa o APK sozinho e mostra a confirmação de instalação do Android; a pessoa só autoriza. A primeira vez pede a permissão "Instalar apps desconhecidos". _(v3)_
- **RN-12** `public/app/versao.json` acompanha sempre o `versionCode`/`versionName` do APK publicado; um teste do frontend falha se não acompanhar. _(v3)_

## Onde está no código

- **Frontend:**
  - `android/`: projeto Gradle, `MainActivity.java` (WebView e ponte), `ServicoSegundoPlano.java`, `Inicializacao.java`, `Atualizador.java`, `Api.java` e `Armazenamento.java`;
  - `services/sessaoApp.ts` e `components/AuthProvider.tsx`: a sessão pelo aparelho;
  - `public/app/nordtool.apk` e `public/app/versao.json`: APK publicado e a versão dele;
  - `utils/appAndroid.ts`: regra do botão;
  - o botão no rodapé de `components/Layout.tsx`.
- **Backend:** `/auth/aparelho*` em `AuthWriteController` e `AuthServiceImpl`, `AppAparelhoRepositoryImpl`, `query/app-aparelho.properties`.
- **SQL:** `DDL/76.app_android_atividade_ddl.sql` (`app_aparelho`).

## Versões

| Versão | Data | Resumo | Branch | PRs |
|---|---|---|---|---|
| [v1](v1.md) | 2026-11-18 | APK em WebView e botão de download no menu lateral | `feature-app-android` | [frontend#206](https://github.com/nord-center-org/nord-tool-frontend/pull/206), [infra#77](https://github.com/nord-center-org/nord-center-infra-agent/pull/77) |
| [v2](v2.md) | 2026-11-18 | Sessão que não cai, app em segundo plano com avisos e alterações com quem fez | `feature-app-android-v2` | [sql#79](https://github.com/nord-center-org/nord-tool-scripts-sql/pull/79), [backend#130](https://github.com/nord-center-org/nord-tool-backend/pull/130), [frontend#207](https://github.com/nord-center-org/nord-tool-frontend/pull/207), [infra#78](https://github.com/nord-center-org/nord-center-infra-agent/pull/78) |
| [v3](v3.md) | 2026-11-18 | O app se atualiza sozinho (baixa e só pede para confirmar) | `feature-app-android-v3` | [frontend#208](https://github.com/nord-center-org/nord-tool-frontend/pull/208), [infra#79](https://github.com/nord-center-org/nord-center-infra-agent/pull/79) |

## Correções

| Data | Branch | O que foi corrigido | PRs |
|---|---|---|---|
| 2026-11-18 | `fix-app-android-barra-status` | No Android 15 a barra de horário ficava por cima da página (o app ocupa a tela toda com targetSdk 35). A página agora fica entre as barras: faixa azul em cima e o espaço da navegação e do teclado embaixo. APK 4.0, entregue pela atualização automática da v3. | [frontend#209](https://github.com/nord-center-org/nord-tool-frontend/pull/209), [infra#PRINFRA](https://github.com/nord-center-org/nord-center-infra-agent/pull/PRINFRA) |

## Dependências e impactos

Nenhuma dependência nova no frontend. O build do APK precisa do Android SDK (35) e do JDK 17 ou mais novo, só na máquina de quem gera o APK. O app depende do endereço publicado do NordTool: se o domínio mudar, gere um novo APK com `-PenderecoNordTool=<url>`.
