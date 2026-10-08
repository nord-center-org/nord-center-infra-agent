# Política de branches

- `master` é a branch canônica que espelha o código liberado para produção. Ela não precisa ser a branch padrão do GitHub; `develop` pode continuar como padrão.
- `main`, se existir em algum repositório, não é branch canônica de produção e também fica fora de alterações automáticas.
- `develop` é o único destino permitido para integração automática em qualquer repositório trabalhado por esta infra.
- Para toda tarefa, incluindo elaboração do plano, criar uma branch de trabalho a partir da referência atualizada de `develop` antes de editar qualquer arquivo; manter nela plano, implementação, documentação e commits.
- `develop` é protegida: não editar arquivos, commitar, fazer push, cherry-pick ou executar merge local diretamente nela.
- Após concluir todo o plano, revisar o diff e passar todas as verificações, publicar somente a branch de trabalho e abrir um Pull Request exclusivamente com destino `develop`.
- Assim que o plano estiver completo, o PR estiver mergeable e CI/revisões/proteções exigidas tiverem passado, fazer squash merge automaticamente pelo PR, sem aguardar nova solicitação do usuário.
- Se PR, sincronização, validação ou resolução de conflito falhar, deixar o trabalho na branch e reportar. Se o GitHub exigir aprovação humana, aguardar no PR; nunca contornar a regra nem fazer merge local.
- Promover de `develop` para `master` é um processo de release separado; o agente não publica nem mescla automaticamente em `master`.
- As regras nativas de proteção do GitHub devem ser habilitadas para exigir PR em `develop`, bloquear pushes e commits diretos, exigir revisões e verificações. O MCP também deve rejeitar operações diretas em `develop`, `main` e `master`; manter esses bloqueios mesmo quando as regras nativas estiverem ausentes.
- Sem proteção nativa, o GitHub não impede pushes diretos feitos fora do MCP. A credencial do agente deve ficar privada e o caminho de escrita deve permanecer limitado às ferramentas do servidor.
- Não fazer push forçado, excluir branches ou contornar proteções.
- Se `develop` não existir ou não puder ser atualizada, se o PR não puder ser criado/mesclado automaticamente por indisponibilidade de ferramenta, proteção/revisão exigida ou conflito, interromper e informar; não fazer merge local e não usar `main`, `master` ou outro destino.
- Respeite proteções adicionais definidas no repositório remoto, mesmo que sejam mais restritivas.
