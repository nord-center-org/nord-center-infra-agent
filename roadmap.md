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
- [ ] Validar acesso a recursos privados com token Fine-grained, se necessário

## Fase 5 — Adoção

- [ ] Documentar conexão de clientes (Codex, Claude, Cursor e outros)
- [ ] Validar instruções nos três projetos consumidores
- [ ] Ajustar skills e perfis a partir do uso real

## Fase 6 — Serviço remoto

- [ ] Definir autenticação, autorização e hospedagem
- [ ] Implementar transporte remoto
- [ ] Configurar CI/CD e observabilidade
- [ ] Avaliar Railway ou plataforma equivalente
