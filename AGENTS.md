# Instruções para agentes

## Contexto

Este repositório, `nord-center-infra-agent`, mantém infraestrutura compartilhada para agentes de desenvolvimento, independente do provedor/modelo. Os consumidores atuais são `nord-tool-backend`, `nord-tool-frontend` e `nord-tool-scripts-sql`, descritos em `projects/`.

## Componentes

- `mcp/`: servidor e ferramentas MCP. O servidor é independente do agente cliente.
- `skills/<projeto>/`: procedimentos especializados, aplicáveis conforme a tarefa e o projeto alvo.
- `steering/<projeto>/`: regras permanentes de arquitetura, código, segurança e validação específicas de cada projeto.
- `policies/`: permissões e proteção de branches.
- `projects/`: contexto específico de cada repositório consumidor.

Antes de alterar um consumidor, leia seu perfil em `projects/` e confira o código/configuração atual. Em seguida, carregue somente os arquivos de `skills/<projeto>/` e `steering/<projeto>/` correspondentes ao repositório alvo. Aplique também as policies globais de `policies/`.

Quando usar o MCP, chame `get_project_context` para o projeto alvo antes de qualquer operação de escrita e repasse o `context_token` retornado à ferramenta de escrita. O MCP recusa alterações sem esse token.

## Segurança e Git

- Nunca versionar PATs, API keys, segredos, senhas ou credenciais; use ambiente ou secret manager.
- Em qualquer repositório trabalhado por esta infra, inclusive este repositório quando tiver `develop`, todo trabalho — também planos e documentação — começa em uma branch dedicada criada a partir de `develop`; nunca edite, commite, faça push ou integre alterações diretamente em `develop`.
- Finalize o escopo e as validações na branch de trabalho, publique somente essa branch e abra um Pull Request para `develop`. Quando o PR estiver mergeable e todas as verificações e proteções exigidas passarem, faça squash merge automaticamente pelo fluxo de PR, sem aguardar nova solicitação. Nunca faça merge direto/local em `develop` nem contorne uma revisão exigida.
- `master` espelha produção; promoção para ela ocorre em fluxo de release separado. `develop` pode continuar como branch padrão. O MCP bloqueia operações automáticas em `master` mesmo sem proteção nativa no GitHub. `main`, se existir, também não é destino automático.
- Se `develop` não existir, não puder ser atualizado, houver conflitos ou as validações falharem, pare e informe o motivo; não trabalhe em `develop` nem tente outro destino.
- Não execute comandos arbitrários por meio de ferramentas MCP.

## Objetivo

Começar com um MCP local TypeScript/Node.js via `stdio`; avaliar hospedagem e transporte remoto em fase posterior. Consulte `mcp/README.md` e `roadmap.md` para estado e próximos passos.
