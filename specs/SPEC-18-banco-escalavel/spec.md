# SPEC-18 — Spec

> Copiado do plano de origem ("NordTool — Plano de specs", 26/11/2026). A situação atual ainda não foi conferida no código: confira antes de escrever o plano de implementação (policies/specs.md, seção 3).

**No MVP:** fica para a evolução. Os índices compostos com `id_conta` já entram com a SPEC-21.

**Origem:** L-13 (réplicas de leitura com um banco "master" para escrita e um "slave" para consulta, particionamento, índices e otimização de consultas); L-14 (revisar se o CQRS está sendo seguido na separação de leitura e escrita).

**O que é:** preparar o banco para volume maior, do mais barato para o mais caro: medir, indexar, otimizar consultas e, só quando os números pedirem, adicionar réplica de leitura e particionar tabelas grandes. O CQRS entra como regra de organização: leitura e escrita por caminhos separados. Isso permite mandar as leituras para a réplica sem reescrever o sistema.

**Situação atual:**

- Um único Postgres, com pool de 10 conexões por instância. As queries ficam em `query/*.properties`, executadas com `NamedParameterJdbcTemplate`.
- Já existe um começo de CQRS: os controllers são separados em `controller/read` e `controller/write`. Falta conferir se services e repositories seguem a mesma separação e se algum GET grava algo.
- Existiu uma branch de índices (`fix/IndicesToDev`) no repositório de scripts, mas não há monitoramento de consultas lentas.
- Arquivos em `BYTEA` incham tabelas e backups (sai na SPEC-07 item 9).

**O que fazer (em ordem):**

1. **Medir.** Ligar `pg_stat_statements` e `auto_explain` (consultas acima de um limite, ex.: 200 ms) e montar um painel das consultas mais caras na SPEC-06.
2. **Índices.** Para as consultas do topo, `EXPLAIN ANALYZE` e índices compostos que batem com os filtros reais, por exemplo lançamentos por pessoa e mês. Criar com `CREATE INDEX CONCURRENTLY` nos scripts do `nord-tool-scripts-sql`. Remover os índices nunca usados (`pg_stat_user_indexes`).
3. **Otimizar consultas:**
   - eliminar N+1 nos services e trocar `SELECT *` por colunas usadas (casa com a SPEC-14);
   - paginação por chave (*keyset*) nas listas grandes;
   - nenhuma coluna `BYTEA` em consulta de listagem.
4. **CQRS (L-14).** Formalizar a separação que já começa nos controllers:
   - **Comandos** (escrita): passam pelo caso de uso em transação no banco principal.
   - **Consultas** (leitura): têm services e queries próprios, com DTOs de projeção, sempre em `@Transactional(readOnly = true)`.
   - Nada de *event sourcing*: seria complexidade sem ganho aqui.
   - Verificar que nenhum GET grava e registrar a regra na steering da SPEC-01 e na estrutura da SPEC-09.
5. **Réplica de leitura (L-13)**, quando o banco principal virar gargalo medido:
   - Escrita no primário; leitura na réplica, roteada por `AbstractRoutingDataSource` conforme a transação seja `readOnly`.
   - **Atraso de replicação:** depois de uma escrita, as leituras daquele usuário vão ao primário por alguns segundos, e telas críticas (saldo, conta do mês) leem sempre do primário.
   - No Kubernetes da SPEC-07, o operador CloudNativePG gerencia primário, réplicas, *failover* e backup para object storage, o que também atende a SPEC-11.
6. **Particionamento**, só para tabelas que crescem sem parar e têm data como chave natural: mensagens da Lugia, histórico de vistoria, auditoria e logs. Usar particionamento declarativo por intervalo de data, com `pg_partman` criando as partições e o expurgo da SPEC-20 apagando partições antigas. Aplicar quando a tabela passar de um tamanho combinado.
7. **Pool de conexões** dimensionado com o número de réplicas da aplicação, ou PgBouncer (SPEC-08).

**Critérios de aceite:**

- [ ] Painel das consultas mais caras ativo; as 10 piores têm plano analisado e ação registrada.
- [ ] Nenhum GET grava no banco, e todas as leituras rodam em transação `readOnly`.
- [ ] Quando houver réplica: leituras roteadas e nenhum caso de "salvei e não apareceu" nas telas críticas.
- [ ] O p95 das telas principais melhorou, medido antes e depois.

**Depende de:** SPEC-06 (medição). Réplica e particionamento dependem da SPEC-07 e da carga medida na SPEC-08. Os itens 1 a 4 são baratos e podem ser antecipados.

**Prazo estimado:** 13 dias úteis (104 horas) para medição, índices, consultas e CQRS. Mais 6 dias (48 horas) se a réplica de leitura e o particionamento forem necessários, num total de até 19 dias (152 horas).
