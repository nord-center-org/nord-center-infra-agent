# Arquitetura e decisões

O `nord-center-infra-agent` é a infraestrutura compartilhada de agentes para os repositórios em `ProjectsNord`.

## Componentes

- `mcp/`: servidor MCP em TypeScript/Node.js com transporte local `stdio` e modo remoto Streamable HTTP em implementação.
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
- **ADR-006 — Integração e produção separadas:** alterações de agentes partem de `develop`, são validadas por PR e podem ser mescladas automaticamente somente para `develop`. `master` espelha produção; promovê-la é um fluxo de release separado. `develop` pode continuar como branch padrão. As regras nativas de proteção do GitHub são opcionais; o MCP sempre aplica seus próprios bloqueios. `main`, se existir, não é branch canônica de produção.
- **ADR-010 — HTTP remoto com escopo por cliente:** O transporte Streamable HTTP cria uma sessão por cliente autenticado. Credenciais remotas são distintas de `GITHUB_TOKEN` e cada uma recebe uma allowlist explícita de projetos. O serviço valida Host/Origin, impõe HTTPS quando implantado publicamente, limita chamadas e não registra tokens nem corpos MCP. Sessões são mantidas em memória; a primeira implantação Railway deve usar uma instância até existir armazenamento compartilhado de sessão.
- **ADR-011 — Release de produção manual:** A promoção de `develop` para `master` exige PR e aprovação humana conforme `policies/release.md`; nenhuma operação MCP pode realizá-la.
