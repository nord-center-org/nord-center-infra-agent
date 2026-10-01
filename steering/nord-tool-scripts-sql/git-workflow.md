# SQL: fluxo Git

Siga o [fluxo Git global](../../policies/git-workflow.md) para branches, validações, commits e integração. Este documento registra apenas os cuidados específicos do repositório SQL.

## Revisão de mudanças SQL

**Padrão vigente**

- Revise em conjunto os scripts DDL/DML da alteração e a atualização correspondente do `filelist.txt`.
- Inclua no `filelist.txt` somente os caminhos necessários para aquela execução, na ordem correta de dependência.
- Confira o diff para garantir que os scripts e caminhos adicionados correspondem ao escopo da mudança e não incluem arquivos SQL que não precisam rodar.
- Preserve a numeração e a ordem existentes; numere novos arquivos seguindo a sequência crescente do projeto.
- Confirme que os DDLs seguem o padrão do arquivo de origem da tabela e que os scripts continuam seguros para reexecução, conforme [architecture.md](architecture.md).

## Integração

Branches, validações exigidas, commits, destino de integração e restrições de publicação são definidos pela policy global. Não mantenha regras locais duplicadas ou divergentes neste documento.
