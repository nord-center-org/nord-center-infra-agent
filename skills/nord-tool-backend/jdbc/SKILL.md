# Backend: JDBC e persistência

- O backend usa Spring JDBC com `NamedParameterJdbcTemplate`; confirme o `pom.xml` e os repositories relacionados antes de alterar a persistência.
- Use parâmetros vinculados; nunca concatene entrada em SQL.
- Respeite limites transacionais e padrões de conexão/recursos do Spring.
- Avalie índices, cardinalidade e consultas N+1; não altere schemas sem coordenar o repositório SQL.
- Não exponha credenciais em código, logs ou documentação.
