# SQL: corrigir script ou dados

1. Leia o perfil e steering de SQL; confirme o script, a ordem e o ambiente alvo.
2. Determine se o defeito está no script, no `filelist.txt` ou no estado do banco.
3. Não edite migrações que já possam ter sido aplicadas sem avaliar impacto; prefira novo incremento corretivo.
4. Valide idempotência quando necessária, dependências e efeitos em dados existentes.
5. Não execute operação destrutiva sem estratégia de recuperação e autorização do fluxo.
6. Siga as policies globais de Git e reporte ambiente/verificações utilizados.
