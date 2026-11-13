# Projeto: lugia-center

- Repositório irmão: `../lugia-center`.
- Repositório canônico: `nord-center-org/lugia-center`.
- Propósito: Lugia, o provedor multi-IA do NordTool (chat com Claude, ChatGPT e Gemini, com histórico e anexos).
- Stack observada: Node.js 22.18+ executando TypeScript direto (sem build), Hono, `pg`, Zod e os SDKs oficiais `@anthropic-ai/sdk`, `openai` e `@google/genai`.
- Comandos observados no `package.json`: `npm run dev`, `npm start`, `npm run typecheck`, `npm test`.

## Situação

- O app usa a Lugia que fica no `nord-tool-backend` (`service/lugia/`, `/lugia` no backend). O `lugia-center` não está ligado ao frontend (`VITE_LUGIA_BASE_URL` vazia aponta para o backend). Novos provedores e mudanças da Lugia vão no backend; ver `features/lugia/`.

## Orientações

- Leia `AGENTS.md` e `README.md` do próprio repositório antes de alterar.
- Login e permissões são do `nord-tool-backend` (`GET /auth/me`, módulo `LUGIA`); a Lugia não emite nem valida JWT.
- O schema (`lugia_conversa`, `lugia_mensagem`) é mantido no `nord-tool-scripts-sql`; a tela fica no `nord-tool-frontend` (`/lugia`).
- Chaves de API (Anthropic, OpenAI, Google) e a conexão do banco vêm só do ambiente.
- Execute `npm run typecheck` e `npm test` antes de publicar.
- Ainda não está na allowlist do MCP nem tem `steering/` e `skills/` próprios; inclua quando a Lugia passar a operar os repositórios (fase 3).
