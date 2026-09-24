# Arquitetura e decisões

O `nord-center-infra-agent` é a infraestrutura compartilhada de agentes para os repositórios em `ProjectsNord`.

## Componentes

- `mcp/`: servidor MCP em TypeScript/Node.js, inicialmente local via `stdio`.
- `skills/<projeto>/`: procedimentos especializados isolados por projeto consumidor.
- `steering/<projeto>/`: regras de arquitetura, código e validação selecionadas por projeto.
- `policies/`: limites de permissões e proteção de branches.
- `projects/`: stack, comandos e convenções específicas de cada repositório consumidor.

Agentes devem identificar o repositório alvo e carregar somente o perfil, steering e skills daquele projeto. As policies em `policies/` são globais e continuam válidas para todos.

## Decisões

- **ADR-001 — MCP independente de agentes:** clientes diferentes consomem o mesmo servidor.
- **ADR-002 — TypeScript/Node.js:** linguagem do servidor local inicial.
- **ADR-003 — GitHub como source of truth:** integrações remotas consultam os repositórios GitHub.
- **ADR-004 — Instruções versionadas:** skills, steering, policies e perfis ficam neste repositório.
- **ADR-005 — Segredos fora do Git:** usar ambiente ou secret manager.
- **ADR-006 — Merge automatizado somente para develop:** alterações solicitadas para qualquer projeto consumidor podem ser aplicadas em uma branch de trabalho baseada em `develop`, commitadas e mescladas para `develop` após validações. `main`, `master` e qualquer outro destino são proibidos.
