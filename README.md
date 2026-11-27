# nord-center-infra-agent

Infraestrutura compartilhada para apoiar agentes de desenvolvimento nos projetos Nord, sem acoplamento a um fornecedor ou modelo específico.

## Componentes

- `mcp/`: servidor MCP local `stdio` e remoto Streamable HTTP, além de ferramentas para GitHub, Git e CI.
- `skills/<projeto>/`: procedimentos especializados, separados por repositório consumidor.
- `steering/<projeto>/`: regras de arquitetura, código, segurança e validação próprias de cada projeto.
- `policies/`: limites operacionais e proteções de branches.
- `projects/`: contexto específico de cada repositório consumidor.
- `features/`: registro de cada funcionalidade do NordTool, com a ficha atual e um arquivo por versão ([catálogo](features/README.md)).
- `specs/`: specs do plano de evolução (regras dos agentes, segurança, plataforma), com etapas, responsável e status, para ninguém refazer o que já foi entregue ([todas as specs](specs/todas-as-specs.md)).
- `templates/`: modelos da documentação de feature, de spec e dos workflows de CI.
- `scripts/`: ferramentas de linha de comando ([scripts/README.md](scripts/README.md)): registro de specs, Maven e testes pelo IntelliJ (`java/java-local-run.ps1`) e collections com o Newman (`api/newman-run.ps1`).
- `vigia-issue/`: script local que transforma uma issue do GitHub num chat com a IA (Gemini CLI ou Claude Code, sem API paga); veja [vigia-issue/README.md](vigia-issue/README.md).

## Projetos configurados

- [nord-tool-backend](projects/nord-tool-backend.md)
- [nord-tool-frontend](projects/nord-tool-frontend.md)
- [nord-tool-scripts-sql](projects/nord-tool-scripts-sql.md)
- [lugia-center](projects/lugia-center.md) (fora da allowlist do MCP por enquanto)

## Estado do MCP

A estrutura das ferramentas está definida; as integrações serão implementadas incrementalmente. Solicitações de alteração em qualquer projeto consumidor poderão gerar commit e merge automático exclusivamente para `develop`, após as verificações configuradas passarem. `master` espelha produção e recebe promoção por um fluxo de release separado; `develop` pode continuar como branch padrão. O MCP aplica os bloqueios mesmo quando não há proteção nativa configurada no GitHub. `main`, se existir, e outras branches não são destinos permitidos.

O servidor mantém o transporte local `stdio` e está iniciando o modo remoto Streamable HTTP. O modo remoto usa credenciais de cliente independentes do token GitHub e limita cada credencial aos projetos autorizados. A implantação pública no Railway e a configuração final de HTTPS continuam pendentes. Credenciais devem vir de variáveis de ambiente ou gerenciador de segredos. Consulte [mcp/README.md](mcp/README.md) para configuração e estado de implementação.

## Uso das instruções

Identifique primeiro o repositório alvo. Carregue somente o perfil em `projects/`, as steering em `steering/<projeto>/` e as skills em `skills/<projeto>/` correspondentes a ele. Consulte `policies/` para as regras globais de permissão e branch. Para pedidos de funcionalidade, consulte o [catálogo de features](features/README.md) e siga [policies/features.md](policies/features.md). Para trabalhar numa spec do plano, consulte o painel [todas-as-specs.md](specs/todas-as-specs.md), reserve a etapa e siga [policies/specs.md](policies/specs.md). Essas instruções não substituem revisão de código nem os comandos oficiais de build e teste de cada projeto.
