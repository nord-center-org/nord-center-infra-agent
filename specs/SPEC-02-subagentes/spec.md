# SPEC-02 — Spec

**Origem:** I (título "Criação de subagentes"); R (typesafe output com grau de certeza, agente que analisa proxy, logs e observabilidade, repositório de padrões via MCP); L-5, L-6, L-30 e L-31 do plano de 26/11/2026.

## O que é

Hoje um único agente generalista faz tudo. A proposta é um **orquestrador** que divide o pedido e delega a **subagentes** com papel, contexto e ferramentas restritos. Cada subagente devolve uma resposta estruturada, validada por schema ("typesafe output"), com o grau de confiança e as evidências.

## Situação atual (conferida no código em 2026-11-26)

| Ponto do plano | Conferido | Observação |
|---|---|---|
| Modo agente da Lugia, generalista | confirmado | `LugiaAgenteClaudeClient` (backend) cria agente, ambiente e vault no Claude Managed Agents, monta os repositórios e conecta o MCP do GitHub (`api.githubcopilot.com/mcp`), não o MCP da infra; política "sempre permitir"; o prompt manda mesclar com CI verde |
| Repositório de padrões via MCP | confirmado | `get_project_context` devolve policies, catálogo de features, perfil, steering e skills, e emite o `context_token` exigido nas escritas |
| MCP remoto implementado, não publicado | confirmado | Streamable HTTP com bearer por cliente, allowlist de **projetos** por credencial, validação de host e origin, rate limit e `/healthz` já existem; faltam HTTPS, segredos e domínio no Railway e os testes de ponta a ponta (fases 8 e 9 do `roadmap.md`) |
| Allowlist por credencial | parcial | limita projetos, **não ferramentas**: todo cliente recebe todas as ferramentas, inclusive as de escrita |
| Definição de subagentes e schema de saída | não existem | não há `agents/` nem schema |
| Outro caminho de agente | **novo** | `vigia-issue/` entrega pedidos de uma issue ao Gemini CLI ou ao Claude Code local, também generalista |

## O que fazer

1. **Definir os subagentes** em `agents/<nome>.md`, em formato neutro (ADR-001), convertível para Claude Code (`.claude/agents`), OpenCode e Managed Agents. Conjunto inicial:

   | Subagente | Papel | Escreve? |
   |---|---|---|
   | Orquestrador | classifica o pedido (feature, versão, correção ou etapa de spec), escolhe o slug, distribui e consolida o `vN.md` | só a doc |
   | Planejador | plano no `vN.md`: escopo, arquivos, riscos e partes de 500 linhas; para e espera aprovação | só o plano |
   | Executor (backend, frontend, SQL) | implementa cada parte seguindo as steerings por tipo de classe | sim |
   | Testador | `*ServiceImplTest` e testes do front; roda os gates localmente | só testes |
   | Revisor | revisa o diff contra steering, policies e checklist de código de IA, sem ter escrito o código | não |
   | Segurança | dependências, segredos, rotas públicas, OWASP | não |
   | Consertador | corrige o que foi apontado, só dentro do apontamento | sim |
   | Diagnóstico | lê logs, traces, métricas, HAR ou sessão de proxy e devolve hipótese com evidência | não |

2. **Typesafe output:** JSON validado por schema (zod no MCP) com `resultado`, `arquivos`, `decisoes[]` (com o porquê), `confianca` (`baixa`, `media`, `alta`), `evidencias[]` e `pendencias[]`. Fora do schema: o orquestrador rejeita e pede de novo até duas vezes. Confiança baixa ou evidência vazia: para e pergunta a uma pessoa. A confiança é declarada pelo modelo e não é calibrada; serve para triagem.
3. **Agente de diagnóstico:** ferramentas MCP só de leitura para logs, métricas e traces da stack da SPEC-06, e para receber HAR ou dump de log. Nunca executa comando nem escreve.
4. **Fluxo:** Orquestrador → Planejador → aprovação humana → Executor → Testador → Revisor e Segurança → Consertador (até 3 voltas antes de chamar uma pessoa) → PR → merge pelo nível de autonomia da SPEC-01. O resultado de cada um entra em "Decisões".
5. **MCP remoto publicado** (fases 8 e 9) e **Lugia pelo MCP**, com credencial própria e allowlist, mantendo a autonomia (branch, PR, `get_workflow`, `get_logs`, correção do CI, merge pelo nível). Depois, a credencial antiga do GitHub da Lugia é revogada.
6. **Review de PR com Claude Code Action (L-31)** nos 4 repositórios: comentários por eixo (corretude, segurança, testes, steerings, desempenho, legibilidade), chave em secret com permissão de ler código e comentar; começa como aviso e vira check obrigatório depois da calibragem.
7. **Context engineering em grafos (L-30):** grafo do código gerado no CI (classes, métodos, endpoints, queries `.properties`, tabelas do DDL e telas do front, com as arestas de uso) em SQLite, consultado por ferramentas MCP; piloto medindo tokens e acerto antes e depois.
8. **Estudo de neural memory (L-6):** documento curto comparando a memória explícita atual, busca vetorial e abordagens de memória neural, com recomendação.

## Critérios de aceite

- [ ] Um pedido de exemplo que atravessa SQL, backend e front gera três PRs com o mesmo nome de branch e um `vN.md` preenchido pelo orquestrador.
- [ ] O Revisor e o de Segurança não conseguem escrever: a ferramenta é recusada pelo MCP.
- [ ] Saída inválida contra o schema é rejeitada e repetida; confiança baixa interrompe com pergunta.
- [ ] O MCP responde em HTTPS no Railway com `/healthz` e allowlist por cliente. O modo agente da Lugia opera só pelo MCP, e o token antigo foi revogado.

## Depende de

SPEC-01 (regras, níveis de autonomia, partes e steerings). O agente de diagnóstico depende da SPEC-06. O contexto por funcionalidade (`get_feature_context`) vem da SPEC-24.

## A confirmar

- Se "neural memory" se refere a uma ferramenta específica.
- Se "JEV typesafe ai model vs LEYA" é uma ferramenta ou biblioteca; se for, entra no item 2.

## Prazo estimado

25 a 30 dias úteis (200 a 240 horas), incluindo a migração da Lugia para o MCP.
