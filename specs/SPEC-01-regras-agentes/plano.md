# SPEC-01 — Plano de implementação

**Situação do plano:** proposta, aguardando aprovação (campo `Plano` da [ficha](README.md)). Nenhuma etapa entra em andamento antes da aprovação.

## Visão geral

A spec vira 10 etapas. As quatro primeiras são o item 2 do MVP (3 a 4 dias); as outras seis são a evolução. Cada etapa tem um único responsável por vez e é reservada pela ficha ([policies/specs.md](../../policies/specs.md)).

| Etapa | Itens da spec | Repositórios | Estimativa | Depende de |
|---|---|---|---|---|
| E01 Identidade do agente e nível 0 | 10 e a identidade do 8 | infra, backend, GitHub | 6–8 h | — |
| E02 Rulesets nativos | 12 | GitHub, infra | 4–6 h | E01 |
| E03 Limite de 500 linhas e branch mãe | 1 | sql, backend, frontend (regra na infra) | 8–10 h | E01 (mesmos arquivos do MCP) |
| E04 Hooks que falham fechado | 9 | infra, sql, backend, frontend | 6–8 h | — (o hook de limite usa o script da E03) |
| E05 Inconsistências e ADR de testes | 13 | infra, backend | 3–4 h | — |
| E06 Porquê, checklist de IA e plano obrigatório | 6, 7 e 11 | infra, sql, backend, frontend | 5–7 h | E03 (mesmo `create_pr`) |
| E07 Mínimo privilégio | 8 | GitHub, infra | 2–3 h | E01 e E02 |
| E08 Steerings por tipo de classe | 2 | infra | 6–8 h | — |
| E09 Skills e `scripts/verificar.sh` | 3 | infra, sql, backend, frontend | 5–6 h | E03 e E04 |
| E10 Padrões verificáveis e MapStruct | 4 e 5 | infra, backend | 3–4 h | fora da janela da SPEC-03 |

**Total:** 48 a 64 horas (6 a 8 dias úteis). MVP (E01 a E04): 24 a 32 horas.

**Ordem e paralelismo.**

```text
E01 ──► E02 ──► E07
  └───► E03 ──► E06
          └───► E09 ◄── E04
E05, E08 e E10: independentes
```

- **Com um dev:** E01, E02, E03, E04, depois E05 (antes da SPEC-03 e da SPEC-21), E06, E07, E08, E09 e E10.
- **Com dois devs:** dev A faz E01, E03 e E06 (todas mexem nas ferramentas de PR do MCP, por isso em sequência); dev B faz E05, E04 e E08. A E02 e a E07 são executadas pelo responsável do projeto, porque exigem permissão de admin, que o agente não pode ter.
- A E05 é pequena e destrava o ADR de testes, de que a SPEC-21 (MVP item 9) depende. Recomendado fazê-la cedo, mesmo fora do bloco do MVP.

**Enquanto a E03 não estiver ativa,** cada etapa é uma branch por repositório com PR direto para `develop`, procurando ficar perto de 500 linhas. Depois dela, a branch da etapa é a branch mãe e o trabalho segue em partes `-001`, `-002`…

## E01 — Identidade do agente e autonomia nível 0 (MVP)

**Por que primeiro:** hoje o MCP e as sessões usam o token do dono do projeto, que é admin. Assim não dá para exigir aprovação no PR (o GitHub não deixa o autor aprovar o próprio PR) nem tirar o agente da lista de bypass. A E02 depende disso.

**O que fazer:**

1. **Identidade própria do agente** na organização, com papel `write` (nunca admin) e token fine-grained por repositório. É uma **conta de máquina** (resposta P1): um usuário próprio do GitHub, sem admin, com token fine-grained por repositório. O GitHub App fica para a SPEC-02 E04. O MCP local, a Lugia e o `vigia-issue` passam a usar essa credencial.
2. **Arquivo de níveis** `config/autonomia.json`, lido pelo MCP: nível por projeto e por tipo de mudança, com o histórico de mudanças de nível (data, motivo e PRs que justificam). Começa tudo em 0.
3. **MCP consulta o nível** num módulo novo, `mcp/server/autonomia.ts`, com a função pura `podeMesclar(projeto, base, head)`:
   - nível 0: nunca mescla; devolve o PR com `aguardando: "confirmação humana"`;
   - nível 1: mescla só partes na branch mãe; mãe para `develop`, nunca;
   - nível 2: também mescla em `develop` quando a branch é `docs-`, `test-` ou `chore-`;
   - `master` e `main`: nunca, em nenhum nível.

   `merge_pull_request` e `apply_changes_and_merge` (`mcp/tools/github/`) chamam a função antes do merge.
4. **Policies:** nova `policies/autonomia.md` (níveis, como sobe e como desce). Reescrever o item 7 de `git-workflow.md`, os itens 9, 10 e 15 de `protected-branches.md`, `permissions.md` e o `AGENTS.md` da infra: em vez de "faça squash merge automaticamente", "abra o PR e siga o nível de autonomia". Conferir os `AGENTS.md` e `steering/*/git-workflow.md` dos consumidores.
5. **Os outros caminhos de agente:**
   - prompt do modo agente da Lugia (`LugiaAgenteClaudeClient`, instrução "faça o squash merge"): passa a abrir o PR e parar;
   - prompt do `vigia-issue` (`vigia-issue/lib.mjs`): o mesmo.

**Feito pela IA:**

- `config/autonomia.json`, `mcp/server/autonomia.ts` com testes e a chamada em `merge_pull_request` e `apply_changes_and_merge`;
- `policies/autonomia.md` e a reescrita de `git-workflow.md`, `protected-branches.md`, `permissions.md` e dos `AGENTS.md`;
- prompts da Lugia (`LugiaAgenteClaudeClient`, backend) e do `vigia-issue`.

**Ação humana:**

- **Dono do projeto, antes da 1ª parte:** criar a conta de máquina no GitHub e convidá-la para os 4 repositórios e a infra com papel `write`. Conferir: a conta aparece em Settings > Collaborators sem admin.
- **Dono, antes de ligar o MCP à nova conta:** gerar o token fine-grained da conta (repositórios da Nord, escopos da E07) e colocá-lo no `GITHUB_TOKEN` local do MCP, no vault da Lugia (Railway) e no secret do `vigia-issue`. O token nunca passa pelo agente nem entra no repositório. Conferir: um PR de teste aberto pelo MCP aparece com a conta de máquina.
- **Dono:** revisar e mesclar os PRs da etapa (no nível 0 o agente não mescla).

**Aceite:**

- `merge_pull_request` em nível 0 devolve `merged: false` com o motivo, e nenhum merge acontece.
- Os PRs abertos pelo MCP aparecem com a identidade do agente, não com a do dono.
- Busca por "merge automaticamente" nas policies, `AGENTS.md` e prompts não encontra mais a regra antiga.

**Risco:** até a E02, a regra é só de prompt e de MCP; um token com permissão de merge ainda consegue mesclar por fora. A E02 fecha isso.

## E02 — Proteção nativa com rulesets (MVP)

**Executada pelo responsável do projeto** (admin). O agente prepara as definições e a documentação; quem aplica é a pessoa.

**O que fazer:**

1. **Só nos repositórios públicos** (backend e frontend). A organização fica no plano gratuito (resposta P2), que não tem ruleset em repositório privado. Infra e SQL seguem protegidos pelo MCP e pelo token de mínimo privilégio (E07).
2. **Definições versionadas** em `config/rulesets/`:
   - `develop.json`: exigir PR com 1 aprovação, descartar aprovação antiga a cada push, exigir aprovação do último push, status checks obrigatórios, bloquear force push e exclusão;
   - `master.json`: o mesmo, sem bypass;
   - `checks.json`: os checks obrigatórios por repositório.
3. **Sem bypass para ninguém** (resposta P3): nem admin, nem a identidade do agente, nem a Lugia, nem o `vigia-issue`. A aprovação só acontece depois de todas as validações passarem: os checks obrigatórios, mais "exigir aprovação do último push", impedem aprovar antes do CI verde ou mudar o código depois da aprovação. Como o autor não aprova o próprio PR, os PRs desses repositórios são abertos pela identidade do agente, e o dono aprova (resposta P7).
4. **Checks obrigatórios** (nomes dos jobs de hoje; confirmar ao aplicar):
   - backend: `Build & Testes`, `Qualidade de Código`, `Secret Scanning`, `Resumo de Alertas`;
   - frontend: `Lint, Build & Testes`, `Secret Scanning`, `Resumo de Alertas`;

   As E03 e E04 acrescentam os checks novos. SQL (`Validação SQL`, `Secret Scanning`) e infra (`mcp-build`, `specs`) entram se a organização passar para um plano pago.
5. **Repositório:** permitir só squash merge e apagar a branch depois do merge.
6. **`protected-branches.md`:** regras nativas obrigatórias, com o passo a passo para aplicar e conferir; remover a ressalva "sem proteção nativa…".
7. **Tirar o "opcional"** do ADR-006 (`decisions.md` e `architecture.md`) com um ADR novo que o substitui, e marcar no `roadmap.md` (fase 6) que as regras nativas passaram a ser obrigatórias.

**Feito pela IA:**

- `config/rulesets/develop.json`, `master.json` e `checks.json`;
- `protected-branches.md` com o passo a passo, o ADR novo e o `roadmap.md`;
- os testes de aceite (push direto, force push e merge sem aprovação com o token do agente), depois de as regras estarem aplicadas.

**Ação humana:**

- **Dono (admin), depois do PR das definições:** importar os rulesets em Settings > Rules do backend e do frontend, com a lista de bypass vazia, e conferir os nomes dos checks com os jobs de hoje.
- **Dono (admin):** em Settings > General dos dois repositórios, deixar só squash merge e ligar "apagar a branch depois do merge".
- **Dono:** avisar no PR quando terminar, para o agente rodar os testes de aceite. Conferir: o push de teste em `develop` volta `GH013`.

**Aceite:**

- Push direto em `develop` com o token do agente é recusado (erro `GH013`).
- Force push e exclusão de `develop` são recusados.
- PR sem aprovação não pode ser mesclado pelo agente.
- A lista de bypass está vazia.

## E03 — Programação incremental com limite de 500 linhas (MVP)

**O que fazer:**

1. **Configuração única** em `config/programacao-incremental.json`:
   - `limite`: 500;
   - `repositorios`: só `nord-tool-backend`, `nord-tool-frontend` e `nord-tool-scripts-sql` (resposta P4); a infra fica fora;
   - `rotuloMecanico`: `mecanico`.
2. **Contador sem dependências** (`scripts/limite-linhas.sh`), com `git diff --numstat base...head` e os padrões da configuração. Em bash, para rodar igual no CI, no Git Bash do Windows e nos hooks da E04. A infra mantém o modelo em `templates/`, e cada repositório recebe uma cópia.
3. **CI do backend, do frontend e do SQL:** job `Limite de linhas` em todo PR.
   - Acima do limite: falha, salvo com o rótulo `mecanico` e a linha `Comando:` na descrição.
   - O gatilho `pull_request` passa a aceitar como base as branches mães, além de `develop`.
   - **Gate leve** (PR de parte para a mãe): build, testes, lint, secret scan e limite.
   - **Gate completo** (mãe para `develop`): o pipeline inteiro de hoje.
4. **MCP:**
   - `create_pr` aceita como base `develop` ou a branch mãe da parte (`<mãe>-NNN`);
   - conta as linhas pela API de comparação do GitHub e recusa acima do limite;
   - aceita `mecanico: true` com o comando, aplicando o rótulo e a linha `Comando:`;
   - `apply_changes_and_merge` faz a mesma conta;
   - lógica em `mcp/server/limite-linhas.ts`, mais `isPartBranch` em `mcp/server/branches.ts`.
5. **Policies:** `features.md` ganha a branch mãe e as partes (seções 2, 3 e 5), com o slug limitado a 34 caracteres (`feature-<slug>-vNN-001` cabe em 50). Também a regra de atualizar a mãe com `develop` a cada parte e o squash de cada parte como um commit na mãe com "Decisões".

**Feito pela IA:**

- `config/programacao-incremental.json`, `scripts/limite-linhas.sh` (modelo em `templates/` e cópia em cada repositório);
- job `Limite de linhas` e os gates leve e completo no CI do backend, do frontend e do SQL;
- `mcp/server/limite-linhas.ts`, `isPartBranch` e as mudanças em `create_pr` e `apply_changes_and_merge`, com testes;
- o rótulo `mecanico` nos 3 repositórios (pela API, com o token `write`) e `features.md`.

**Ação humana:**

- **Dono (admin), depois de o job rodar a 1ª vez:** acrescentar `Limite de linhas` aos checks obrigatórios do ruleset do backend e do frontend. Conferir: o check aparece como "Required" num PR.

**Aceite:**

- PR com 501 linhas contadas falha no CI e é recusado pelo MCP.
- Mudanças só em lockfile, teste ou Markdown passam.
- PR `mecanico` com o comando passa.
- Uma feature de exemplo é entregue em duas partes pela branch mãe.

**Resposta P4:** só código do backend, do frontend e do SQL conta; Markdown e a infra ficam fora.

## E04 — Hooks que falham fechado (MVP)

**O que fazer:**

1. **Hooks Git versionados** em `.githooks/` de cada repositório, ativados por `scripts/instalar-hooks.sh` (`git config core.hooksPath .githooks`):
   - `pre-commit`: Gitleaks nos arquivos staged e lint rápido do que mudou (ESLint no front);
   - `pre-push`: limite de linhas contra a base (script da E03) e Gitleaks no intervalo enviado.
2. **Falha fechada:**
   - `set -euo pipefail`;
   - ferramenta ausente, erro ou tempo esgotado (`timeout`) bloqueiam, com a instrução de correção na mensagem.
3. **Hooks do agente:** `.claude/settings.json` versionado em cada repositório, com `PreToolUse` no Bash que bloqueia:
   - `--no-verify`;
   - push para `develop`, `master` ou `main`;
   - `push --force`;
   - mudanças em `core.hooksPath`.

   O Claude Code só bloqueia com código de saída 2; os outros códigos não bloqueiam. Por isso o script converte qualquer erro em 2.
4. **MCP:**
   - `git_commit` roda o git com `-c core.hooksPath=.githooks` quando a pasta existe;
   - recusa qualquer argumento `--no-verify`.
5. **CI é a garantia:** hook local pode ser pulado, então o CI repete tudo (Gitleaks já roda; limite de linhas vem da E03).

**Feito pela IA:**

- `.githooks/pre-commit`, `.githooks/pre-push` e `scripts/instalar-hooks.sh` em cada repositório;
- `.claude/settings.json` com o `PreToolUse` e o script que bloqueia;
- `git_commit` do MCP com `core.hooksPath` e a recusa de `--no-verify`, com testes.

**Ação humana:**

- **Cada dev, uma vez por máquina:** instalar o Gitleaks (e o `timeout`, que já vem no Git Bash) e rodar `scripts/instalar-hooks.sh` em cada clone. Conferir: `git config core.hooksPath` responde `.githooks`.

**Aceite:**

- Um segredo falso no commit é bloqueado.
- Com o Gitleaks ausente, o hook bloqueia em vez de passar.
- `git commit --no-verify` é bloqueado no Claude Code.
- O mesmo problema enviado com o hook desligado falha no CI.

## E05 — Inconsistências e ADR da política de testes

1. **`steering/nord-tool-backend/architecture.md`:** 2.7.15 vira 2.7.18. A troca para Java 21 e Spring Boot 4 entra no PR da SPEC-03, quando a versão mudar de fato.
2. **`AGENTS.md` do backend:** "Preserve Java 11 e Spring Boot 2.7.x" vira "siga as versões do `pom.xml`; a migração é a SPEC-03". Remove o conflito sem antecipar a migração.
3. **ADR-014 em `decisions.md`** (o ADR-013 é o registro de specs): política de testes com as quatro exceções aprovadas:
   - Testcontainers para repository, RLS e concorrência;
   - novas guardas de segurança;
   - entidades e objetos de valor do domínio;
   - JMH em profile separado.
4. **`steering/nord-tool-backend/testing.md`** e **`scripts/verificar-politica-testes.sh`:** aceitar as quatro categorias pelos nomes e pastas definidos na decisão pendente P6.

**Feito pela IA:** os itens 1 a 4 inteiros, com um teste de exemplo de cada categoria.

**Ação humana:** nenhuma (a P6 é uma pergunta ao responsável, não uma configuração).

**Aceite:** o script de política aceita um teste de exemplo de cada categoria e continua recusando as categorias proibidas.

## E06 — Porquê, checklist de código de IA e plano obrigatório

1. **`policies/validacao-codigo-ia.md`:** o checklist do item 6 da spec.
2. **`.github/pull_request_template.md`** nos 4 repositórios e na infra, com:
   - resumo e doc;
   - PRs irmãos;
   - "Decisões";
   - checklist de IA (quando o autor é agente);
   - "Comando" (quando `mecanico`).
3. **Modelos:**
   - `templates/feature/vN.md` ganha a seção "Plano" (escopo, arquivos, riscos, divisão em partes) e o campo "Plano aprovado por / em";
   - os modelos de `templates/spec/` já trazem isso.
4. **MCP `create_pr`:**
   - para branches `refactor-`, `ci-`, `chore-` e `test-`, exige "## Decisões" com ao menos um item;
   - para todo PR de agente, exige o checklist.
5. **Regra no topo de `decisions.md`:** decisão de arquitetura vira ADR.

**Feito pela IA:** os itens 1 a 5 inteiros, com testes das recusas do `create_pr`.

**Ação humana:** nenhuma.

**Aceite:**

- O MCP recusa um PR `chore-` sem "Decisões".
- O modelo de PR aparece ao abrir um PR no GitHub.

## E07 — Mínimo privilégio dos agentes

1. **Token do agente:**
   - Contents e Pull requests de escrita, Actions e Metadata de leitura;
   - sem Administration, Secrets nem Workflows;
   - validade de até 90 dias.

   Sem a permissão Workflows, o GitHub recusa push que altere `.github/workflows/`. Isso cumpre a regra "nenhuma mudança de pipeline fora de um PR `ci-`".
2. **Mesmo escopo** para o token da Lugia (até a migração na SPEC-02) e do `vigia-issue`.
3. **`policies/permissions.md`:** matriz de credenciais (quem, escopo, validade, rotação). O agente não acessa o banco de produção nem tem shell em servidor.

**Feito pela IA:**

- a matriz de credenciais em `policies/permissions.md`;
- os testes de aceite com o token novo (mudar configuração, ler secret e enviar commit em workflow), depois da troca.

**Ação humana:**

- **Dono, antes dos testes:** recriar o token da conta de máquina só com Contents e Pull requests de escrita, Actions e Metadata de leitura, validade de até 90 dias, e trocá-lo no MCP local.
- **Dono:** fazer o mesmo com o token da Lugia (vault no Railway) e o do `vigia-issue` (secret do repositório), e revogar os tokens antigos.
- **Dono:** criar um lembrete de rotação antes do vencimento (90 dias). Conferir: a página de tokens do GitHub mostra só os tokens novos, com a data de expiração.

**Aceite:** com o token do agente, mudar uma configuração do repositório, ler secrets ou enviar um commit que altera um workflow é recusado.

## E08 — Steerings por tipo de classe

1. **Backend:** `steering/nord-tool-backend/padroes/`, com `controller.md` (read e write), `form.md`, `dto.md`, `domain.md`, `repository.md` (com a query `.properties`), `service.md` (interface e impl), `exception.md` e `mapper.md`.
2. **Front:** `steering/nord-tool-frontend/padroes/`, com `page.md`, `componente.md`, `service.md` e `util.md`.
3. **Conteúdo de cada arquivo:** regras, um exemplo curto tirado do código real (com o caminho) e o que não fazer.
4. **Limite de contexto:** conferir o tamanho do `get_project_context`, que tem limite de 100 mil caracteres (hoje 51 mil no backend).
5. **SPEC-09:** revisar estas steerings junto com ela, porque ela muda os pacotes.

**Feito pela IA:** os itens 1 a 4 inteiros.

**Ação humana:** nenhuma.

**Aceite:** `get_project_context` do backend e do front devolve os arquivos novos.

## E09 — Skills, comandos e scripts de verificação

1. **Skills novas:**
   - `endpoint` no backend, com a ordem fixa: SQL, repository, service com teste, controller, rota no guard e doc;
   - `migracao-sql` no SQL;
   - `revisao-seguranca` (checklist genérico, sem detalhe sensível);
   - `parte-incremental` em cada projeto.
2. **Skills existentes:** revisar as 12 para seguir o nível de autonomia e as partes.
3. **`scripts/verificar.sh`** em cada repositório, rodando localmente exatamente os gates do CI, inclusive o limite de linhas e o Gitleaks.

**Feito pela IA:** as skills novas, a revisão das 12 existentes e o `scripts/verificar.sh` de cada repositório.

**Ação humana:** nenhuma (o Gitleaks local já vem da E04).

**Aceite:** `scripts/verificar.sh` passa e falha nos mesmos casos que o CI, em cada repositório.

## E10 — Padrões de código verificáveis e decisão sobre MapStruct

1. **`steering/nord-tool-backend/coding-standards.md`:** consolidar a lista do item 4 da spec.
2. **Ruleset próprio do PMD no backend:**
   - God Class, complexidade ciclomática e acoplamento entre objetos;
   - regra XPath que falha com `@Autowired` em campo.

   Conferir antes o ruleset que o `pom.xml` usa hoje.
3. **ADR sobre MapStruct** (decisão pendente P5).
4. **Janela:** fazer antes de a SPEC-03 começar ou depois de ela terminar. As duas mexem no `pom.xml`.

**Feito pela IA:** `coding-standards.md`, o ruleset do PMD no `pom.xml` e o ADR do MapStruct, depois da resposta da P5.

**Ação humana:** nenhuma; só combinar a janela com quem pegar a SPEC-03.

**Aceite:** uma classe de teste com injeção em campo faz o `mvn pmd:check` falhar; o código atual passa.

## Branches sugeridas

| Etapa | Branch (mesmo nome em todos os repositórios tocados) |
|---|---|
| E01 | `chore-spec-01-e01-nivel-zero` |
| E02 | `chore-spec-01-e02-rulesets` |
| E03 | `ci-spec-01-e03-limite-linhas` |
| E04 | `ci-spec-01-e04-hooks` |
| E05 | `docs-spec-01-e05-adr-testes` |
| E06 | `chore-spec-01-e06-checklist-ia` |
| E07 | `chore-spec-01-e07-minimo-privilegio` |
| E08 | `docs-spec-01-e08-steerings-classe` |
| E09 | `chore-spec-01-e09-skills-verificar` |
| E10 | `chore-spec-01-e10-padroes-pmd` |

## Como provar os critérios de aceite da spec

| Critério | Etapa | Prova |
|---|---|---|
| Parte acima de 500 linhas falha no CI e no MCP; feature em duas partes | E03 | PR de teste com 501 linhas; feature de exemplo entregue pela mãe |
| Nível 0 sem merge sem pessoa; MCP respeita o nível | E01 | `merge_pull_request` em nível 0 devolve `merged: false` |
| Push direto recusado; token sem Settings, secrets e workflows | E02 e E07 | push de teste em `develop`; tentativa de alterar workflow |
| Hook que falha ou não roda bloqueia; CI repete | E04 | Gitleaks ausente; commit enviado com hook desligado |
| PR de agente com checklist e plano aprovado | E06 | PR sem checklist recusado pelo MCP |
| Contexto com steerings e skills novas; injeção em campo falha | E08, E09 e E10 | `get_project_context`; `mvn pmd:check` |

## Riscos

- **Plano gratuito (P2):** não há ruleset nos repositórios privados. Um token com escrita na infra ou no SQL consegue fazer push direto em `develop` por fora do MCP. Por isso a E07 (mínimo privilégio) importa mais nesses dois.
- **Lugia:** o modo agente usa a política "sempre permitir" nas ferramentas e um token próprio de GitHub. Até a E02, só o prompt segura o merge.
- **Um único mantenedor sem bypass (P3):** o dono não consegue aprovar o próprio PR no backend e no frontend. Até entrar um segundo dev, esses PRs são abertos pela identidade do agente (P7).
- **Hooks locais podem ser pulados:** a garantia é o CI, e os checks obrigatórios da E02 precisam incluir os jobs novos.
- **Contexto do MCP:** as steerings novas aproximam o `get_project_context` do limite de 100 mil caracteres. Se passar, adiantar o `get_feature_context` da SPEC-24.
- **Conflito com a SPEC-03:** a E05 e a E10 mexem no backend. Combinar a janela com quem pegar a SPEC-03.
