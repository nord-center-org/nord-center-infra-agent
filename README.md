# nord-center-infra-agent

Infraestrutura compartilhada para apoiar agentes de desenvolvimento nos projetos Nord, sem acoplamento a um fornecedor ou modelo específico.

## Componentes

- `mcp/`: servidor MCP local e ferramentas para GitHub, Git e CI.
- `skills/<projeto>/`: procedimentos especializados, separados por repositório consumidor.
- `steering/<projeto>/`: regras de arquitetura, código, segurança e validação próprias de cada projeto.
- `policies/`: limites operacionais e proteções de branches.
- `projects/`: contexto específico de cada repositório consumidor.

## Projetos configurados

- [nord-tool-backend](projects/nord-tool-backend.md)
- [nord-tool-frontend](projects/nord-tool-frontend.md)
- [nord-tool-scripts-sql](projects/nord-tool-scripts-sql.md)

## Estado do MCP

A estrutura das ferramentas está definida; as integrações serão implementadas incrementalmente. Solicitações de alteração em qualquer projeto consumidor poderão gerar commit e merge automático exclusivamente para `develop`, após as verificações configuradas passarem. `main`, `master` e outras branches não são destinos permitidos.

O servidor usa transporte local `stdio` para permitir conexão por diferentes clientes MCP. Credenciais devem ser fornecidas por variáveis de ambiente ou gerenciador de segredos. Consulte [mcp/README.md](mcp/README.md) para configuração e estado de implementação.

## Uso das instruções

Identifique primeiro o repositório alvo. Carregue somente o perfil em `projects/`, as steering em `steering/<projeto>/` e as skills em `skills/<projeto>/` correspondentes a ele. Consulte `policies/` para as regras globais de permissão e branch. Essas instruções não substituem revisão de código nem os comandos oficiais de build e teste de cada projeto.
