# SPEC-04 — Spec

> Copiado do plano de origem ("NordTool — Plano de specs", 26/11/2026). A situação atual ainda não foi conferida no código: confira antes de escrever o plano de implementação (policies/specs.md, seção 3).

**O que é:** Auditoria das configurações de segurança da aplicação (OWASP Top 10, headers, containers e tratamento de entradas), transformada em checklist versionado e correções.

**No MVP:** os itens 1 e 2 e os achados 12, 13, 15 e 17 entram no MVP (item 5). Com clientes pagantes, o acesso indevido entre contas (IDOR, categoria A01 do OWASP) vira o risco número um; a guarda da SPEC-21 já cobre isso.

**Origem:** I-1.1; I-6 (segurança do front, parte de configuração); R ("autenticar o próprio serviço sem usar terceiros"); L-7, 21, 35, 38, 39, 42, 46 e 53. A parte de login, senha e sessão foi para a SPEC-12.

**Depende de:** SPEC-03 (versões novas, Mocha removido).

**Prazo estimado:** 8 a 10 dias úteis (64 a 80 horas). Cerca de 4 dias (32 horas) são as correções diretas da onda 0; o restante entra na onda 2.

**Detalhe técnico fora da documentação aberta.** Situação atual, achados, o que fazer e critérios de aceite desta spec descrevem pontos fracos do sistema e não ficam neste repositório (SPEC-24, item 4). A fonte é o plano de origem, com o responsável pela spec, até existir o repositório restrito.
