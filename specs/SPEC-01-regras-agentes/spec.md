# SPEC-01 — Spec

**Origem:** I-0; R (padrões de stack, steerings por tipo de classe, guardrails sem proteção nativa); L-3, 24, 25, 34, 48, 49, 56, 57 e 58 do plano de 26/11/2026.

## O que é

As regras que qualquer agente de IA segue ao mexer nos repositórios do NordTool. Hoje elas dependem do agente ler e obedecer. A meta é que o GitHub, o CI, os hooks e o MCP **recusem** o que estiver fora da regra, para que as outras specs do plano possam ser executadas por agentes com segurança.

## Situação atual (conferida no código em 2026-11-26)

O plano pede que a "Situação atual" seja conferida antes de começar. Resultado:

| Ponto do plano | Conferido | Observação |
|---|---|---|
| Branch por funcionalidade e regex do MCP | confirmado | `mcp/server/branches.ts`: `^(feature\|fix\|refactor\|test\|ci\|chore\|docs)-[a-z0-9]+(-[a-z0-9]+)*$`, até 50 caracteres |
| Porquê das decisões só em features | confirmado | `features/<slug>/vN.md`, seção "Decisões"; manutenção não registra |
| Catálogo `features/README.md` vazio | **mudou** | já tem 19 features registradas; ainda há telas "sem registro" |
| Sem limite de linhas por commit ou PR | confirmado | nenhum gate em nenhum dos 4 pipelines |
| `coding-standards.md` genérico | confirmado | 28 linhas no backend; sem steering por tipo de classe |
| MapStruct fora do `pom.xml` | confirmado | o pacote `builder` tem uma única classe; o resto do mapeamento é manual |
| Injeção em campo | não encontrada | as ocorrências de `@Autowired` conferidas estão em construtores |
| Proteção nativa marcada como "opcional" | confirmado, **em outro lugar** | `protected-branches.md` diz que as regras nativas "devem ser habilitadas"; o "opcional" está no ADR-006 (`decisions.md` e `architecture.md`) e no `roadmap.md` (fase 6). Na prática nenhuma está ligada: `develop` sem proteção nos 4 repositórios, sem rulesets no backend e no front; os privados devolvem 403 ao token atual |
| Merge automático em `develop` | confirmado e **maior** | além de `git-workflow.md`, `permissions.md`, `protected-branches.md` e `AGENTS.md`, mais dois caminhos mandam o agente mesclar sozinho: o prompt do modo agente da Lugia (`LugiaAgenteClaudeClient`) e o `vigia-issue` (`lib.mjs`) |
| Token do agente | confirmado | o MCP e as sessões usam o token do próprio dono do projeto (admin); o agente não tem identidade própria |
| Spring Boot 2.7.15 na steering e 2.7.18 no `pom.xml` | confirmado | `steering/nord-tool-backend/architecture.md` |
| `AGENTS.md` do backend manda preservar Java 11 | confirmado | conflita com a SPEC-03 |
| Gates existentes | confirmado | backend: build + jacoco 90% nos `*ServiceImpl`, PMD + SpotBugs, Gitleaks, OSV e Trivy (estes dois fora do PR); front: lint, build, `node --test`, Gitleaks, `npm audit`; SQL: validação e Gitleaks; infra: build do MCP |
| Hooks locais | não existem | nenhum `.githooks`, husky ou pre-commit nos 4 repositórios |

## O que fazer

1. **Programação incremental com limite de 500 linhas.** Branch mãe por funcionalidade (ou etapa de spec), partes numeradas `-001`, `-002`… com até 500 linhas alteradas cada (inseridas e removidas). Lockfiles, arquivos gerados, cargas SQL e testes não contam. Mudança feita por ferramenta usa o rótulo `mecanico`, com o comando registrado no PR e nenhuma alteração manual junto. PR de parte roda gate leve (build, testes, lint, secret scan); PR da mãe para `develop` roda o pipeline completo. O limite é conferido no CI e no MCP. A mãe é atualizada com `develop` a cada parte.
2. **Steerings por tipo de classe** no backend (controller read/write, form, dto, domain, repository + query `.properties`, service/impl, exception, mapper) e no front (page, componente, service, util), com regras e um exemplo real curto.
3. **Skills, comandos e scripts:** skills `endpoint`, `migracao-sql`, `revisao-seguranca` e `parte-incremental`; `scripts/verificar.sh` em cada repositório rodando localmente os gates do CI.
4. **Padrões de código e SOLID verificáveis:** consolidar `coding-standards.md` (DTO obrigatório, injeção por construtor, nomes em pt-br, comentário só quando necessário, SOLID); automatizar o que der com PMD (complexidade, God Class, acoplamento, `@Autowired` em campo); o resto vai para o checklist do Revisor (SPEC-02).
5. **Decidir MapStruct** e registrar como ADR.
6. **Critérios para validar código de IA:** `policies/validacao-codigo-ia.md` com checklist preenchido em todo PR de agente.
7. **Planejamento obrigatório antes do código:** plano no `vN.md` (escopo, arquivos, riscos, divisão em partes), parada para aprovação.
8. **Mínimo privilégio:** token fine-grained por repositório, sem admin, Settings, secrets nem `Workflows: write`; nenhum acesso ao banco de produção ou shell em servidor; cada subagente só com as ferramentas do seu papel (SPEC-02).
9. **Hooks que falham fechado:** pre-commit e pre-push (Gitleaks, lint, limite de linhas) e hooks do agente bloqueiam no problema, no erro e no tempo esgotado; `--no-verify` proibido e recusado pelo MCP; o CI repete tudo.
10. **Confirmação antes do merge e autonomia progressiva:** nível 0 no início (o agente abre o PR com o token dele, o dev confirma cada parte, a entrada em `develop` passa pelo responsável); nível 1 depois de 10 partes seguidas sem revert nem correção logo após o merge; nível 2 depois de mais 20; incidente volta um nível; `master` sempre com pessoa. O nível de cada projeto fica num arquivo da infra e o `merge_pull_request` do MCP o consulta. Vale também para o modo agente da Lugia.
11. **Porquê também em manutenção:** PRs `refactor-`, `ci-`, `chore-` e `test-` trazem a seção "Decisões"; o MCP valida. Decisão de arquitetura vira ADR.
12. **Proteção nativa obrigatória:** rulesets em `develop` e `master` dos 4 repositórios (PR obrigatório, status checks, aprovação do item 10, sem force push nem exclusão, nenhum token de agente no bypass).
13. **Corrigir as inconsistências** acima; `AGENTS.md` e steerings do backend passam a dizer Java 21 e Spring Boot 4 junto com a SPEC-03; ADR único da política de testes com as quatro exceções aprovadas, com `testing.md` e `verificar-politica-testes.sh` atualizados.

## Critérios de aceite

- [ ] Parte acima de 500 linhas falha no CI e é recusada pelo MCP; uma feature de exemplo foi entregue em pelo menos duas partes pela branch mãe.
- [ ] No nível 0, nenhum merge acontece sem confirmação humana; o MCP respeita o nível configurado.
- [ ] Push direto em `develop` com o token do agente é recusado pelo GitHub; o token não altera Settings, secrets nem workflows.
- [ ] Hook que falha ou não roda bloqueia o commit, e o CI repete a checagem.
- [ ] Todo PR de agente traz o checklist de validação preenchido e o plano aprovado no `vN.md`.
- [ ] `get_project_context` devolve as steerings por tipo de classe e as skills novas; injeção em campo falha o build.

## Depende de

SPEC-11 (backup) pronta antes, de preferência. Todas as outras specs são executadas sob estas regras.

## Prazo estimado

6 a 8 dias úteis (48 a 64 horas). No MVP (item 2), as etapas E01 a E04: 3 a 4 dias (24 a 32 horas).
