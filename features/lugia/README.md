# Lugia

| | |
|---|---|
| Slug | `lugia` |
| Status | ativa |
| Versão atual | [v2](v2.md) |
| Repositórios | nord-tool-backend, nord-tool-frontend |
| Onde no app | Lugia (`/lugia`); chat dos cadernos no bloco de notas |

## O que faz

Chat com várias IAs no mesmo lugar, com histórico, anexos (imagens e PDF) e resposta em tempo real:
- Claude, ChatGPT e Gemini;
- os gratuitos Groq, OpenRouter, Mistral e NVIDIA;
- a **secretária local**: um modelo rodando no PC do dono do NordTool pelo Ollama, alcançado por um túnel seguro.

O modo Automático troca sozinho entre os gratuitos, começando pela secretária local. O modo agente (ADMIN) trabalha
nos repositórios.

## Regras de negócio vigentes

- **RN-01** Conversas são da pessoa logada; precisa do módulo `LUGIA` (LEITURA para o chat, ADMIN para o agente). _(v1)_
- **RN-02** Chaves dos provedores e tokens só no ambiente do servidor; o navegador nunca os vê. _(v1)_
- **RN-03** A secretária local só liga com URL e modelo; fora de localhost, exige HTTPS e proteção (service token do Cloudflare Access ou Bearer). O Ollama escuta só em 127.0.0.1, sem porta aberta no roteador. _(v2)_
- **RN-04** A máquina local recebe no máximo os pedidos simultâneos configurados (padrão 1). Os demais esperam numa fila de até 4 por até 60 s; acima disso, "ocupada". Os limites são até 90 s pela primeira palavra e até 300 s no total. Contexto e resposta são limitados (8192 e 1024 tokens). _(v2)_
- **RN-05** Depois de 3 falhas seguidas (PC desligado, túnel parado), a secretária local responde "fora do ar" na hora por 60 s e então deixa um pedido de teste passar. No Automático, ela vem primeiro e é pulada enquanto estiver fora ou ocupada. _(v2)_

## Onde está no código

- **Backend:**
  - `service/impl/LugiaServiceImpl` e `service/lugia/`, com os provedores, `LugiaSseHttp` e, na v2, `LugiaOllamaProvider`, `LugiaOllamaProperties` e `LugiaProtetor`;
  - configuração em `application.yaml` (`nord-tool.lugia.*`);
  - guia da secretária local: `docs/lugia-secretaria-local.md`.
- **Frontend:** `pages/Lugia.tsx`, `services/LugiaService.ts`, `utils/lugia.ts` e o chat dos cadernos (`components/bloco/assistente/ChatCadernos.tsx`).
- **SQL:** `lugia_conversa` e `lugia_mensagem`.

## Versões

| Versão | Data | Resumo | Branch | PRs |
|---|---|---|---|---|
| [v1](v1.md) | 2026-11-13 | Registro retroativo: chat multi-IA, Automático, agente | — | — |
| [v2](v2.md) | 2026-11-13 | Secretária local: Ollama na máquina do dono, via Cloudflare Tunnel + Access, com protetor do hardware | `feature-lugia-v2` | [backend#125](https://github.com/nord-center-org/nord-tool-backend/pull/125), [frontend#181](https://github.com/nord-center-org/nord-tool-frontend/pull/181), [infra#52](https://github.com/nord-center-org/nord-center-infra-agent/pull/52) |

## Correções

| Data | Branch | O que foi corrigido | PRs |
|---|---|---|---|

## Dependências e impactos

- A secretária local depende do PC do dono ligado, com o Ollama e o `cloudflared` rodando. Fora disso, o Automático usa a nuvem.
- Nenhuma dependência nova no código.
- O chat dos cadernos e o chat do cronograma usam (ou poderão usar) a mesma Lugia.
