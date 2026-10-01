---
name: nord-tool-scripts-sql-postgres
description: Design and review PostgreSQL-specific schema or data operations in nord-tool-scripts-sql.
---

# SQL: PostgreSQL

1. Siga o `AGENTS.md` do repositório SQL para carregar o perfil, os steerings e as policies globais. Consulte especialmente a [arquitetura SQL](../../../steering/nord-tool-scripts-sql/architecture.md), os [padrões de escrita](../../../steering/nord-tool-scripts-sql/coding-standards.md), a [validação](../../../steering/nord-tool-scripts-sql/testing.md) e a [segurança](../../../steering/nord-tool-scripts-sql/security.md).
2. Antes de escolher sintaxe específica, confirme a versão do PostgreSQL, o schema alvo e como o runner executará os arquivos listados.
3. Considere os dois estados do schema: instalação nova e base existente. Use `IF EXISTS`/`IF NOT EXISTS` quando suportados; nos comandos sem essas cláusulas, verifique explicitamente o estado antes de alterar. Não presuma que toda forma de `ALTER TABLE` aceita uma cláusula de existência.
4. Para uma tabela existente, mantenha a alteração no DDL de origem; crie um novo arquivo DDL somente quando a funcionalidade introduzir uma tabela nova. Siga a nomenclatura e as constraints permitidas definidas na arquitetura; não crie constraints `CHECK`.
5. Baseie tipos, constraints e índices nos dados e consultas reais. Considere filtros, cardinalidade, locks e custo de alteração em tabelas existentes; não crie índices compostos sem uma consulta que justifique as colunas e sua ordem.
6. Use transações somente quando forem compatíveis com o runner e com os comandos PostgreSQL envolvidos. Confira dependências e efeitos parciais em caso de falha.
7. Não inclua credenciais em scripts, exemplos ou logs. Para operações destrutivas, conversões ou mudanças irreversíveis, avalie o impacto e defina backup e recuperação antes de executar.
8. Faça revisão estática sempre. Se houver um banco seguro configurado, a execução pode ser usada para validar o resultado, mas sua ausência não bloqueia a alteração; registre quando a execução não ocorreu.
