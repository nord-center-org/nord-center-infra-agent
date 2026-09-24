# Projeto: nord-tool-scripts-sql

- Repositório irmão: `../nord-tool-scripts-sql`.
- Propósito: scripts incrementais de banco para o `nord-tool-backend`.
- Stack observada: PostgreSQL e shell/Git Bash para execução.
- Instruções específicas: `skills/nord-tool-scripts-sql/` e `steering/nord-tool-scripts-sql/`.

## Convenções documentadas no projeto

- Numere scripts incrementais para explicitar ordem e dependências (por exemplo, `01.nome_ddl.sql`).
- Separe scripts de definição de estrutura (`DDL`) e manipulação de dados (`DML`) segundo as pastas/convenções existentes.
- Atualize `filelist.txt` na ordem correta quando o fluxo de execução exigir.
- O README recomenda executar `./executa-sql.sh` no Git Bash e requer atenção ao formato de fim de linha LF.
- Confirme sempre a estrutura e o runner atuais antes de adicionar scripts.

## Segurança

- Não coloque senhas reais em `.pgpass`, scripts, exemplos ou commits. Use placeholders em documentação e arquivos de credenciais locais protegidos.
- Confirme banco e ambiente alvo antes de qualquer operação destrutiva.
