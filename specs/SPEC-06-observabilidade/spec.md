# SPEC-06 — Spec

> Copiado do plano de origem ("NordTool — Plano de specs", 26/11/2026). A situação atual ainda não foi conferida no código: confira antes de escrever o plano de implementação (policies/specs.md, seção 3).

**No MVP:** entra parcial (item 11): health check, error tracking e alertas básicos. As métricas do negócio (receita, cancelamentos, conversão) entram com a SPEC-22; o resto vem na evolução.

**Origem:** I-3 ("melhor opção para observabilidade, algo como Grafana ou Datadog"); R (agente que conecta em servidores de observabilidade, análise de dump de logs); L-26 (novos recursos de error tracking e revisão dos logs; o padrão de resposta de erro está na SPEC-14).

**O que é:** instrumentar backend e front para gerar métricas, logs estruturados e traces, e mandar tudo para uma ferramenta com dashboards e alertas. A recomendação é instrumentar com OpenTelemetry, que é neutro de fornecedor. Assim a escolha entre Grafana e Datadog vira configuração de destino e pode ser trocada sem mexer no código.

**Situação atual:**

- O backend não tem Actuator nem Micrometer no `pom.xml`: nenhuma métrica, nenhum health check do Spring.
- Os logs saem em texto, com o `idCorrelacao` vindo do header `X-Request-Id` (`CorrelacaoFilter`). O front já envia esse header e mostra o código no erro 500, o que é uma boa base para traces.
- O front não tem captura de erros JavaScript nem Web Vitals.
- As chamadas de IA da Lugia (latência, erros 429, tokens) não são medidas.

**Comparativo para a decisão:**

| Critério | Grafana (Cloud ou LGTM self-hosted) | Datadog |
| --- | --- | --- |
| Modelo | Open source (Grafana, Loki, Tempo, Mimir/Prometheus); Cloud gerenciado ou rodando no próprio cluster | SaaS fechado, tudo integrado |
| Custo | Cloud com plano gratuito para volume pequeno; self-hosted custa só a infra e o tempo de operar | Cobra por host, por volume de logs e por produto (APM, RUM etc.); cresce rápido |
| Esforço | Mais configuração de dashboards e alertas | Menos: agente, dashboards prontos, APM e RUM no mesmo lugar |
| Aprisionamento | Baixo | Alto, se usar o agente proprietário em vez do OTel |
| Encaixe no NordTool | Bom para o volume atual e para o orçamento enxuto da SPEC-07 | Bom se houver orçamento e preferirem não operar nada |

**Recomendação:** OpenTelemetry no código e Grafana Cloud no plano gratuito para começar. Migrar para LGTM dentro do cluster ou para Datadog só se volume ou necessidade justificarem. Confirmar os limites e preços atuais dos dois antes de decidir.

**O que fazer:**

1. **Backend:**
   - Actuator (só `health` público, o resto em porta de gestão interna; SPEC-04 item 11), com probes `liveness` e `readiness` para a SPEC-07.
   - Métricas Micrometer exportadas por OTLP: HTTP por rota, JVM, pool Hikari e cache Caffeine.
   - Traces OpenTelemetry (agente Java ou starter), propagando o `traceId` e mantendo o `X-Request-Id` como atributo.
2. **Logs estruturados em JSON** com o logging estruturado nativo do Spring Boot (disponível após a SPEC-03), incluindo `traceId`, usuário (id, nunca e-mail) e módulo. Nada de dados pessoais ou segredos.
3. **Métricas de negócio:** logins recusados, bloqueios, erros 403 por módulo, e chamadas de IA por provedor (latência, erro e tokens).
4. **Front:** captura de erros e Web Vitals com Grafana Faro ou Sentry, sem dados pessoais. O `traceId` vai junto do `X-Request-Id` para ligar o erro do front ao trace do back.
5. **Dashboards versionados** (JSON no repositório de infra): visão geral, taxa e erros e latência por endpoint, JVM e banco, e Lugia.
6. **Alertas** com destino definido (e-mail ou chat): taxa de 5xx, p95 acima do limite, pod reiniciando, pool de conexões esgotado, falha de login em massa.
7. **Acesso do agente de diagnóstico (SPEC-02):** credencial somente leitura para consultar logs, métricas e traces pela API da ferramenta escolhida, ou pelo servidor MCP dela, se houver.

**Error tracking e padrão de logs (L-26):**

- Todo erro 500 do back e todo erro JavaScript do front viram um evento agrupado numa ferramenta de error tracking (Sentry ou Grafana), com `idCorrelacao`, rota, versão e usuário (só o id). Erro novo ou em alta gera alerta.
- Guia de logs versionado na steering:
  - `ERROR` só para o que precisa de ação, `WARN` para o recuperável, `INFO` para eventos de negócio;
  - nada de log de corpo de requisição, senha, token ou dado pessoal;
  - uma mensagem por evento, com campos estruturados em vez de texto concatenado.
- Revisar os logs atuais contra esse guia.

**Critérios de aceite:**

- [ ] Uma requisição do front pode ser seguida até a query no banco num único trace.
- [ ] Os logs saem em JSON com `traceId`, sem dados pessoais (verificado por amostragem).
- [ ] Dashboards e alertas versionados; um alerta de teste chega ao destino.
- [ ] O subagente de diagnóstico consegue consultar os logs de uma janela de tempo com credencial só de leitura.

**Depende de:** SPEC-03 (Spring Boot novo). Se encaixa com a SPEC-07, que fornece onde rodar coletores e probes.

**Prazo estimado:** 12 a 15 dias úteis (96 a 120 horas).
