# SQL: PostgreSQL

- Confirme a versão e o schema alvo no projeto antes de usar recursos específicos do PostgreSQL.
- Use constraints e tipos adequados; considere índices e impacto de locks em tabelas existentes.
- Use transações quando compatíveis com o script e com o runner.
- Nunca grave credenciais em SQL, exemplos ou logs.
- Para `DROP`, truncamento ou alteração irreversível, pare e apresente o impacto antes da execução.
