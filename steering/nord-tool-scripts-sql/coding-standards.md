# SQL: padrões de escrita

Este documento define convenções práticas de escrita para os scripts SQL. As decisões de arquitetura e schema estão em [architecture.md](architecture.md).

## Nomes e numeração de arquivos

**Padrão vigente**

- Use nomes no formato `NN.nome_descritivo_ddl.sql` ou `NN.nome_descritivo_dml.sql`, conforme o tipo do script e o padrão existente.
- Numere novos arquivos em ordem crescente, seguindo a sequência existente. Não renumere arquivos existentes sem avaliar impactos na ordem de execução e nos ambientes.
- Crie um novo arquivo DDL apenas quando a funcionalidade introduzir uma tabela realmente nova; nomeie-o com base na tabela/funcionalidade.
- Para uma tabela existente, mantenha as alterações incrementais em seu DDL de origem, inclusive novos campos. Não crie arquivos separados para `ALTER` nem outra tabela apenas para abrigar uma alteração.

## Formatação SQL

**Padrão vigente**

- Escreva palavras-chave SQL em maiúsculas e nomes de tabelas e colunas em minúsculas.
- Use `snake_case` para nomes novos de tabelas e colunas, conforme a convenção de prefixos e exemplos de `architecture.md`.
- Em nomes de novas tabelas compostos, use `_` entre termos e não inclua preposições como `de`, `do` ou `da`; por exemplo, `requisicao_controle` em vez de `requisicao_de_controle`.
- Formate listas de colunas, constraints e valores em linhas separadas quando o comando tiver múltiplos itens, com indentação consistente.
- Coloque cada comando SQL em bloco legível e finalize-o com ponto e vírgula.
- Evite `SELECT *` em lógica persistente; selecione somente as colunas necessárias.
- Preserve os padrões existentes para nomes numerados de constraints e índices, como `PK_`, `FK01_`, `UK01_` e `IDX01_`.

## Reexecução segura

**Padrão vigente**

- Em DDL, use `IF EXISTS` ou `IF NOT EXISTS` quando o comando oferecer a cláusula apropriada.
- Se o comando não oferecer uma cláusula de proteção, verifique explicitamente o estado do objeto — por exemplo, em `information_schema` ou nos catálogos do PostgreSQL — e execute a alteração somente quando necessária.
- Considere os estados de instalação nova e de banco existente. A operação incremental deve levar o banco existente à definição esperada sem falhar quando for executada novamente.
- Em inserts DML que possam se repetir, use `ON CONFLICT` com a chave única correspondente ao registro.
- Não use `ON CONFLICT` como substituto para verificações de DDL; cada mecanismo deve proteger o tipo de operação correspondente.

## Constraints `CHECK` legadas

**Padrão vigente:** não crie constraints `CHECK`; regras de negócio e estados válidos são responsabilidade do backend.

**Legado a preservar e limpar:** quando um banco existente ainda tiver uma `CHECK` antiga que precise ser removida, faça a remoção de forma protegida, por exemplo com `DROP CONSTRAINT IF EXISTS`. Não recrie a constraint.

## `filelist.txt` e finais de linha

**Padrão vigente**

- Mantenha um caminho relativo por linha em `filelist.txt`, usando caminhos válidos a partir da raiz do repositório.
- Liste somente os scripts que devem rodar naquela execução e coloque-os na ordem de dependência.
- Use finais de linha LF nos arquivos lidos pelo shell, incluindo `executa-sql.sh` e `filelist.txt`.

Consulte `architecture.md` para os critérios de seleção e execução dos scripts, dependências, responsabilidades de DDL/DML e compatibilidade do schema.
