# SPEC-17 — Spec

> Copiado do plano de origem ("NordTool — Plano de specs", 26/11/2026). A situação atual ainda não foi conferida no código: confira antes de escrever o plano de implementação (policies/specs.md, seção 3).

**O que é:** Proteção de borda (proxy reverso, CDN, WAF, rate limit e captcha), começando pelo Cloudflare na frente do Railway.

**No MVP:** a primeira versão, com o Cloudflare, entra no MVP (item 4), junto com o captcha usado no cadastro e no checkout. Na evolução, o rate limit passa a ser por conta e por plano.

**Origem:** L-11 (CDN), L-15 (rate limiting por usuário), L-40 (bloquear IPs suspeitos), L-41 (WAF), L-45 (proxy reverso com NGINX), L-51 (rate limit global, captcha após N falhas, IP confiável), L-55 (avaliar Cloudflare).

**Depende de:** nada para a primeira versão na frente do Railway. O rate limit por usuário usa o Postgres, já decidido. Na SPEC-07, o proxy vira o Ingress/Gateway do cluster.

**Prazo estimado:** 6 a 8 dias úteis (48 a 64 horas) com o Cloudflare, cerca de 2 dias (16 horas) deles na onda 0. Se precisar do plano B auto-hospedado: 10 a 13 dias (80 a 104 horas).

**Detalhe técnico fora da documentação aberta.** Situação atual, achados, o que fazer e critérios de aceite desta spec descrevem pontos fracos do sistema e não ficam neste repositório (SPEC-24, item 4). A fonte é o plano de origem, com o responsável pela spec, até existir o repositório restrito.
