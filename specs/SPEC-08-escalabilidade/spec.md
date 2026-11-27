# SPEC-08 — Spec

> Copiado do plano de origem ("NordTool — Plano de specs", 26/11/2026). A situação atual ainda não foi conferida no código: confira antes de escrever o plano de implementação (policies/specs.md, seção 3).

**No MVP:** fica para a evolução. Rate limit e cotas por conta passam a fazer parte da escalabilidade, e o desligamento gracioso ajuda no deploy sem parada desde cedo.

**Origem:** I-4 ("balanceamento de carga, escalabilidade"); R (micro e macro benchmarks); L-8 (load balance), L-9 (escalabilidade horizontal em vez de vertical), L-67 (graceful shutdown e ferramentas que escalam a zero).

**O que é:** deixar o backend apto a rodar em várias réplicas atrás de um balanceador, com autoscaling, e medir a capacidade com testes de carga antes e depois. A parte de infraestrutura é pequena, porque o Kubernetes da SPEC-07 já entrega o balanceamento. O trabalho real está em tirar estado da memória de cada instância.

**Situação atual — o que impede escalar horizontalmente:**

| Ponto | Por que quebra com mais de uma réplica | Correção |
| --- | --- | --- |
| Limite de tentativas de login (`LimiteTentativasService`) | Cada pod conta separado; o limite efetivo vira limite × réplicas | Contador em tabela do Postgres (decidido) |
| Cache de versão de sessão (60 s) e caches Caffeine | A troca de senha num pod demora até o TTL para valer nos outros; o "limpar cache" da Administração só limpa um pod | TTL curto aceito e documentado, ou invalidação por `LISTEN/NOTIFY` do Postgres |
| SSE da Lugia (`/lugia/chat`) | Conexões longas caem no timeout do balanceador e no rollout | Timeout de leitura maior na rota, shutdown gracioso que espera as conexões e reconexão no front |
| Sessões do MCP em memória (ADR-010 exige uma instância) | A sessão não existe no outro pod | Manter uma réplica, usar afinidade de sessão ou mover as sessões para o Postgres |
| Pool Hikari de 10 conexões por pod | 10 × réplicas pode passar do `max_connections` do Postgres | Dimensionar o pool por réplica ou usar PgBouncer |
| Arquivos em `BYTEA` no banco | Downloads grandes pesam no banco e no heap | Object storage (SPEC-07 item 9) com URL assinada |
| Tarefas agendadas e `AdminBootstrapRunner` | Rodariam em todos os pods ao mesmo tempo | Verificar se há `@Scheduled`; se houver, usar ShedLock. O bootstrap já depende da tabela vazia, mas conferir a constraint única |

**O que fazer — escalabilidade:**

1. Corrigir os pontos da tabela, até o backend não guardar nada essencial em memória local.
2. `server.shutdown=graceful` e `readinessProbe` (SPEC-06), para o rollout não derrubar requisições.
3. Em `prod`, no mínimo 2 réplicas, HPA por CPU (e por latência quando houver métrica customizada) e PodDisruptionBudget.
4. Front: o nginx é estático e escala sem mudança. A CDN dos assets está na SPEC-17.

**O que fazer — graceful shutdown e escala a zero (L-67):**

- **Desligamento gracioso completo:**
  - `server.shutdown=graceful` e `spring.lifecycle.timeout-per-shutdown-phase` (ex.: 30 s);
  - `preStop` com pausa de 5 a 10 s, para o balanceador tirar o pod antes de ele parar de aceitar conexões;
  - `terminationGracePeriodSeconds` maior que a soma dos dois.

  Durante esse tempo, o pod termina as requisições em andamento, avisa as conexões SSE para o front reconectar e libera os locks dos jobs.
- **Escala a zero:** KEDA ou Knative desligam o que não tem tráfego e ligam na primeira requisição.
  - Faz sentido para o MCP, jobs agendados e o ambiente `develop` fora do horário, o que reduz custo.
  - Não é recomendado para o backend de produção: a JVM leva segundos para subir, e o primeiro usuário esperaria.
  - Se quiserem mesmo assim, avaliar Spring AOT ou imagem nativa (GraalVM) para reduzir o tempo de partida, medindo antes.

**O que fazer — benchmarks:**

1. **Macro (carga).** Cenários em k6 ou Gatling versionados no repositório:
   - login e renovação de token;
   - extrato e conta do mês do Financeiro;
   - listagem de apartamentos;
   - upload de termo;
   - chat da Lugia com provedor simulado.

   Rodar contra o ambiente `develop` sob demanda e semanalmente, nunca no PR. Antes, definir o SLO, por exemplo "p95 abaixo de X ms a Y requisições/s", com os números acordados com o time.
2. **Micro (JMH).** Para o código quente e puro: `PermissaoCalculator`, cálculos de projeção do Financeiro, leitura de XLSX e montagem de PDF. Fica num profile Maven separado, fora do `mvn verify`. A política de testes só permite `*ServiceImplTest`, então o `testing.md` registra os benchmarks como categoria à parte, conforme o ADR único da política de testes.
3. Guardar o resultado de cada rodada (artefato do CI), comparar com a anterior e alertar em regressão acima de um limite.

**Critérios de aceite:**

- [ ] Com 3 réplicas, o limite de login vale no total, e a troca de senha derruba as outras sessões dentro do prazo documentado.
- [ ] Rollout com tráfego constante não gera erro 5xx.
- [ ] O HPA escala sob o teste de carga e volta ao mínimo depois.
- [ ] Relatório de carga com o SLO atingido e a capacidade máxima registrada.

**Depende de:** SPEC-07 (cluster) e SPEC-06 (métricas para HPA e análise).

**Prazo estimado:** 15 a 18 dias úteis (120 a 144 horas).
