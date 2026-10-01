---
name: nord-tool-scripts-sql-bug-fix
description: Diagnose and fix defects in nord-tool-scripts-sql scripts, filelist execution, or persisted data.
---

# SQL: corrigir script ou dados

1. Siga as instruções do `AGENTS.md` do repositório SQL para carregar o perfil, os steerings do projeto e as policies globais. Consulte o [perfil SQL](../../../projects/nord-tool-scripts-sql.md), a [arquitetura](../../../steering/nord-tool-scripts-sql/architecture.md), os [padrões de escrita](../../../steering/nord-tool-scripts-sql/coding-standards.md), a [validação](../../../steering/nord-tool-scripts-sql/testing.md), a [segurança](../../../steering/nord-tool-scripts-sql/security.md) e o [fluxo Git SQL](../../../steering/nord-tool-scripts-sql/git-workflow.md).
2. Localize a causa do defeito no script DDL/DML, no `filelist.txt`, no runner, no estado do banco ou em um consumidor do backend. Confira o erro e os dados relevantes sem expor credenciais ou informações sensíveis.
3. Se o defeito afeta uma tabela existente, corrija incrementalmente o DDL de origem dessa tabela, inclusive para alterações de colunas, e mantenha o `CREATE TABLE` alinhado ao schema desejado. Não crie um arquivo novo apenas para `ALTER TABLE` nem crie outra tabela como contorno do defeito.
4. Crie um novo arquivo DDL numerado somente se a correção realmente introduzir uma tabela nova. Nomeie o arquivo pela tabela/funcionalidade e use um nome de tabela em `snake_case` sem preposições, conforme a arquitetura SQL.
5. Para defeitos de dados, corrija o DML apropriado e torne a operação repetível segura quando necessário. Atualize o `filelist.txt` somente com os caminhos que devem rodar para aplicar a correção, na ordem das dependências.
6. Avalie os dados existentes e os consumidores do backend. Antes de uma operação destrutiva ou conversão, defina a estratégia de recuperação exigida pelo steering de segurança.
7. Faça revisão estática sempre. Se houver um banco seguro configurado, execute e confira a correção; a ausência desse banco não bloqueia a alteração nem sua aprovação. Registre quando a execução em banco não foi realizada.
8. Siga as policies globais de Git e reporte a causa, os arquivos alterados e as verificações realmente executadas.
