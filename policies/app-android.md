# App Android sempre atualizado

O NordTool tem um app Android (feature [`app-android`](../features/app-android/README.md)), baixado pelo botão "Baixar app Android" no menu lateral. Pedido do Nick: **quem baixar o app tem que receber sempre todas as funções atuais.**

## Como isso é garantido

- O app é uma WebView do NordTool publicado. **Toda mudança do site** (frontend, backend, SQL, `lugia-center`) chega ao app sozinha, depois do deploy, sem novo APK. Quem já instalou também recebe tudo na hora.
- O APK só precisa ser gerado de novo quando muda **o próprio app**: qualquer arquivo em `nord-tool-frontend/android/`, o endereço publicado do NordTool ou o ícone em `public/icones/`.

## Regras para toda entrega

1. **Mudou o app:** no mesmo PR do frontend,
   - aumente `versionCode` (+1) e `versionName` em `android/app/build.gradle`;
   - gere o APK assinado com `./gradlew assembleRelease`;
   - copie o resultado para `public/app/nordtool.apk`;
   - confira com `apksigner verify` que a assinatura é a mesma da versão anterior.
2. **Assine sempre com a chave original**, que está com o Nick (`nordtool.jks` + `assinatura.properties`). Ela nunca vai para o repositório. Sem a chave, peça ao Nick; nunca gere uma chave nova, porque o Android recusa instalar a atualização por cima.
3. **Nova função do site que o app não suporta:** adapte o app na mesma entrega e gere o APK novo. Exemplos: câmera, microfone, notificação, abrir arquivo, compartilhar.
4. **Domínio publicado mudou:** gere o APK com `-PenderecoNordTool=<novo endereço>` na mesma entrega.
5. Registre a mudança do app como versão nova ou correção da feature `app-android`.
