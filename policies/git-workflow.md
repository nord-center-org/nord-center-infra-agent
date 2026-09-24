# Fluxo Git global

Esta policy vale para todos os repositórios consumidores, independentemente de stack.

1. Confirme o repositório e leia seu perfil, steering e skills específicas antes de editar.
2. Atualize a referência `develop` e crie uma branch de trabalho dedicada a partir dela.
3. Inspecione o estado e preserve alterações existentes que não pertençam à solicitação.
4. Revise o diff e execute as verificações indicadas pelo steering do projeto.
5. Crie o commit na branch de trabalho. Após verificações aprovadas e sem conflitos, integre somente em `develop`.
6. Nunca escreva, commite ou faça merge automaticamente em `main`, `master` ou outra branch.
7. Se `develop` não existir, houver conflito ou as verificações falharem, pare e reporte sem redirecionar a operação.
