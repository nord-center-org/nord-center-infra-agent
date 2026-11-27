# SPEC-19 — Spec

> Copiado do plano de origem ("NordTool — Plano de specs", 26/11/2026). A situação atual ainda não foi conferida no código: confira antes de escrever o plano de implementação (policies/specs.md, seção 3).

**No MVP:** fica para a evolução. Os webhooks da SPEC-22 já usam uma fila simples no Postgres, e os e-mails de cobrança podem passar a usá-la.

**Origem:** L-12 (ver a necessidade de processamento assíncrono para tarefas demoradas como e-mail, notificação e geração ou exportação de relatório, com filas como RabbitMQ ou SQS); L-20 (DLQ); L-22 (poison message).

**O que é:** tirar da requisição do usuário o trabalho que demora ou que depende de serviço externo. A tarefa vai para uma fila, processada por um *worker* com retry, e as que falham sempre vão para uma fila de mensagens mortas (DLQ) em vez de travar as outras. A própria lista diz "ver necessidade", então a spec começa medindo e só adota um broker se os números justificarem.

**Situação atual:**

- O e-mail (cadastro e redefinição de senha) é enviado por SMTP dentro da requisição, com timeouts de 10 s: um Gmail lento deixa o usuário esperando.
- PDFs e planilhas são gerados no navegador (`pdf-lib`, `xlsx`), então não pesam no servidor.
- O modo agente da Lugia roda tarefas longas e responde por SSE na própria requisição.
- Não há fila nem worker. As candidatas futuras são a exportação de dados da SPEC-20, os avisos da SPEC-12 e a importação de proventos.

**O que fazer:**

1. **Medir antes (SPEC-06).** Listar endpoints com p95 acima de 1 a 2 s e chamadas externas dentro da requisição. Cada candidata vira uma linha: tarefa, tempo atual, volume e impacto.
2. **Primeira versão sem infraestrutura nova.** Uma fila no próprio Postgres, a partir da *outbox* da SPEC-15 ou do registro de eventos do Spring Modulith (SPEC-09):
   - workers leem com `SELECT … FOR UPDATE SKIP LOCKED`, ou com uma biblioteca como db-scheduler ou JobRunr;
   - começar pelo e-mail, que é simples e dá ganho imediato.
3. **Broker dedicado só quando necessário:** RabbitMQ no cluster, ou gerenciado, porque SQS só faz sentido na AWS e a SPEC-07 aponta para VPS. Gatilhos: volume alto, vários consumidores ou necessidade de roteamento.
4. **Consumidores idempotentes.** Filas entregam "pelo menos uma vez", então o mesmo evento pode chegar duas vezes. Cada mensagem leva um id único, e o consumidor registra o que já processou (SPEC-15).
5. **Retry e DLQ (L-20).** Novas tentativas com backoff exponencial e limite (ex.: 5). Depois disso, a mensagem vai para a DLQ com o erro e o histórico de tentativas. Ferramenta de reprocessar ou descartar, com registro de quem fez.
6. **Poison message (L-22).** A mensagem que falha sempre, por formato inválido ou por apontar para registro apagado, tem de sair da fila rápido e não bloquear as de trás:
   - validar o formato ao consumir;
   - erro não recuperável vai direto para a DLQ, sem gastar retries;
   - contador de tentativas por mensagem;
   - nunca reprocessar em loop infinito.
7. **Status para o usuário.** Tarefa longa devolve um id de *job*; o front consulta o status ou recebe aviso quando terminar. Isso pode responder ao item "WebHook no front" do backlog, se a ideia era notificação em tempo real.
8. **Métricas e alertas:** tamanho da fila, idade da mensagem mais antiga, taxa de falha e itens na DLQ (SPEC-06).

**Critérios de aceite:**

- [ ] O cadastro responde sem esperar o SMTP, e o e-mail chega pela fila.
- [ ] Com o SMTP fora do ar, as mensagens acumulam, são reenviadas quando ele volta e nenhuma se perde.
- [ ] Uma mensagem malformada vai para a DLQ sem atrasar as outras, e dá para reprocessar pela ferramenta.
- [ ] A mesma mensagem entregue duas vezes produz um único efeito.

**Depende de:** SPEC-15 (outbox e idempotência) e SPEC-06 (medição). O broker dedicado depende da SPEC-07.

**Prazo estimado:** 10 a 14 dias úteis (80 a 112 horas) com a fila no Postgres. Mais 4 dias (32 horas) se um broker dedicado for necessário.
