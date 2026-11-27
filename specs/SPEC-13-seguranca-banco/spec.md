# SPEC-13 — Spec

> Copiado do plano de origem ("NordTool — Plano de specs", 26/11/2026). A situação atual ainda não foi conferida no código: confira antes de escrever o plano de implementação (policies/specs.md, seção 3).

**O que é:** Banco acessível só pelo backend, usuários com mínimo privilégio, TLS e RLS por usuário dentro da conta.

**No MVP:** os itens 1 a 3 entram no MVP (item 3). O RLS foi antecipado para a SPEC-21, aplicado por conta; aqui fica só o RLS por usuário dentro da conta.

**Origem:** L-63 (banco aceitando só o IP do backend); L-64 (RLS em todas as tabelas).

**Depende de:** SPEC-11 (backup antes de mexer em permissões). Os itens 1 a 3 não dependem de mais nada e são P0. O item 4 (RLS) é P2 e combina com a SPEC-09, já que o contexto define o dono de cada tabela.

**Prazo estimado:** 10 a 14 dias úteis (80 a 112 horas):

**Detalhe técnico fora da documentação aberta.** Situação atual, achados, o que fazer e critérios de aceite desta spec descrevem pontos fracos do sistema e não ficam neste repositório (SPEC-24, item 4). A fonte é o plano de origem, com o responsável pela spec, até existir o repositório restrito.
