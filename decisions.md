# Registro de decisões

## ADR-001: MCP independente de agentes

O servidor expõe ferramentas pelo protocolo MCP sem dependência de Codex, Claude Code, Cursor, Gemini ou outro cliente.

## ADR-002: TypeScript/Node.js

O primeiro servidor será local e implementado em TypeScript/Node.js.

## ADR-003: GitHub como fonte remota de verdade

Operações GitHub consultam os repositórios remotos; alterações locais permanecem no workspace do projeto consumidor.

## ADR-004: Instruções versionadas

Skills, steering, policies e perfis de projeto são mantidos neste repositório compartilhado.

## ADR-005: Segredos fora do Git

Credenciais vêm de variáveis de ambiente ou secret managers e nunca são versionadas.

## ADR-006: Automação de alterações somente para develop

Qualquer projeto consumidor (backend, frontend, scripts SQL ou outro perfil adicionado futuramente) poderá receber uma solicitação de alteração pelo frontend. O agente aplica a mudança em uma branch de trabalho criada a partir de `develop`, cria o commit e pode mesclar automaticamente somente para `develop`, após as validações configuradas. `main`, `master` e qualquer outra branch ficam fora do fluxo automático. Se `develop` não existir, houver conflito ou as validações falharem, o processo deve parar sem escolher outro destino.

## ADR-007: Perfis por repositório

Cada consumidor possui um arquivo em `projects/` com stack e convenções verificadas nos arquivos disponíveis, revisável conforme os repositórios evoluem.

## ADR-008: Alterações de interface iniciadas pelo frontend

O frontend é a interface para solicitar alterações em qualquer repositório configurado. A solicitação deve identificar o projeto, a alteração desejada e o escopo; o agente prepara a mudança e só integra automaticamente em `develop` quando as verificações forem aprovadas.

## ADR-009: Skills e steering isoladas por projeto

Skills e steering ficam em diretórios nomeados pelo repositório consumidor (`skills/<projeto>/` e `steering/<projeto>/`). O agente seleciona o conjunto pelo projeto alvo e não mistura instruções específicas entre projetos. Policies de segurança e branch permanecem globais.
