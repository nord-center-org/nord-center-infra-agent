# Roadmap

## Fase 1 — Base compartilhada

- [x] Definir arquitetura do repositório
- [x] Criar perfis para os projetos Nord existentes
- [x] Criar skills e steering iniciais
- [x] Separar skills e steering por projeto consumidor
- [x] Definir policies de permissões e branches
- [x] Criar esqueleto de servidor MCP TypeScript
- [x] Instalar dependências e validar build local
- [x] Implementar ferramentas GitHub de leitura

## Fase 2 — MCP local

- [x] Implementar servidor TypeScript local via `stdio`
- [x] Implementar ferramentas Git locais com escopo limitado aos projetos allowlistados
- [x] Preparar execução do MCP como subprocesso de cliente MCP

## Fase 3 — GitHub como fonte operacional

- [x] Implementar `get_file`, `search_code`, `create_branch`, `update_file`, `create_pr` e `get_pull_request`
- [x] Implementar `get_workflow` e `get_logs`
- [x] Validar integração MCP/GitHub com `npm run smoke:github`
- [x] Implementar merge automático condicionado a verificações aprovadas, sempre exclusivamente para `develop`

## Fase 4 — Múltiplos projetos

- [x] Selecionar projeto por argumento `project`
- [x] Configurar backend, frontend e scripts SQL numa allowlist comum
- [x] Resolver diretórios locais e repositórios GitHub pelo projeto selecionado
- [x] Apontar backend, frontend e scripts SQL para os repositórios canônicos da organização `nord-center-org`
- [x] Validar leitura de repositórios e workflows com token Fine-grained

## Fase 5 — Contexto por projeto

- [ ] Expor perfil, steering e skills do projeto selecionado por recursos/prompts MCP
- [ ] Garantir que o cliente carregue somente instruções do projeto escolhido
- [ ] Validar o contexto com tarefas representativas de backend, frontend e SQL

## Fase 6 — CI por projeto

- [ ] Executar MCP CI em pushes e PRs para `develop` e `master`
- [x] Manter o backend com build/test em PR para `develop` e `master`
- [ ] Criar CI de PR para frontend (lint, build e testes)
- [ ] Criar validação segura de PR para SQL sem executar migrações no banco compartilhado
- [ ] Exigir PR e checks aprovados em `develop`; manter `master` protegido como espelho de produção

## Fase 7 — Fluxo automatizado de ponta a ponta

- [ ] Implementar operação para aplicar alterações multi-arquivo em uma única branch de trabalho/commit
- [ ] Orquestrar PR para `develop`, aguardar Actions do SHA atual e mesclar somente após sucesso
- [ ] Tratar timeout, conflito, falha, repetição idempotente e ausência de workflow
- [ ] Manter promoção de `develop` para `master` fora do fluxo automático do agente

## Fase 8 — Serviço remoto no Railway

- [ ] Implementar transporte MCP remoto Streamable HTTP
- [ ] Publicar endpoint somente por HTTPS no Railway
- [ ] Separar autenticação do cliente MCP da credencial GitHub mantida pelo serviço
- [ ] Configurar secrets, autorização por projeto, logs sem segredos e limites de chamadas
- [ ] Configurar deploy e health checks

## Fase 9 — Integração e testes end-to-end

- [ ] Integrar clientes remotos (ChatGPT/API, Codex, Claude, Cursor), conforme suporte de cada um
- [ ] Testar autenticação, escopo de projetos e negação de operações não permitidas
- [ ] Testar cenário completo em sandbox: solicitação → branch → edição → PR → CI → merge em `develop`
- [ ] Confirmar que nenhuma operação automática altera `master`
- [ ] Executar validação SQL em banco descartável e confirmar migração em `develop` somente após merge
- [ ] Monitorar falhas e definir procedimento de pausa/rollback antes de ampliar o uso
