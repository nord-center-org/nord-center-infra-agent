# SQL: validação

## Revisão estática

**Padrão vigente:** toda alteração SQL deve passar por revisão estática, mesmo quando não houver um banco disponível para execução. Confira:

- se todos os caminhos do `filelist.txt` existem e estão na ordem de dependência correta;
- se os scripts consideram os objetos e dados existentes e podem ser executados novamente com segurança;
- se os DDLs mantêm o `CREATE TABLE` de origem alinhado às alterações incrementais;
- se os inserts repetíveis usam `ON CONFLICT` com uma chave única apropriada;
- se o runner e os comandos usados são compatíveis com o PostgreSQL alvo.

A revisão estática não comprova que os scripts executam corretamente no banco.

## Execução em banco

**Recomendado quando houver ambiente seguro disponível; não é pré-requisito para concluir ou aprovar a alteração.**

- Use uma base local, temporária ou de teste com PostgreSQL compatível com o projeto.
- O runner requer `DATABASE_URL`; não presuma que a pessoa ou o agente tenha um banco local configurado.
- Confirme a conexão e o banco alvo antes de executar. Não use produção para testes.
- Execute os caminhos do `filelist.txt` e confira o schema e os dados resultantes. Quando viável, execute novamente para verificar a reexecução segura.

Se não houver conexão disponível, continue a revisão e o fluxo de aprovação com a validação estática. Registre que a execução em banco não foi feita; não declare o comportamento de execução como validado. A indisponibilidade de banco, por si só, não bloqueia a alteração nem sua aprovação.

## Pipeline e aplicação no Railway

- O `.github/workflows/pipeline.yml` roda no PR para `develop` a **Validação SQL** (caminhos do `filelist.txt` existentes e parse dos SQL alterados com SQLFluff) e o **Secret Scanning** (Gitleaks nos commits novos). As duas precisam passar antes do merge. O parse confere a sintaxe, não a execução no banco.
- No merge em `develop`, se o merge alterou `DDL/`, `DML/`, `filelist.txt` ou `executa-sql.sh` e a validação passou, o job **Aplicar no Railway (develop)** executa o `executa-sql.sh` no banco de desenvolvimento (secret `DATABASE_URL` do environment `dev`) e lista no resumo do run os scripts aplicados. Sem essas alterações, o job é pulado.
- Mesclar em `develop` aplica, portanto, **todo o `filelist.txt`** no banco de desenvolvimento do Railway. Antes do merge, confira que ele lista só o que deve rodar e que cada script pode ser reexecutado com segurança. Uma falha nesse job deixa o banco no ponto em que o script parou; corrija com um novo PR.
- O run do Actions é o registro de que as alterações chegaram ao banco. O serviço Postgres do Railway fica sem auto-deploy pelo GitHub; não o religue, senão cada merge reinicia o banco e roda os scripts fora do pipeline.

## Registro do resultado

Ao reportar a validação, diferencie claramente:

- **Revisão estática:** arquivos e verificações examinados sem executar SQL no banco.
- **Execução em banco:** scripts executados em ambiente identificado, com o resultado observado.

O README documenta o uso de `./executa-sql.sh` e `filelist.txt` via Git Bash. Consulte-o e confira o runner atual antes de executar os scripts.
