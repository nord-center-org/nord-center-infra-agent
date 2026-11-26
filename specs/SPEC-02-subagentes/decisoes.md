# SPEC-02 — Decisões

## Tomadas no plano de origem (26/11/2026)

### D1 — Conjunto inicial de subagentes

- **Decisão:** Orquestrador, Planejador, Executor (um por repositório), Testador, Revisor, Segurança, Consertador e Diagnóstico. Revisor, Segurança e Diagnóstico não escrevem.
- **Por quê:** quem revisa não pode ter escrito o código; papéis restritos limitam o estrago de um erro.
- **Decidido por:** zzNICK.

### D2 — Saída tipada com confiança para triagem

- **Decisão:** JSON validado por schema, com `confianca` e `evidencias`. Fora do schema, até duas repetições; confiança baixa ou evidência vazia para e pergunta.
- **Por quê:** o orquestrador precisa de respostas que dê para conferir por código. A confiança é declarada pelo modelo, não é calibrada, e por isso só faz triagem.
- **Decidido por:** zzNICK.

### D3 — Lugia pelo MCP como correção planejada

- **Decisão:** o modo agente da Lugia passa a operar só pelo MCP, com credencial própria e allowlist, mantendo a autonomia. Depois, o token antigo é revogado.
- **Por quê:** hoje ele escreve e mescla por fora das regras da infra.
- **Decidido por:** zzNICK.

### D4 — Review com Claude Code Action começa como aviso

- **Decisão:** a Action roda o papel de Revisor em todo PR e começa sem bloquear; vira check obrigatório depois da calibragem.
- **Por quê:** evitar falso positivo travando PR antes de calibrar o prompt.
- **Decidido por:** zzNICK.

## Tomadas pelo agente ao montar este plano (aguardam a aprovação do plano)

### D5 — Classes de modelo neutras

- **Decisão:** as definições dizem `forte`, `medio` ou `rapido`, e `config/modelos.json` traduz para o modelo de cada provedor.
- **Por quê:** ADR-001 (MCP e infra independentes do agente). Trocar de provedor ou de versão não exige reescrever as definições.
- **Alternativas descartadas:** nome do modelo em cada definição.
- **Decidido por:** agente (Claude Code com Claude Opus 5.5).

### D6 — Arquivos gerados nos consumidores

- **Decisão:** o conversor gera os arquivos de cada runtime, e eles entram nos repositórios consumidores como gerados, conferidos por `--verificar`.
- **Por quê:** o Claude Code lê os subagentes do próprio repositório. A infra é privada e os repositórios públicos não conseguem lê-la no CI.
- **Decidido por:** agente.

### D7 — Permissão por papel no MCP, com caminhos

- **Decisão:** papel na credencial (HTTP) ou em `MCP_PAPEL` (`stdio`). O MCP registra só as ferramentas do papel e confere o caminho antes de escrever. Sem papel, só leitura.
- **Por quê:** o critério de aceite exige que o MCP recuse a escrita do Revisor, e não só o prompt.
- **Decidido por:** agente.

### D8 — Grafo de código não bloqueado pela SPEC-09

- **Decisão:** a E09 pode começar quando houver gente livre. O momento recomendado é depois dos primeiros módulos da SPEC-09, com o extrator aceitando as duas estruturas.
- **Por quê:** o grafo ajuda já, mas a SPEC-09 muda os pacotes.
- **Decidido por:** agente.

### D9 — Claude Code Action só no evento `pull_request`

- **Decisão:** nunca `pull_request_target`.
- **Por quê:** backend e front são públicos. `pull_request_target` roda com secrets no contexto da base e, junto com o checkout do PR, permite que um fork leia a chave.
- **Decidido por:** agente.

## Perguntas ao responsável

Cada pergunta diz quando precisa de resposta: `antes da aprovação` do plano ou antes de a etapa indicada entrar em andamento. O CI e o `pegar` cobram as respostas nesse momento (policies/specs.md, seção 3).

### P1 — Runtime do primeiro fluxo orquestrado

- **Recomendação:** Claude Code local com subagentes (usa a assinatura, sem custo de API por chamada). Managed Agents depois, pela Lugia, quando a E05 estiver estável.
- **Decidir em:** E06
- **Resposta:** pendente

### P2 — Como gerar o JSON Schema

- **Recomendação:** atualizar o MCP para o zod 4, que exporta JSON Schema nativamente, se o SDK do MCP for compatível. Senão, manter o JSON Schema à mão com um teste que compara os dois.
- **Decidir em:** E02
- **Resposta:** pendente

### P3 — Credencial da Claude Code Action

- **Contexto:** a opção é entre chave de API (custo por uso, controle por repositório) e token da assinatura.
- **Recomendação:** chave de API com limite de gasto mensal, separada da usada pela Lugia.
- **Decidir em:** E07
- **Resposta:** pendente

### P4 — O que querem dizer "neural memory" e "JEV typesafe ai model vs LEYA"

- **Recomendação:** confirmar com quem pediu. Se for ferramenta ou biblioteca específica, ela entra no estudo da E10 ou no schema da E02.
- **Decidir em:** E02
- **Resposta:** pendente

### P5 — Onde guardar o grafo

- **Recomendação:** artefato do CI do último push em `develop`, baixado pelo MCP. Fica fora do Git, porque o SQLite é binário e muda a cada push.
- **Decidir em:** E09
- **Resposta:** pendente

### P6 — Revisão de PR sem bypass

- **Contexto:** a SPEC-01 decidiu (P3) que não há bypass e que a aprovação só vem depois de todas as validações. Quando a Claude Code Action virar check obrigatório, um comentário dela com apontamento grave também bloqueia o PR.
- **Recomendação:** começar como aviso (D4) e só tornar obrigatória quando a taxa de falso positivo da calibragem estiver baixa; o critério de "baixo" é definido na própria E07.
- **Decidir em:** E07
- **Resposta:** pendente