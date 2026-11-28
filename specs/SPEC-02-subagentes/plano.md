# SPEC-02 — Plano de implementação

**Situação do plano:** proposta, aguardando aprovação (campo `Plano` da [ficha](README.md)).

## Visão geral

| Etapa | Itens da spec | Repositórios | Estimativa | Depende de | Pode começar já? |
|---|---|---|---|---|---|
| E01 Formato neutro e subagentes | 1 | infra | 20–24 h | — | sim |
| E02 Saída tipada | 2 | infra | 14–18 h | E01 (papéis) | sim, junto com a E01 |
| E03 Ferramentas por papel | critério "Revisor não escreve" | infra | 14–18 h | E01 | sim |
| E04 MCP remoto publicado | 5 (fases 8 e 9) | infra | 24–28 h | — | sim |
| E05 Lugia pelo MCP | 5 | backend, infra | 16–20 h | E03, E04 e SPEC-01 E01 | não (bloqueada) |
| E06 Fluxo orquestrado | 4 | infra, sql, backend, frontend | 36–40 h | E01–E03 e SPEC-01 E01–E03 | não (bloqueada) |
| E07 Review com Claude Code Action | 6 (L-31) | infra, sql, backend, frontend | 10–12 h | — (check obrigatório depois da SPEC-01 E02) | sim, como aviso |
| E08 Agente de diagnóstico | 3 | infra | 18–22 h | SPEC-06 | não (bloqueada) |
| E09 Grafo de código | 7 (L-30) | infra, sql, backend, frontend | 40–48 h | — | sim; melhor depois dos primeiros módulos da SPEC-09 |
| E10 Estudo de memória | 8 (L-6) | infra | 8–10 h | confirmar o termo | sim |

**Total:** 200 a 240 horas (25 a 30 dias úteis).

**Ordem.**

```text
E01 ──► E02 ──┐
  └───► E03 ──┼──► E06 ◄── SPEC-01 E01–E03
E04 ──────────┴──► E05 ◄── SPEC-01 E01
E07 (aviso já; obrigatório depois da SPEC-01 E02)
E08 ◄── SPEC-06
E09 e E10: independentes
```

**Prioridade no plano geral:** a SPEC-02 é P2 (onda C). As etapas que podem começar já não disputam arquivos com a SPEC-01, com duas exceções a combinar:

- E03 mexe em `mcp/server/factory.ts`, `config.ts` e `http.ts`, e a SPEC-01 E01, E03 e E06 mexem em `mcp/tools/github/*`. Não editar os mesmos arquivos em paralelo.
- E07 cria workflows. Depois da SPEC-01 E07, o token do agente não altera workflows, e o PR fica com uma pessoa.

## E01 — Formato neutro e definição dos subagentes

1. **`agents/README.md`:** o formato. Cabeçalho com:
   - `nome` e `papel`;
   - `projetos`;
   - `ferramentas` (nomes das ferramentas MCP);
   - `escreve`: `nao`, `docs`, `plano`, `testes` ou `codigo`;
   - `modelo`: `forte`, `medio` ou `rapido`;
   - `schema` (da E02);
   - `limites`, como voltas e arquivos.

   O corpo traz as instruções do papel.
2. **Definições:**
   - `orquestrador.md` e `planejador.md`;
   - `executor-backend.md`, `executor-frontend.md` e `executor-sql.md`;
   - `testador.md`, `revisor.md`, `seguranca.md`, `consertador.md` e `diagnostico.md`.

   Cada uma aponta para as policies e steerings que deve carregar, em vez de copiá-las.
3. **Conversor sem dependências** (`scripts/agentes/converter.mjs`):
   - **Claude Code:** gera `.claude/agents/<nome>.md` (nome, descrição, ferramentas e modelo);
   - **OpenCode:** gera o formato de agente dele;
   - **Managed Agents:** gera um JSON com prompt e ferramentas.

   A tabela `config/modelos.json` traduz `forte`, `medio` e `rapido` para o modelo de cada provedor.
4. **Saída nos consumidores:** os arquivos gerados entram em cada repositório consumidor por PR, como arquivos gerados (fora do limite de linhas). Um modo `--verificar` confere se estão iguais à infra.

**Feito pela IA:** `agents/README.md`, as definições, `config/modelos.json`, o conversor com `--verificar` e os PRs dos arquivos gerados nos consumidores.

**Ação humana:** nenhuma.

**Aceite:**

- O conversor valida o cabeçalho de todas as definições e falha com campo faltando.
- O Claude Code lista os subagentes gerados num repositório consumidor.

## E02 — Saída tipada com schema e grau de confiança

1. **Schema base** em `mcp/server/saida-agente.ts` (zod):
   - `resultado`, `arquivos[]`;
   - `decisoes[]` (o que, por quê, alternativas);
   - `confianca` (`baixa`, `media` ou `alta`);
   - `evidencias[]` (arquivo:linha, log ou link);
   - `pendencias[]`.

   Extensões por papel: o Revisor e o de Segurança ganham `apontamentos[]` com severidade e local; o Diagnóstico ganha `hipoteses[]`.
2. **Ferramenta MCP** `validar_saida_agente({ papel, tentativa, saida })`. Devolve `aceitar`, `repetir` (fora do schema, até a 2ª repetição) ou `perguntar` (confiança baixa, evidência vazia ou terceira falha), com os erros.
3. **JSON Schema** exportado em `agents/schema/` para os runtimes que validam sozinhos (decisão pendente P2).
4. **Testes** com `node --test` no MCP. Hoje ele só tem smoke.

**Feito pela IA:** os itens 1 a 4 inteiros.

**Ação humana:** nenhuma.

**Aceite:**

- Saída inválida devolve `repetir` com os erros.
- Confiança baixa devolve `perguntar`.
- A terceira falha devolve `perguntar`.

## E03 — Ferramentas do MCP por papel

1. **`config/papeis.json`:** para cada papel, as ferramentas liberadas e, para quem escreve, os caminhos permitidos. Exemplo: o Testador só em `src/test/**` e `**/*.test.ts`.
2. **Credencial com papel:**
   - no HTTP, a credencial do cliente ganha `papel`, ao lado da allowlist de projetos que já existe;
   - no `stdio`, o papel vem de `MCP_PAPEL`.

   `mcp/server/factory.ts` registra só as ferramentas do papel.
3. **Checagem de caminho** em `update_file`, `apply_changes_and_merge` e `git_commit` antes de escrever.
4. **Sem papel = só leitura.**

**Feito pela IA:** `config/papeis.json`, o papel na credencial e em `MCP_PAPEL`, o registro por papel em `factory.ts` e a checagem de caminho, com testes.

**Ação humana:**

- **Cada dev, depois do merge:** definir `MCP_PAPEL` na configuração local do cliente MCP (ex.: `.mcp.json` fora do repositório ou variável de ambiente). Sem ele, o MCP fica só leitura. Conferir: `update_file` aparece na lista de ferramentas do papel executor.

**Aceite:**

- Com a credencial do Revisor, `update_file` não existe na lista de ferramentas.
- O Testador escrevendo em `src/main` é recusado.

## E04 — MCP remoto publicado (fases 8 e 9 do roadmap)

1. **Serviço no Railway** a partir de `mcp/`, só com HTTPS e domínio próprio.
2. **Segredos:** o token do GitHub vem da identidade do agente (SPEC-01 E01), e as credenciais dos clientes ficam em secret. O health check usa o `/healthz` que já existe.
3. **Ferramentas `git_*`:** dependem de clones locais. No serviço remoto, ficam desligadas ou passam a clonar num diretório temporário (conferir antes).
4. **Testes da fase 9 em sandbox:**
   - autenticação e escopo de projeto;
   - negação das operações não permitidas;
   - fluxo branch, PR e CI, parando no nível 0 da SPEC-01;
   - nenhuma operação em `master`;
   - validação SQL em banco descartável.
5. **Avaliar OAuth 2.1** para clientes que exigem a autorização MCP padrão. A avaliação é um documento, não código.
6. **Procedimento de pausa e rollback** antes de ampliar o uso.

**Feito pela IA:**

- a configuração de deploy versionada (build e start do `mcp/`) e o ajuste das ferramentas `git_*` para o modo remoto;
- os testes de sandbox, o documento de OAuth 2.1 e o procedimento de pausa e rollback.

**Ação humana:**

- **Dono, antes do deploy:** criar o serviço no Railway ligado à infra e aprovar o custo mensal.
- **Dono:** registrar o domínio (ou subdomínio) e apontar o DNS para o Railway. Conferir: o certificado HTTPS aparece como emitido.
- **Dono:** cadastrar nas variáveis do serviço o token da conta de máquina (SPEC-01 E01) e as credenciais dos clientes MCP. O agente não vê os valores; só recebe os nomes das variáveis. Conferir: `https://<domínio>/healthz` responde.

**Aceite:**

- `https://<domínio>/healthz` responde.
- Um cliente sem o projeto na allowlist é recusado.
- O cenário de sandbox está registrado com o resultado em `decisoes.md`.

## E05 — Modo agente da Lugia pelo MCP (bloqueada)

**Bloqueada até:** E03, E04 e a SPEC-01 E01 (nível 0).

1. **`LugiaAgenteClaudeClient`:**
   - troca o MCP do GitHub pelo MCP da infra (URL configurável);
   - a credencial no vault passa a ser a do cliente MCP com papel de executor e allowlist de projetos;
   - a montagem dos repositórios, se ainda precisar de token, usa um token só de leitura.
2. **Prompt:** `get_project_context` antes de escrever, `context_token` nas escritas, `get_workflow` e `get_logs` para acompanhar o CI, e merge só pelo nível de autonomia.
3. **Revogação:** depois de uma semana estável, revogar a credencial antiga do GitHub da Lugia.
4. **Feature `lugia`:** atualizar `features/lugia/` (nova versão ou correção, conforme [policies/features.md](../../policies/features.md)).
5. **Janela no backend:** combinar com a SPEC-03, porque as duas mexem no backend.

**Feito pela IA:** a mudança no `LugiaAgenteClaudeClient` com a URL configurável, o prompt e a versão nova de `features/lugia/`.

**Ação humana:**

- **Dono, antes do deploy do backend:** gravar no vault da Lugia a credencial do cliente MCP com papel executor e definir a variável com a URL do MCP no serviço do backend no Railway.
- **Dono, se a montagem dos repositórios ainda pedir token:** gerar um token só de leitura e gravá-lo no vault.
- **Dono, uma semana depois de estável:** revogar a credencial antiga do GitHub da Lugia. Conferir: ela aparece como revogada na página de tokens.

**Aceite:**

- Uma sessão do modo agente cria branch e PR pelo MCP da infra, sem nenhuma escrita pelo MCP do GitHub.
- A credencial antiga aparece como revogada.

## E06 — Fluxo orquestrado de ponta a ponta (bloqueada)

**Bloqueada até:** E01 a E03 e a SPEC-01 E01 a E03 (níveis e partes).

1. **`agents/fluxo.md`:**
   - etapas: Orquestrador, Planejador, aprovação humana, Executor, Testador, Revisor e Segurança, depois Consertador;
   - no máximo 3 voltas antes de chamar uma pessoa;
   - PR e merge pelo nível de autonomia;
   - consolidação em "Decisões".
2. **Primeiro runtime:** Claude Code local com os subagentes gerados na E01 (decisão pendente P1).
3. **Piloto:** um pedido real pequeno que atravessa SQL, backend e front, medindo voltas, tempo e tokens.

**Feito pela IA:** `agents/fluxo.md`, a execução do piloto e o relatório com voltas, tempo e tokens.

**Ação humana:**

- **Dono, antes do piloto:** escolher o pedido real.
- **Dono, durante o piloto:** aprovar o plano do Planejador (o passo de aprovação humana do fluxo) e revisar os três PRs.

**Aceite:** o piloto gera três PRs com o mesmo nome de branch e o `vN.md` preenchido pelo orquestrador. Uma saída inválida foi repetida e uma confiança baixa parou com pergunta.

## E07 — Revisão de PR com Claude Code Action

1. **Workflow `revisao-ia.yml`:**
   - modelo em `templates/github-workflows/`;
   - em cada repositório, roda em `pull_request` (aberto, atualizado, fora de rascunho);
   - permissões só `contents: read` e `pull-requests: write`.
2. **Instruções do Revisor** vêm da definição da E01. Enquanto ela não existir, um prompt próprio com os eixos: corretude, segurança, testes, steerings, desempenho e legibilidade.
3. **Repositórios públicos:**
   - só o evento `pull_request`, nunca `pull_request_target`;
   - PR de fork não recebe o secret, e o job é pulado.
4. **Custo:**
   - não roda em rascunho nem em PR `mecanico`;
   - limite de turnos.
5. **Do aviso ao obrigatório:** começa como aviso. Depois de cerca de 4 semanas de calibragem, entra nos checks obrigatórios (`config/rulesets/checks.json`, da SPEC-01 E02).

**Feito pela IA:** o modelo `revisao-ia.yml`, o prompt do Revisor, a cópia em cada repositório (no PR) e a atualização de `checks.json` depois da calibragem.

**Ação humana:**

- **Dono, antes do 1º PR de teste:** cadastrar a chave da API do modelo como secret de Actions em cada repositório e definir um limite de gasto no console do provedor.
- **Dono:** enviar e mesclar os commits que criam o workflow. Depois da SPEC-01 E07, o token do agente não altera `.github/workflows/`.
- **Dono (admin), depois de cerca de 4 semanas:** incluir o check no ruleset do backend e do frontend. Conferir: aparece como "Required" num PR.

**Aceite:**

- Um PR de teste em cada repositório recebe o comentário por eixo.
- A chave do workflow não consegue fazer push.

## E08 — Agente de diagnóstico (bloqueada)

**Bloqueada até:** SPEC-06 (stack de observabilidade escolhida e no ar).

1. **Ferramentas MCP só de leitura:**
   - `consultar_logs`, `consultar_metricas` e `consultar_traces` na stack da SPEC-06;
   - `analisar_har` e `analisar_log` para arquivos enviados.
2. **Limpeza antes de devolver ao modelo:** remover cookies, cabeçalhos de autorização, tokens e dados pessoais.
3. **Saída** com `hipoteses[]` e evidências (E02).

**Feito pela IA:** as ferramentas de leitura, a limpeza dos dados sensíveis e a extensão da saída, com testes.

**Ação humana:**

- **Dono, antes da 1ª parte:** criar na stack da SPEC-06 uma credencial só de leitura e cadastrá-la nas variáveis do MCP (local e remoto). Conferir: a credencial não consegue apagar nem gravar dados na stack.

**Aceite:** um incidente simulado gera hipótese com evidência apontando a causa; as ferramentas não têm escrita.

## E09 — Grafo de código para contexto

1. **Extração no CI:**
   - **nós:** classes, métodos, endpoints, queries de `query/*.properties`, tabelas do DDL e telas e services do front;
   - **arestas:** quem chama quem, qual endpoint usa qual service, qual query toca qual tabela, qual tela chama qual endpoint;
   - **ferramentas:** JavaParser ou tree-sitter, mais a leitura dos `.properties` e do DDL;
   - **saída:** SQLite publicado como artefato do CI (decisão pendente P5).
2. **Ferramentas MCP:** `quem_usa_tabela`, `impacto_endpoint` e `chamadores`.
3. **Piloto** com 5 tarefas, medindo tokens e acerto antes e depois.
4. **Momento:** melhor depois dos primeiros módulos da SPEC-09, que mudam os pacotes. O extrator precisa aceitar as duas estruturas durante a migração.

**Feito pela IA:** o extrator, as ferramentas MCP e o relatório do piloto.

**Ação humana:**

- **Dono, se a SPEC-01 E07 já estiver ativa:** enviar e mesclar o commit que cria o job de extração em `.github/workflows/`.

**Aceite:** as consultas acertam 3 casos conhecidos, e o relatório do piloto está registrado.

## E10 — Estudo de memória de longo prazo

1. **Antes de começar:** confirmar com quem pediu se "neural memory" é uma ferramenta específica.
2. **Documento** `estudo-memoria.md` nesta pasta, comparando:
   - a memória explícita atual (`vN.md`, ADRs, steerings);
   - a busca vetorial sobre a infra;
   - as abordagens de memória neural.

   Para cada uma: custo, risco de informação errada ou desatualizada e esforço.
3. **Recomendação** do que adotar.

**Feito pela IA:** o `estudo-memoria.md` e a recomendação.

**Ação humana:**

- **Dono, antes de começar:** confirmar com quem pediu o que é "neural memory".
- **Dono, no fim:** aprovar o documento.

**Aceite:** documento aprovado pelo responsável, com a recomendação registrada em `decisoes.md`.

## Branches sugeridas

| Etapa | Branch |
|---|---|
| E01 | `chore-spec-02-e01-subagentes` |
| E02 | `chore-spec-02-e02-saida-tipada` |
| E03 | `chore-spec-02-e03-ferramentas-papel` |
| E04 | `chore-spec-02-e04-mcp-remoto` |
| E05 | `fix-spec-02-e05-lugia-mcp` |
| E06 | `chore-spec-02-e06-fluxo-orquestrado` |
| E07 | `ci-spec-02-e07-revisao-ia` |
| E08 | `chore-spec-02-e08-diagnostico` |
| E09 | `chore-spec-02-e09-grafo-codigo` |
| E10 | `docs-spec-02-e10-estudo-memoria` |

## Riscos

- **Confiança declarada:** o modelo pode errar com confiança alta. A confiança só faz triagem; Revisor, Segurança e CI continuam valendo.
- **Custo de tokens:** subagentes multiplicam as chamadas. O piloto da E06 mede isso antes de ampliar.
- **Lugia com "sempre permitir":** a migração não pode deixar a Lugia sem MCP e sem token por um período; manter as duas credenciais até a E05 estar estável e revogar depois.
- **Repositórios públicos:** workflows com secret não podem rodar código de PR de fork.
- **Grafo desatualizado:** o grafo é gerado a cada push em `develop`; consulta sobre branch em andamento pode não refletir o diff.
