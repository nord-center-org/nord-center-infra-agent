# Projeto: nord-tool-scripts-sql

- Repositório irmão: `../nord-tool-scripts-sql`.
- Repositório canônico: `nord-center-org/nord-tool-scripts-sql`.
- Propósito: scripts PostgreSQL de estrutura e dados consumidos pelo `nord-tool-backend`.
- Stack: PostgreSQL; execução por shell/Git Bash através de `./executa-sql.sh`.
- O runner exige `DATABASE_URL`, cria o schema `nord_tool` se necessário e executa todos os caminhos listados em `filelist.txt`, na ordem; interrompe ao primeiro erro SQL.

## Convenções essenciais

- Separe definição de estrutura (`DDL`) e manipulação de dados (`DML`) conforme as pastas existentes.
- Para uma tabela existente, mantenha alterações estruturais incrementais em seu DDL de origem; não crie arquivo novo apenas para `ALTER TABLE`. Crie DDL numerado somente para uma tabela realmente nova.
- Nomeie novas tabelas em minúsculas e `snake_case`, sem preposições; por exemplo, `requisicao_controle`, não `requisicao_de_controle`. Preserve os nomes legados.
- Numere novos arquivos em ordem crescente conforme a sequência do projeto.
- Liste em `filelist.txt` somente os caminhos que devem rodar naquela execução, em ordem de dependência.

Os detalhes de DDL/DML, reexecução segura, nomenclatura de colunas, constraints, índices e compatibilidade estão na [arquitetura SQL](../steering/nord-tool-scripts-sql/architecture.md) e nos [padrões de escrita](../steering/nord-tool-scripts-sql/coding-standards.md).

## Instruções para agentes

Leia o `AGENTS.md` do repositório consumidor e selecione a skill adequada:

- [Feature SQL](../skills/nord-tool-scripts-sql/feature/SKILL.md) para mudanças de schema ou dados.
- [Correção SQL](../skills/nord-tool-scripts-sql/bug-fix/SKILL.md) para defeitos em scripts, execução ou dados.
- [PostgreSQL](../skills/nord-tool-scripts-sql/postgres/SKILL.md) para tarefas que exijam orientação específica do banco.

Consulte também os steerings de [segurança](../steering/nord-tool-scripts-sql/security.md), [validação](../steering/nord-tool-scripts-sql/testing.md) e [fluxo Git](../steering/nord-tool-scripts-sql/git-workflow.md), além das policies globais aplicáveis.

## Segurança e validação

- Forneça credenciais por variáveis de ambiente ou secret manager; nunca as inclua em scripts, commits, logs ou relatórios.
- Confirme banco e ambiente alvo antes da execução e defina recuperação para operações destrutivas ou conversões.
- Faça revisão estática sempre. A execução em banco local, temporário ou de teste é opcional e sua indisponibilidade não bloqueia a alteração nem sua aprovação; registre quando não foi realizada.
