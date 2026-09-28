# Permissões de ferramentas

O fluxo global de branches e integração está definido em `git-workflow.md`.

- Leitura local/remota: permitida dentro do repositório e escopo solicitados.
- A solicitação do usuário pelo frontend autoriza a alteração delimitada descrita nela.
- Para qualquer projeto consumidor, o agente pode editar em branch de trabalho baseada em `develop`, criar commit e abrir/mesclar PR somente para `develop` após as verificações configuradas passarem.
- O fluxo automático pode mesclar somente para `develop`; `master` é a branch protegida que espelha produção e nunca recebe escrita, commit ou merge automático. `main`, se existir, também fica fora desse fluxo.
- Em caso de conflito, falha de validação ou ausência de `develop`, pare e reporte o bloqueio; nunca contorne as proteções.
- A regra vale para backend, frontend, scripts SQL e demais projetos adicionados a `projects/`.
- Deploy e publicação não fazem parte dessa autorização.
- O MCP não deve aceitar comandos shell arbitrários como ferramenta genérica.
- Tokens devem ter menor privilégio e vir do ambiente ou de secret manager.
