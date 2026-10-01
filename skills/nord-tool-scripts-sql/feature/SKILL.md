---
name: nord-tool-scripts-sql-feature
description: Plan and implement PostgreSQL schema or data changes in nord-tool-scripts-sql, including coordination with backend consumers.
---

# SQL: implementar uma funcionalidade

1. Siga as instruções do `AGENTS.md` do repositório SQL para carregar o perfil, os steerings do projeto e as policies globais. Consulte também o [perfil SQL](../../../projects/nord-tool-scripts-sql.md), a [arquitetura](../../../steering/nord-tool-scripts-sql/architecture.md), os [padrões de escrita](../../../steering/nord-tool-scripts-sql/coding-standards.md), a [validação](../../../steering/nord-tool-scripts-sql/testing.md), a [segurança](../../../steering/nord-tool-scripts-sql/security.md), o [fluxo Git SQL](../../../steering/nord-tool-scripts-sql/git-workflow.md) e a [policy global de permissões](../../../policies/permissions.md).
2. Inspecione o schema, os DDLs/DMLs de origem, o `filelist.txt`, o runner e os consumidores do backend afetados antes de escolher os arquivos a alterar.
3. Separe mudanças estruturais de mudanças de dados. Se a tabela já existe, faça a alteração incrementalmente no DDL de origem — inclusive para novos campos —, atualize o `CREATE TABLE` quando a definição mudar e proteja as operações para bases novas e existentes. Não crie um arquivo novo apenas para `ALTER TABLE` nem outra tabela para abrigar uma alteração. Crie um novo DDL numerado somente quando a funcionalidade introduzir uma tabela realmente nova; nomeie o arquivo com base na tabela/funcionalidade.
4. Aplique as convenções de nomenclatura, integridade e índices dos steerings. Para novas tabelas, use nomes compostos em `snake_case`, sem preposições, como `requisicao_controle` em vez de `requisicao_de_controle`. Não crie constraints `CHECK`; regras de negócio pertencem ao backend.
5. Atualize o `filelist.txt` com somente os caminhos que devem rodar nessa execução, na ordem de dependência. Revise se cada caminho existe e se o runner executará apenas os scripts pretendidos.
6. Faça a revisão estática. Se houver um banco seguro configurado, execute os scripts e confira o resultado. A execução em banco é opcional e não bloqueia a alteração nem sua aprovação; se não ocorrer, registre que a execução não foi validada.
7. Coordene mudanças no contrato dos dados com os consumidores do backend e siga as [policies globais](../../../policies/git-workflow.md) para o fluxo Git.
