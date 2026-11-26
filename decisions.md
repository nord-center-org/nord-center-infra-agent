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

Qualquer projeto consumidor (backend, frontend, scripts SQL ou outro perfil adicionado futuramente) poderá receber uma solicitação de alteração por um agente. O agente aplica a mudança em uma branch de trabalho criada a partir de `develop`, cria o commit e pode mesclar automaticamente somente para `develop`, após as validações configuradas. `master` espelha produção; sua promoção segue um fluxo de release separado. `develop` pode continuar como branch padrão do GitHub. As proteções de branch nativas são opcionais, pois os bloqueios também são aplicados pelo MCP. `main`, se existir, fica fora do fluxo automático. Se `develop` não existir, houver conflito ou as validações falharem, o processo deve parar sem escolher outro destino.

## ADR-007: Perfis por repositório

Cada consumidor possui um arquivo em `projects/` com stack e convenções verificadas nos arquivos disponíveis, revisável conforme os repositórios evoluem.

## ADR-008: Alterações de interface iniciadas pelo frontend

O frontend é a interface para solicitar alterações em qualquer repositório configurado. A solicitação deve identificar o projeto, a alteração desejada e o escopo; o agente prepara a mudança e só integra automaticamente em `develop` quando as verificações forem aprovadas.

## ADR-009: Skills e steering isoladas por projeto

Skills e steering ficam em diretórios nomeados pelo repositório consumidor (`skills/<projeto>/` e `steering/<projeto>/`). O agente seleciona o conjunto pelo projeto alvo e não mistura instruções específicas entre projetos. Policies de segurança e branch permanecem globais.

## ADR-010: Transporte HTTP remoto isolado por cliente

O MCP mantém o transporte `stdio` para clientes locais e adiciona Streamable HTTP para clientes remotos. Cada sessão pertence à credencial autenticada e só publica ferramentas e recursos dos projetos autorizados para ela. O token de cliente é separado de `GITHUB_TOKEN`. O servidor valida Host e Origin, pode exigir HTTPS atrás de proxy confiável, limita chamadas e não grava tokens ou corpos em log. As sessões ficam em memória nesta primeira versão.

## ADR-011: Promoção para master com aprovação humana

`master` representa produção e fica fora das ferramentas de escrita e merge automático. A promoção exige um PR de release revisto e integrado manualmente por um owner da organização, conforme `policies/release.md`.

## ADR-012: Registro de funcionalidades por feature e versão

Cada funcionalidade do NordTool tem um slug fixo e uma pasta em `features/<slug>/`, com a ficha do estado atual (`README.md`) e um arquivo por versão (`v1.md`, `v2.md`…) contendo a especificação técnica e o porquê de cada decisão, principalmente das tomadas por agentes. Uma melhoria de uma feature existente é uma nova versão, não uma feature nova. O slug aparece no nome da branch (`feature-<slug>` ou `feature-<slug>-vN`, com até 50 caracteres e o mesmo em todos os repositórios da entrega) e no título do squash commit (`feat(<slug>-vN): …`), o que liga código, PRs e documentação. A documentação fica centralizada nesta infra porque uma feature costuma atravessar SQL, backend e frontend. O MCP só cria branches nesse padrão. As regras estão em `policies/features.md`.

## ADR-013: Registro de specs com reserva de etapas

As specs do plano de evolução do NordTool (SPEC-01 a SPEC-24) ficam em `specs/`, com um catálogo de todas as specs e, para cada spec em execução, uma pasta com ficha, spec, plano, decisões e contexto por repositório. Cada spec é dividida em etapas, e cada etapa tem responsável, branch e status. O status em `develop` é a fonte da verdade: a reserva de uma etapa entra por PR antes do código, e uma etapa concluída aparece como implementada ou corrigida para quem chegar depois. O script `scripts/specs/specs.mjs` consulta, reserva e conclui etapas, e o workflow `Specs` recusa em todo PR formato inválido, status do catálogo divergente das etapas, mudança em etapa concluída, troca de dono de etapa em andamento e reserva da mesma etapa em outro PR aberto. As regras estão em `policies/specs.md`.
