# SQL: padrões

- Use incremento numerado com nome descritivo e sufixo correspondente (`ddl`/`dml`), conforme convenção do projeto.
- Mantenha LF nos arquivos consumidos pelo script shell quando necessário.
- Formate SQL de modo legível, qualifique objetos se isso seguir o padrão e evite `SELECT *` em lógica persistente.
- Não reordene nem renumere histórico sem avaliar impactos no runner e nos ambientes.
