# SQL: fluxo Git

Use a policy global: trabalhar a partir de `develop`, criar branch dedicada, validar, commitar nessa branch e integrar somente em `develop`. `master` é a branch protegida que espelha produção; promoção para ela ocorre por fluxo de release separado. `main`, se existir, não é destino automático. Preserve ordem e histórico dos incrementos.
