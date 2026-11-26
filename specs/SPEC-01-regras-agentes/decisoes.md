# SPEC-01 — Decisões

Decisões já tomadas no plano de origem, decisões do agente ao montar o plano de implementação e pontos que esperam a pessoa responsável. Uma decisão integrada não é apagada: se mudar, uma nova entrada registra o que mudou e por quê.

## Tomadas no plano de origem (26/11/2026)

### D1 — Limite de 500 linhas por parte

- **Decisão:** até 500 linhas alteradas (inseridas e removidas) por parte. Lockfiles, arquivos gerados, cargas SQL e testes não contam. Mudança feita por ferramenta usa o rótulo `mecanico`, com o comando registrado e sem alteração manual junto.
- **Por quê:** partes pequenas são revisáveis sozinhas; testes fora da conta para não incentivar parte sem teste.
- **Alternativas descartadas:** 400 linhas (sugestão anterior, substituída pelo L-49).
- **Decidido por:** zzNICK.

### D2 — Autonomia começa no nível 0

- **Decisão:** o agente abre os PRs com o token dele; o dev confirma cada parte na mãe; a entrada em `develop` passa pelo responsável, pelo menos nas ondas 0 e 1. Nível 1 depois de 10 partes seguidas sem revert nem correção logo após o merge; nível 2 depois de mais 20; incidente volta um nível.
- **Por quê:** L-34 e L-58 pedem confirmação antes de mesclar; a confiança no agente é ganha com histórico.
- **Alternativas descartadas:** manter o merge automático da `git-workflow.md`.
- **Decidido por:** zzNICK.

### D3 — Lugia pelo MCP na SPEC-02; até lá, regras nativas

- **Decisão:** o modo agente da Lugia passa a operar pelo MCP na SPEC-02. Até lá, segue com o token do GitHub, contido pelos rulesets da E02.
- **Por quê:** a migração depende do MCP remoto publicado.
- **Decidido por:** zzNICK.

### D4 — Java 21 e Spring Boot 4 nas steerings junto com a SPEC-03

- **Decisão:** `AGENTS.md` e steerings do backend passam a citar Java 21 e Spring Boot 4 quando a SPEC-03 migrar.
- **Por quê:** documentação sempre igual ao código.
- **Decidido por:** zzNICK.

### D5 — ADR único da política de testes

- **Decisão:** um ADR aprova quatro exceções de uma vez: Testcontainers (repository, RLS e concorrência), novas guardas de segurança, entidades e objetos de valor do domínio, e JMH em profile separado.
- **Por quê:** as SPEC-04, 05, 08, 09, 13, 15 e 21 precisam dessas categorias.
- **Decidido por:** zzNICK.

### D6 — Hífen no nome da branch e sufixo de 3 dígitos para partes

- **Decisão:** manter `tipo-slug` (o MCP só aceita esse padrão), com `-001`, `-002`… para partes, diferente do `-vN` de versão.
- **Por quê:** compatível com a regex atual do MCP e com o limite de 50 caracteres.
- **Decidido por:** zzNICK.

## Tomadas pelo agente ao montar este plano (aguardam a aprovação do plano)

### D7 — Dez etapas, com a identidade do agente antes dos rulesets

- **Decisão:** a spec vira E01 a E10; o bloco do MVP (itens 1, 9, 10 e 12) vira E01 a E04, com a identidade do agente (E01) antes dos rulesets (E02).
- **Por quê:** o token em uso hoje é do dono do projeto, que é admin. Exigir aprovação antes de o agente ter identidade própria impediria o dono de aprovar os PRs abertos em nome dele.
- **Alternativas descartadas:** uma etapa por item da spec (13 etapas, várias pequenas demais para reservar sozinhas).
- **Decidido por:** agente (Claude Code com Claude Opus 5.5).

### D8 — Configurações em `config/*.json`

- **Decisão:** níveis de autonomia, limite de linhas e rulesets ficam em `config/` como JSON.
- **Por quê:** o MCP e os scripts leem esses valores; `policies/` é Markdown e entra inteiro no contexto dos agentes.
- **Alternativas descartadas:** valores dentro das policies (frágil de ler por código).
- **Decidido por:** agente.

### D9 — Hooks em `.githooks` com `core.hooksPath`

- **Decisão:** hooks Git em bash versionados, sem framework.
- **Por quê:** o backend não usa Node; bash roda no CI e no Git Bash do Windows; nada a instalar além do Git.
- **Alternativas descartadas:** husky (exige Node em todo repositório), pre-commit (exige Python), lefthook (binário extra).
- **Decidido por:** agente.

### D10 — Gate leve e gate completo

- **Decisão:** PR de parte para a mãe roda build, testes, lint, secret scan e limite; PR da mãe para `develop` roda o pipeline completo de hoje.
- **Por quê:** a parte intermediária não precisa estar pronta para `develop`, mas não pode quebrar o build nem vazar segredo.
- **Decidido por:** agente.

### D11 — ADR-014 para a política de testes

- **Decisão:** o ADR da política de testes recebe o número 014.
- **Por quê:** o ADR-013 foi usado pelo registro de specs, entregue junto com este plano.
- **Decidido por:** agente.

## Pendentes (decisão da pessoa responsável)

### P1 — Identidade do agente: conta de máquina ou GitHub App

- **Recomendação:** conta de máquina com token fine-grained agora, porque não exige mudar código (o MCP, a Lugia e o `vigia-issue` já usam token). GitHub App depois, junto com o MCP remoto da SPEC-02, porque dá tokens de curta duração sem ocupar assento.
- **Atenção:** em plano pago, a conta de máquina ocupa um assento.

### P2 — Plano da organização no GitHub

- **Contexto:** ruleset e proteção de branch em repositório privado exigem plano pago. A infra e o SQL são privados.
- **Recomendação:** plano Team. Sem ele, os dois repositórios privados ficam protegidos só pelo MCP.
- **Não recomendado:** tornar os repositórios públicos.

### P3 — Bypass do admin no modo "somente por PR"

- **Recomendação:** sim, enquanto houver um só mantenedor. O admin mescla o próprio PR sem segunda aprovação, mas não faz push direto. Revisar quando entrar um segundo dev.

### P4 — Markdown conta no limite de 500 linhas?

- **Recomendação:** não contar `*.md`. Documentação não quebra o build, e a SPEC-24 vai gerar fichas longas. PR com mais de 1.500 linhas de documentação deve ser dividido por funcionalidade.

### P5 — MapStruct

- **Contexto:** o pacote `builder` tem uma única classe; o mapeamento é manual e explícito.
- **Recomendação:** não adotar agora. Reavaliar na SPEC-09, que redesenha os módulos e os mapeadores. Ao decidir, tirar o MapStruct dos requisitos ou registrar a adoção como ADR.

### P6 — Nomes e pastas das quatro categorias de teste

- **Recomendação** (decidir na E05):
  - Testcontainers em `*IT.java`;
  - guardas em `guard/`;
  - testes de domínio em `dominio/`;
  - benchmarks em `src/jmh/`, no profile `jmh`.
