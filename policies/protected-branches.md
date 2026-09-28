# Política de branches

- `master` é a branch canônica que espelha o código liberado para produção. Ela não precisa ser a branch padrão do GitHub; `develop` pode continuar como padrão.
- `main`, se existir em algum repositório, não é branch canônica de produção e também fica fora de alterações automáticas.
- `develop` é o único destino permitido para integração automática em qualquer repositório consumidor.
- Criar uma branch de trabalho a partir de `develop`; manter nela o commit da alteração e direcionar o PR exclusivamente a `develop`.
- Assim que todas as verificações configuradas passarem e não houver conflitos, mesclar para `develop` para refletir a alteração imediatamente nessa branch.
- Promover de `develop` para `master` é um processo de release separado; o agente não publica nem mescla automaticamente em `master`.
- As regras nativas de proteção do GitHub são uma camada opcional e não são requisito para o MCP funcionar. Os bloqueios em `main`, `master` e `develop` devem permanecer no próprio MCP, mesmo quando as regras nativas estiverem ausentes.
- Sem proteção nativa, o GitHub não impede pushes diretos feitos fora do MCP. A credencial do agente deve ficar privada e o caminho de escrita deve permanecer limitado às ferramentas do servidor.
- Não fazer push forçado, excluir branches ou contornar proteções.
- Se `develop` não existir ou não puder receber o merge, interromper e informar; não usar `main`, `master` ou outro destino.
- Respeite proteções adicionais definidas no repositório remoto, mesmo que sejam mais restritivas.
