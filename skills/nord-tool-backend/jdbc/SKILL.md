# Backend: JDBC e persistência

- Verifique se o módulo usa JDBC, Spring Data JPA ou SQL nativo antes de escolher a abordagem.
- Use parâmetros vinculados; nunca concatene entrada em SQL.
- Respeite limites transacionais e padrões de conexão/recursos do Spring.
- Avalie índices, cardinalidade e consultas N+1; não altere schemas sem coordenar o repositório SQL.
- Não exponha credenciais em código, logs ou documentação.
