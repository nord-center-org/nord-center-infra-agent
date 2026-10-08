# Fluxo Git global

Esta policy vale para todos os repositórios trabalhados pelos agentes através desta infra, independentemente de stack, inclusive `nord-center-infra-agent` quando houver `develop`.

1. Confirme o repositório e leia seu perfil, steering e skills específicas antes de editar.
2. Atualize a referência `develop` a partir do remoto canônico e crie uma branch dedicada de trabalho baseada nela antes de escrever qualquer código, plano, documentação ou configuração. Nomeie a branch pelo tipo e objetivo, por exemplo `feature/...`, `fix/...` ou `docs/...`.
3. Nunca use `develop` como branch de trabalho. Não edite arquivos, crie commits, faça push nem execute merge local diretamente em `develop`.
4. Inspecione o estado da branch de trabalho e preserve alterações existentes que não pertençam à solicitação. Mantenha nela o plano, toda a implementação, documentação, revisões e validações até concluir o escopo solicitado.
5. Revise o diff e execute todas as verificações indicadas pelo steering do projeto. Não publique nem solicite integração enquanto houver itens do plano pendentes ou validações falhas.
6. Crie commits somente na branch de trabalho e publique somente essa branch. Depois de concluir o plano e passar todas as verificações, abra um Pull Request com base exclusivamente em `develop`.
7. Quando o PR estiver mergeable e todas as execuções obrigatórias de CI, revisões e proteções de branch estiverem satisfeitas, faça squash merge automaticamente pelo PR; não aguarde uma nova solicitação do usuário. Não substitua o PR por `git merge` local, push direto ou cherry-pick para `develop` e nunca contorne revisão ou proteção exigida.
8. Se não for possível abrir o PR, sincronizar `develop`, resolver conflitos ou passar as validações, mantenha o trabalho na branch e reporte sem integrar. Se uma aprovação humana for exigida pela proteção do repositório, deixe o PR aberto aguardando essa aprovação.
9. Nunca integre automaticamente em `master`, `main` se existir, ou outra branch. `develop` é o único destino de PRs de trabalho; promoção para produção segue o fluxo de release.

`master` é a branch que espelha o código promovido para produção; `develop` pode continuar como branch padrão do GitHub, mas deve permanecer protegida contra escrita direta. Todo plano e alteração fica primeiro em branch de trabalho; o PR é o único caminho de integração em `develop` e deve ser mesclado automaticamente assim que o plano, CI e proteções estiverem completos. A promoção de `develop` para `master` pertence a um fluxo de release separado, fora das ferramentas automáticas do MCP. O MCP aplica os bloqueios de branch independentemente de regras nativas do GitHub.

O procedimento humano para essa promoção está em [release.md](release.md). O smoke de segurança também confirma que operações diretas rejeitam `develop`, `master` e `main` como branches de trabalho.
