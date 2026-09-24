# SQL: alterar schema ou dados

1. Leia `projects/nord-tool-scripts-sql.md` e `steering/nord-tool-scripts-sql/`.
2. Inspecione o schema e scripts existentes, dependências e ordem do `filelist.txt`.
3. Crie incremento numerado na pasta/convenção DDL ou DML apropriada; não reescreva histórico aplicado.
4. Avalie compatibilidade com backend, índices, constraints, volume e reversibilidade.
5. Valide sintaxe e execução em ambiente seguro, se disponível; nunca execute mudanças destrutivas em produção.
6. Siga o fluxo global de Git: commit na branch de trabalho e merge somente em `develop` após validações.
