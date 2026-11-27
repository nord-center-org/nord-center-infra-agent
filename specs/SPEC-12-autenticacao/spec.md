# SPEC-12 — Spec

> Copiado do plano de origem ("NordTool — Plano de specs", 26/11/2026). A situação atual ainda não foi conferida no código: confira antes de escrever o plano de implementação (policies/specs.md, seção 3).

**O que é:** Autenticação do NordTool: política de senhas, verificação em duas etapas e revisão da sessão.

**No MVP:** os itens 1, 2 e 4 entram no MVP (item 9): senha forte, 2FA para administradores da conta e do backoffice, e bloqueio de login no Postgres. A sessão em cookie (item 3) vem na evolução.

**Origem:** L-36 (5 tentativas, bloqueio de 15 min, estado compartilhado), L-43 e L-59 (2FA), L-44 (revisão do JWT), L-52 (senhas fortes), L-54 (token curto e nada exposto no navegador); SPEC-04 item 3 (token em `sessionStorage`), movido para cá.

**Depende de:** SPEC-03 (Spring Security novo). O store do item 4 já está decidido: Postgres.

**Prazo estimado:** 9 a 12 dias úteis (72 a 96 horas).

**Detalhe técnico fora da documentação aberta.** Situação atual, achados, o que fazer e critérios de aceite desta spec descrevem pontos fracos do sistema e não ficam neste repositório (SPEC-24, item 4). A fonte é o plano de origem, com o responsável pela spec, até existir o repositório restrito.
