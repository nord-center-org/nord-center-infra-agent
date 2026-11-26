# Catálogo de specs

Specs do plano de evolução do NordTool ("NordTool — Plano de specs (implementações e correções)", de 26/11/2026). As regras estão em [policies/specs.md](../policies/specs.md) e os modelos em [templates/spec/](../templates/spec/).

Antes de começar qualquer trabalho de uma spec, confira aqui o status e, na ficha da spec, o status de cada etapa. Uma etapa concluída aparece como implementada ou corrigida; não refaça. Para reservar uma etapa, use `node scripts/specs/specs.mjs pegar`.

| ID | Spec | Tipo | Prioridade | No MVP | Status | Pasta |
|---|---|---|---|---|---|---|
| SPEC-01 | Regras dos agentes de IA, programação incremental e autonomia progressiva | implementacao | P0 | item 2 (etapas E01–E04) | planejada | [SPEC-01-regras-agentes](SPEC-01-regras-agentes/README.md) |
| SPEC-02 | Subagentes especializados, orquestração e Lugia via MCP | implementacao | P2 | não | planejada | [SPEC-02-subagentes](SPEC-02-subagentes/README.md) |
| SPEC-03 | Java 21, Spring Boot 4 e vulnerabilidades bloqueantes | correcao | P0 | item 8 (completa) | planejada | — |
| SPEC-04 | Segurança da aplicação: OWASP, configurações e containers | correcao | P0 | item 6 (parcial) | planejada | — |
| SPEC-05 | Testes e quality gates (front e back) | implementacao | P1 | não | planejada | — |
| SPEC-06 | Observabilidade | implementacao | P1 | item 12 (parcial) | planejada | — |
| SPEC-07 | Kubernetes em VPS, novo deploy e saída do Railway | implementacao | P2 | não | planejada | — |
| SPEC-08 | Balanceamento de carga, escalabilidade e testes de carga | implementacao | P2 | não | planejada | — |
| SPEC-09 | Arquitetura: monólito modular com DDD | implementacao | P0 da evolução | não | planejada | — |
| SPEC-10 | Provedores de IA chineses | implementacao | P3 | não | planejada | — |
| SPEC-11 | Backup e recuperação do banco | implementacao | P0 | item 1 (completa) | planejada | — |
| SPEC-12 | Autenticação: senhas, 2FA e sessão JWT | implementacao | P0 | item 10 (itens 1, 2 e 4) | planejada | — |
| SPEC-13 | Segurança do banco: acesso por IP, usuário mínimo e RLS | correcao | P0 / P2 | item 4 (itens 1 a 3) | planejada | — |
| SPEC-14 | Contratos da API: OpenAPI, payloads e erros | implementacao | P1 | item 11 (base) | planejada | — |
| SPEC-15 | Concorrência, consistência e cache | correcao | P1 | não | planejada | — |
| SPEC-16 | Documentação técnica e collections | implementacao | — | não | incorporada | — |
| SPEC-17 | Borda: proxy reverso, CDN, WAF, rate limit e captcha | implementacao | P1 | item 5 (primeira versão) | planejada | — |
| SPEC-18 | Banco escalável: índices, réplicas, particionamento e CQRS | implementacao | P3 | não | planejada | — |
| SPEC-19 | Processamento assíncrono e filas | implementacao | P3 | não | planejada | — |
| SPEC-20 | Privacidade e LGPD | implementacao | P1 | item 13 (parcial) | planejada | — |
| SPEC-21 | Multi-tenancy: isolamento por empresa cliente | implementacao | MVP | item 9 | planejada | — |
| SPEC-22 | Assinaturas: planos, cobrança, cancelamento e segurança | implementacao | MVP | item 14 | planejada | — |
| SPEC-23 | Plano gratuito: 15 minutos de uso por dia | implementacao | MVP | item 15 | planejada | — |
| SPEC-24 | Documentação das funcionalidades no padrão SDD | implementacao | MVP / P1 | item 3 (estrutura e módulos do MVP) | planejada | — |

- `Status` segue [policies/specs.md](../policies/specs.md), seção 2. O CI recusa um status diferente do calculado pelas etapas; `node scripts/specs/specs.mjs catalogo` corrige a coluna.
- `Tipo` foi classificado ao criar o catálogo e pode ser revisto antes da primeira etapa da spec começar.
- A SPEC-16 foi incorporada à SPEC-14 no plano; o ID não é reaproveitado.
- O item 7 do MVP (ambiente de produção separado, com release de `master` aprovada por pessoa) não tem spec própria e segue [policies/release.md](../policies/release.md).
- Para uma spec nova, acrescente uma linha com o próximo ID livre.
