# Promoção para produção

A promoção de `develop` para `master` é uma operação de release humana. Nenhuma ferramenta MCP, cliente remoto ou credencial de automação pode escrever diretamente em `master`, criar PR automático com destino `master` ou mesclar esse PR.

## Fluxo manual

1. Confirme que a mudança já está integrada em `develop` e que as validações do repositório passaram.
2. Revise o diff entre `develop` e `master`, incluindo migrações SQL e requisitos de publicação.
3. Um owner da organização (`zzNICK` ou `NigmaLore`) abre e revisa um PR de release de `develop` para `master`.
4. Execute as verificações e o processo de publicação definidos para o projeto. Só então o owner autorizado conclui manualmente o merge.
5. Em caso de falha, mantenha `master` inalterada e corrija a release em `develop` antes de abrir outro PR.

As proteções nativas do GitHub devem ser configuradas quando as regras de branch forem habilitadas. Independentemente disso, os bloqueios do MCP permanecem obrigatórios e não são uma substituição para a revisão humana de release.
