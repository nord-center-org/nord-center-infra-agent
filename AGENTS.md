# Instruções para agentes

## Contexto

Este repositório, `nord-center-infra-agent`, mantém infraestrutura compartilhada para agentes de desenvolvimento, independente do provedor/modelo. Os consumidores atuais são `nord-tool-backend`, `nord-tool-frontend` e `nord-tool-scripts-sql`, descritos em `projects/`.

## Componentes

- `mcp/`: servidor e ferramentas MCP. O servidor é independente do agente cliente.
- `skills/<projeto>/`: procedimentos especializados, aplicáveis conforme a tarefa e o projeto alvo.
- `steering/<projeto>/`: regras permanentes de arquitetura, código, segurança e validação específicas de cada projeto.
- `policies/`: permissões e proteção de branches.
- `projects/`: contexto específico de cada repositório consumidor.
- `features/`: registro de cada funcionalidade do NordTool, uma pasta por feature com a ficha atual e um arquivo por versão.
- `templates/`: modelos da documentação de feature e dos workflows de CI.

Antes de alterar um consumidor, leia seu perfil em `projects/` e confira o código/configuração atual. Em seguida, carregue somente os arquivos de `skills/<projeto>/` e `steering/<projeto>/` correspondentes ao repositório alvo. Aplique também as policies globais de `policies/`.

Quando usar o MCP, chame `get_project_context` para o projeto alvo antes de qualquer operação de escrita e repasse o `context_token` retornado à ferramenta de escrita. O MCP recusa alterações sem esse token.

## Segurança e Git

- Nunca versionar PATs, API keys, segredos, senhas ou credenciais; use ambiente ou secret manager.
- Em qualquer repositório trabalhado por esta infra, inclusive este repositório quando tiver `develop`, todo trabalho — também planos e documentação — começa em uma branch dedicada criada a partir de `develop`; nunca edite, commite, faça push ou integre alterações diretamente em `develop`.
- Finalize o escopo e as validações na branch de trabalho, publique somente essa branch e abra um Pull Request para `develop`. Quando o PR estiver mergeable e todas as verificações e proteções exigidas passarem, faça squash merge automaticamente pelo fluxo de PR, sem aguardar nova solicitação. Nunca faça merge direto/local em `develop` nem contorne uma revisão exigida.
- `master` espelha produção; promoção para ela ocorre em fluxo de release separado. `develop` pode continuar como branch padrão. O MCP bloqueia operações automáticas em `master` mesmo sem proteção nativa no GitHub. `main`, se existir, também não é destino automático.
- Se `develop` não existir, não puder ser atualizado, houver conflitos ou as validações falharem, pare e informe o motivo; não trabalhe em `develop` nem tente outro destino.
- Não execute comandos arbitrários por meio de ferramentas MCP.

## Registro de features

Todo pedido de funcionalidade, em qualquer repositório consumidor, é registrado como uma feature em `features/<slug>/`, e toda melhoria de uma feature existente é uma nova versão dela (`v2`, `v3`…). Antes de criar a branch, classifique o pedido e escolha o nome conforme `policies/features.md`: `feature-<slug>` ou `feature-<slug>-vN`, com até 50 caracteres e o mesmo nome em todos os repositórios da entrega, inclusive este. A especificação técnica e o porquê de cada decisão ficam no `vN.md` da feature, entregue no mesmo conjunto de PRs.

## Specs do plano

Trabalho de uma spec do plano de evolução (SPEC-01 a SPEC-24) começa pelo painel [todas-as-specs.md](specs/todas-as-specs.md) (🟢 concluída, 🟡 em aberto, 🔴 bloqueada) e pela ficha da spec. Antes de escrever código, rode `node scripts/specs/specs.mjs status SPEC-NN`: uma etapa concluída já está implementada (ou corrigida) e não é refeita; uma etapa em andamento pertence a quem a reservou. Reserve a etapa livre com `node scripts/specs/specs.mjs pegar` e integre a reserva antes do código. 

**Quando alguém escolhe uma spec** ("quero pegar a SPEC-03", "vou fazer a spec 12"), siga este fluxo automaticamente, sem esperar instrução a mais; no Claude Code, ele é a skill `planejar-spec` (`/planejar-spec 03`):

1. Rode `node scripts/specs/specs.mjs status SPEC-NN` e diga a situação do painel. Se estiver 🟢 concluída ou ⚪ incorporada, pare: não refaça.
2. Se a spec não tem plano, rode `node scripts/specs/specs.mjs planejar SPEC-NN` e siga o roteiro que ele imprime. Confira a situação atual no código, escreva o plano com as etapas (cada uma com a `**Execução:**` em ordem, 🤖 para a IA e 👤 para ação humana, como token, variável, acesso e configuração do GitHub) e levante as perguntas ao responsável em `decisoes.md` sobre toda decisão e dúvida, cada uma com recomendação e prazo. Abra o PR do plano e pare, sem escrever código.
3. Se o plano espera aprovação, diga isso e pare. Se está aprovado, reserve uma etapa livre com `pegar` e integre a reserva antes do código.
4. Na implementação, siga a `Execução` da etapa em ordem com `node scripts/specs/specs.mjs proximo SPEC-NN ENN` e **pare no primeiro passo 👤 sem confirmação**: diga à pessoa o que fazer e só continue depois que ela confirmar (`confirmar`).

Regras em `policies/specs.md`; o workflow `Specs` recusa reservas duplicadas e mudanças em etapas concluídas.

## Novidades

Toda entrega visível para quem usa o NordTool atualiza as novidades da tela inicial (contadas pelo avatar do dono; sem ele, pelo mascote Lugia Nexus); veja `policies/novidades.md`.

## App Android

Quem baixa o app Android tem que receber sempre todas as funções atuais. Toda mudança no próprio app gera um APK novo no mesmo PR; veja `policies/app-android.md`.

## Objetivo

Começar com um MCP local TypeScript/Node.js via `stdio`; avaliar hospedagem e transporte remoto em fase posterior. Consulte `mcp/README.md` e `roadmap.md` para estado e próximos passos.
