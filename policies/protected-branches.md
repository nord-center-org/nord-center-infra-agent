# Branches protegidas

- `main` e `master`, quando existirem, nunca são destinos de alterações, commits ou merges automáticos do agente.
- `develop` é o único destino permitido para integração automática em qualquer repositório consumidor.
- Criar uma branch de trabalho a partir de `develop`; manter nela o commit da alteração e direcionar o PR exclusivamente a `develop`.
- Assim que todas as verificações configuradas passarem e não houver conflitos, mesclar para `develop` para refletir a alteração imediatamente nessa branch.
- Não fazer push forçado, excluir branches ou contornar proteções.
- Se `develop` não existir ou não puder receber o merge, interromper e informar; não usar `main`, `master` ou outro destino.
- Respeite proteções adicionais definidas no repositório remoto, mesmo que sejam mais restritivas.
