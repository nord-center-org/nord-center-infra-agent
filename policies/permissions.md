# Permissões de ferramentas

O fluxo global de branches e integração está definido em `git-workflow.md`.

- Leitura local/remota: permitida dentro do repositório e escopo solicitados.
- A solicitação do usuário pelo frontend autoriza a alteração delimitada descrita nela.
- Para qualquer repositório trabalhado por esta infra, antes de editar qualquer arquivo, inclusive plano ou documentação, o agente deve criar uma branch de trabalho a partir da referência atualizada de `develop`. Todo o trabalho e commits permanecem nessa branch até a conclusão do plano e das verificações.
- É proibido editar, commitar, fazer push, cherry-pick ou executar merge local diretamente em `develop`. O único caminho de integração é Pull Request para `develop`.
- Depois que o plano estiver completo e CI, revisões e proteções exigidas estiverem satisfeitas, o agente está autorizado a squash-mergear automaticamente o PR para `develop`, sem pedir autorização adicional. Nunca ignore uma aprovação humana exigida pela configuração do repositório.
- O fluxo automático pode integrar somente por PR para `develop`; `master` é a branch que espelha produção e nunca recebe escrita, commit ou merge automático. `main`, se existir, também fica fora desse fluxo.
- O MCP deve aplicar esses limites mesmo quando o repositório não tiver regras nativas de proteção de branch. A ausência dessas regras não bloqueia o fluxo automatizado.
- Em caso de conflito, falha de validação, PR indisponível ou ausência/impossibilidade de atualizar `develop`, pare e reporte o bloqueio; nunca contorne as proteções com merge local ou push direto.
- A regra vale para backend, frontend, scripts SQL e demais projetos adicionados a `projects/`.
- Deploy e publicação não fazem parte dessa autorização.
- O MCP não deve aceitar comandos shell arbitrários como ferramenta genérica.
- Tokens devem ter menor privilégio e vir do ambiente ou de secret manager.
- No transporte remoto, cada credencial bearer do cliente deve autorizar somente os projetos necessários; ela nunca substitui nem recebe o `GITHUB_TOKEN` do serviço.
