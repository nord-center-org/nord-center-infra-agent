# Todas as specs do NordTool

Painel de todas as specs do plano de evolução ("NordTool — Plano de specs (implementações e correções)", de 26/11/2026), com a situação e o progresso de cada uma. Cada spec tem a sua pasta, com a ficha (`README.md`) e a spec (`spec.md`); quando começa, ganha também plano, decisões e contexto. As regras estão em [policies/specs.md](../policies/specs.md).

<!-- resumo:inicio -->
**Progresso geral:** 🟢 0 concluídas · 🟡 9 em aberto · 🔴 14 bloqueadas · ⚪ 1 fora do plano. Etapas: 0 de 20 concluídas, 0 em andamento.
<!-- resumo:fim -->

| Sinal | Situação | Significa |
|---|---|---|
| 🟢 | Concluída | todas as etapas entregues; aparece como implementada ou corrigida. Não refaça |
| 🟡 | Em aberto | pode ser trabalhada: tem etapas livres ou em andamento (veja o progresso e a ficha) |
| 🔴 | Bloqueada | espera as specs indicadas entre parênteses (campo "Bloqueada por" da ficha) ou todas as etapas abertas estão bloqueadas |
| ⚪ | Incorporada ou descartada | fora do plano |

| ID | Spec | Tipo | Prioridade | No MVP | Situação | Progresso | Pasta |
|---|---|---|---|---|---|---|---|
| SPEC-01 | Regras dos agentes de IA, programação incremental e autonomia progressiva | implementacao | P0 | item 2 (etapas E01–E04) | 🟡 Em aberto | ▱▱▱▱▱▱▱▱▱▱ 0/10 | [SPEC-01-regras-agentes](SPEC-01-regras-agentes/README.md) |
| SPEC-02 | Subagentes especializados, orquestração e Lugia via MCP | implementacao | P2 | não | 🟡 Em aberto | ▱▱▱▱▱▱▱▱▱▱ 0/10 | [SPEC-02-subagentes](SPEC-02-subagentes/README.md) |
| SPEC-03 | Java 21, Spring Boot 4 e vulnerabilidades bloqueantes | correcao | P0 | item 8 (completa) | 🟡 Em aberto | sem plano | [SPEC-03-plataforma-java21](SPEC-03-plataforma-java21/README.md) |
| SPEC-04 | Segurança da aplicação: OWASP, configurações e containers | correcao | P0 | item 6 (parcial) | 🟡 Em aberto | sem plano | [SPEC-04-seguranca-aplicacao](SPEC-04-seguranca-aplicacao/README.md) |
| SPEC-05 | Testes e quality gates (front e back) | implementacao | P1 | não | 🔴 Bloqueada (SPEC-03) | sem plano | [SPEC-05-testes-quality-gates](SPEC-05-testes-quality-gates/README.md) |
| SPEC-06 | Observabilidade | implementacao | P1 | item 12 (parcial) | 🔴 Bloqueada (SPEC-03) | sem plano | [SPEC-06-observabilidade](SPEC-06-observabilidade/README.md) |
| SPEC-07 | Kubernetes em VPS, novo deploy e saída do Railway | implementacao | P2 | não | 🔴 Bloqueada (SPEC-03, SPEC-04, SPEC-06, SPEC-11) | sem plano | [SPEC-07-kubernetes-vps](SPEC-07-kubernetes-vps/README.md) |
| SPEC-08 | Balanceamento de carga, escalabilidade e testes de carga | implementacao | P2 | não | 🔴 Bloqueada (SPEC-06, SPEC-07) | sem plano | [SPEC-08-escalabilidade](SPEC-08-escalabilidade/README.md) |
| SPEC-09 | Arquitetura: monólito modular com DDD | implementacao | P0 da evolução | não | 🔴 Bloqueada (SPEC-03) | sem plano | [SPEC-09-monolito-modular-ddd](SPEC-09-monolito-modular-ddd/README.md) |
| SPEC-10 | Provedores de IA chineses | implementacao | P3 | não | 🟡 Em aberto | sem plano | [SPEC-10-provedores-ia-chineses](SPEC-10-provedores-ia-chineses/README.md) |
| SPEC-11 | Backup e recuperação do banco | implementacao | P0 | item 1 (completa) | 🟡 Em aberto | sem plano | [SPEC-11-backup-recuperacao](SPEC-11-backup-recuperacao/README.md) |
| SPEC-12 | Autenticação: senhas, 2FA e sessão JWT | implementacao | P0 | item 10 (itens 1, 2 e 4) | 🔴 Bloqueada (SPEC-03) | sem plano | [SPEC-12-autenticacao](SPEC-12-autenticacao/README.md) |
| SPEC-13 | Segurança do banco: acesso por IP, usuário mínimo e RLS | correcao | P0 / P2 | item 4 (itens 1 a 3) | 🔴 Bloqueada (SPEC-11) | sem plano | [SPEC-13-seguranca-banco](SPEC-13-seguranca-banco/README.md) |
| SPEC-14 | Contratos da API: OpenAPI, payloads e erros | implementacao | P1 | item 11 (base) | 🔴 Bloqueada (SPEC-03) | sem plano | [SPEC-14-contratos-api](SPEC-14-contratos-api/README.md) |
| SPEC-15 | Concorrência, consistência e cache | correcao | P1 | não | 🔴 Bloqueada (SPEC-03) | sem plano | [SPEC-15-concorrencia-cache](SPEC-15-concorrencia-cache/README.md) |
| SPEC-16 | Documentação técnica e collections (incorporada à SPEC-14) | implementacao | — | não | ⚪ Incorporada | — | — |
| SPEC-17 | Borda: proxy reverso, CDN, WAF, rate limit e captcha | implementacao | P1 | item 5 (primeira versão) | 🟡 Em aberto | sem plano | [SPEC-17-borda](SPEC-17-borda/README.md) |
| SPEC-18 | Banco escalável: índices, réplicas, particionamento e CQRS | implementacao | P3 | não | 🔴 Bloqueada (SPEC-06) | sem plano | [SPEC-18-banco-escalavel](SPEC-18-banco-escalavel/README.md) |
| SPEC-19 | Processamento assíncrono e filas | implementacao | P3 | não | 🔴 Bloqueada (SPEC-06, SPEC-15) | sem plano | [SPEC-19-assincrono-filas](SPEC-19-assincrono-filas/README.md) |
| SPEC-20 | Privacidade e LGPD | implementacao | P1 | item 13 (parcial) | 🟡 Em aberto | sem plano | [SPEC-20-privacidade-lgpd](SPEC-20-privacidade-lgpd/README.md) |
| SPEC-21 | Multi-tenancy: isolamento por empresa cliente | implementacao | MVP | item 9 | 🔴 Bloqueada (SPEC-03, SPEC-11) | sem plano | [SPEC-21-multi-tenancy](SPEC-21-multi-tenancy/README.md) |
| SPEC-22 | Assinaturas: planos, cobrança, cancelamento e segurança | implementacao | MVP | item 14 | 🔴 Bloqueada (SPEC-21) | sem plano | [SPEC-22-assinaturas](SPEC-22-assinaturas/README.md) |
| SPEC-23 | Plano gratuito: 15 minutos de uso por dia | implementacao | MVP | item 15 | 🔴 Bloqueada (SPEC-21, SPEC-22) | sem plano | [SPEC-23-plano-gratuito](SPEC-23-plano-gratuito/README.md) |
| SPEC-24 | Documentação das funcionalidades no padrão SDD | implementacao | MVP / P1 | item 3 (estrutura e módulos do MVP) | 🟡 Em aberto | sem plano | [SPEC-24-documentacao-sdd](SPEC-24-documentacao-sdd/README.md) |

## Como a situação muda

- **Ninguém edita Situação, Progresso nem o resumo à mão.** Eles vêm das etapas de cada ficha. Ao reservar (`pegar`) ou concluir (`concluir`) uma etapa, o script já atualiza este arquivo; depois de qualquer outra mudança numa ficha, rode `node scripts/specs/specs.mjs catalogo`.
- **Quando o dev conclui a última etapa de uma spec,** ela passa sozinha para 🟢 Concluída neste arquivo, e as specs que esperavam por ela saem de 🔴 Bloqueada. O CI (workflow `Specs`) recusa o PR se este arquivo não estiver igual ao que as fichas dizem.
- **Progresso** é a barra das etapas concluídas sobre o total (descartadas fora da conta); "sem plano" quer dizer que as etapas ainda não foram definidas.
- `Tipo` foi classificado ao criar o painel e pode ser revisto antes da primeira etapa da spec começar.
- A SPEC-16 foi incorporada à SPEC-14 no plano; o ID não é reaproveitado.
- O item 7 do MVP (ambiente de produção separado, com release de `master` aprovada por pessoa) não tem spec própria e segue [policies/release.md](../policies/release.md).
- Para uma spec nova, acrescente uma linha com o próximo ID livre e crie a pasta pelos modelos de [templates/spec/](../templates/spec/).
