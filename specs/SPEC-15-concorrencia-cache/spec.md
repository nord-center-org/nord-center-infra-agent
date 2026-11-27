# SPEC-15 — Spec

> Copiado do plano de origem ("NordTool — Plano de specs", 26/11/2026). A situação atual ainda não foi conferida no código: confira antes de escrever o plano de implementação (policies/specs.md, seção 3).

**No MVP:** fica para a evolução, mas a idempotência e a outbox já são usadas no MVP, nos webhooks e na cobrança (SPEC-22). Com clientes pagantes, as race conditions dos módulos vendidos sobem de prioridade dentro desta spec.

**Origem:** L-10 (cache para dados muito acessados e revisão do existente), L-17 (idempotência), L-18 (race condition), L-19 (dual-write), L-23 (cache stampede), L-50 (simultaneidade: pool, cache expirando junto, cobrar duas vezes, retry em serviço lento, timeout e TTL).

**O que é:** garantir que operações simultâneas e falhas parciais não gerem dado duplicado, perdido ou inconsistente. Estes tópicos vieram juntos porque têm a mesma raiz: duas coisas acontecendo ao mesmo tempo sobre o mesmo recurso. O cache entra aqui pelo mesmo motivo; mal feito, ele causa o próprio stampede e mostra dado velho.

**Situação atual:**

- **Já existe:**
  - Criação idempotente por `cdRequisicao` no Financeiro e em Investimentos, e controle de versão por `nrVersao` (409 em conflito).
  - Atualização otimista com rollback no front (Casamento e Caixinha).
  - Retry de até 2 vezes em 429/5xx nos provedores de IA; timeouts no e-mail (10 s) e na cotação (5 s).
  - Caches Caffeine (`CacheConfig`) para cotação (60 s), versão de sessão (60 s) e outros, com limpeza manual na Administração.
- **Pontos de risco identificados pela documentação** (confirmar no código):

| Situação | Tipo | Risco |
| --- | --- | --- |
| Venda de cotas "acima da posição é recusada" | Race (verificar e depois agir) | Duas vendas simultâneas passam pela checagem e deixam a posição negativa |
| Fechar e reabrir mês do Financeiro | Race + atomicidade | Grava o saldo, trava os lançamentos e gera os fixos do mês seguinte. Se não for uma transação única, fica pela metade; dois cliques geram fixos em dobro |
| Agente da Lugia "criado no primeiro uso", com os ids salvos em `lugia_configuracao` | Dual-write + race | Cria o recurso na Anthropic e depois salva no banco. Dois primeiros usos simultâneos criam dois agentes; uma falha entre as etapas deixa um órfão |
| E-mail de cadastro e redefinição de senha | Dual-write | E-mail enviado e transação desfeita, ou o contrário |
| Arquivos ao sair do `BYTEA` para o bucket (SPEC-07) | Dual-write | Arquivo no bucket sem linha no banco, ou linha apontando para arquivo inexistente |
| POSTs sem `cdRequisicao` nos outros módulos | Idempotência | Duplo clique ou retry de rede cria registro duplicado |
| Pool Hikari de 10 conexões e chamadas externas lentas dentro de transação | Simultaneidade | Conexões presas esperando IA ou cotação esgotam o pool, e o sistema todo trava |

**O que fazer:**

1. **Idempotência geral (L-17).** Generalizar o `cdRequisicao`: o header `Idempotency-Key` vale em todo POST que cria algo. Uma tabela guarda chave, usuário, hash do corpo e resposta por 24 h; a mesma chave devolve a mesma resposta, e o mesmo pedido com corpo diferente recebe 422. O front gera a chave por envio de formulário.
2. **Race conditions (L-18):**
   - Inventariar toda operação de verificar e depois agir.
   - Resolver com constraint no banco (unique, check), `SELECT … FOR UPDATE` no agregado (posição de investimento, conta do mês, chave) ou versão otimista.
   - Para recursos únicos, como a criação do agente da Lugia, usar *advisory lock* do Postgres.
3. **Dual-write (L-19).** Padrão *transactional outbox*: o evento (enviar e-mail, apagar arquivo do bucket, notificar) é gravado numa tabela `outbox` na mesma transação do dado. Um publicador envia depois do commit, com retry. Para arquivos: sobe para o bucket como "pendente", grava a linha e confirma; um job limpa os órfãos. Como primeiro passo simples, `@TransactionalEventListener(AFTER_COMMIT)`.
4. **Timeouts, retry e circuit breaker (L-50).** Usar Resilience4j em toda chamada externa (cotação, provedores de IA, SMTP, GitHub):
   - timeout explícito;
   - retry só em operação idempotente, com backoff exponencial, *jitter* e limite de tentativas;
   - circuit breaker para parar de insistir num serviço lento;
   - nenhuma chamada externa dentro de transação de banco.

   O timeout total da requisição tem de ser menor que o do balanceador, e o `statement_timeout` do Postgres e o `connectionTimeout` do Hikari ficam definidos. O tamanho do pool é calculado junto com o número de réplicas (SPEC-08).
5. **Cache (L-10).**
   - Revisar os caches atuais e listar candidatos: dados lidos por muitos e alterados raramente (cargos, empresas, colaboradores, ferramentas, obras, permissões efetivas, cotações). Dados pessoais que mudam a todo momento ficam fora.
   - Caffeine local em cada instância. Com várias réplicas, a invalidação entre elas usa `LISTEN/NOTIFY` do Postgres (decidido: sem Redis por enquanto).
   - Invalidação na escrita, métricas de acerto (SPEC-06) e TTL com *jitter*, para as chaves não vencerem juntas.
6. **Cache stampede (L-23).**
   - Carregamento único por chave (`cache.get(chave, loader)` do Caffeine já faz isso numa instância; entre réplicas, *advisory lock* do Postgres ou *single-flight*).
   - `refreshAfterWrite`, que renova antes de vencer e entrega o valor antigo enquanto isso.
   - Nunca o mesmo TTL para todas as chaves.
7. **Testes:** as regras em `*ServiceImplTest`. Locks e constraints precisam de Postgres real, ou seja, Testcontainers, com a exceção aprovada no ADR único da política de testes.

**Critérios de aceite:**

- [ ] Duas vendas simultâneas que somadas passam da posição: uma é recusada.
- [ ] Dois "fechar mês" simultâneos geram um fechamento só.
- [ ] Reenviar o mesmo POST com a mesma chave não cria um segundo registro.
- [ ] Com o provedor de IA lento, o pool de conexões não esgota e o resto do sistema continua respondendo.
- [ ] Ao expirar uma chave muito acessada, o banco recebe uma consulta, não uma por requisição.

**Depende de:** SPEC-03. A parte de cache distribuído depende da SPEC-08; a outbox é a base da SPEC-19.

**Prazo estimado:** 15 a 18 dias úteis (120 a 144 horas).
