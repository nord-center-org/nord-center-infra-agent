# SPEC-17 — Borda: proxy reverso, CDN, WAF, rate limit e captcha

| Campo | Valor |
|---|---|
| ID | SPEC-17 |
| Tipo | implementacao |
| Prioridade | P1 |
| Plano | pendente |
| Responsável pela spec | zzNICK |
| Bloqueada por | — |
| Depende de | nada para a primeira versão na frente do Railway. O rate limit por usuário usa o Postgres, já decidido. Na SPEC-07, o proxy vira o Ingress/Gateway do cluster. |
| Origem | NordTool — Plano de specs (26/11/2026), seção SPEC-17 |

Proteção de borda (proxy reverso, CDN, WAF, rate limit e captcha), começando pelo Cloudflare na frente do Railway.

Detalhes em [spec.md](spec.md). **Ainda sem plano de implementação.** Quem pegar esta spec monta primeiro o `plano.md`, o `decisoes.md` com as perguntas ao responsável e o `contexto/`, pelos modelos de [templates/spec/](../../templates/spec/), e pede a aprovação antes de qualquer código ([policies/specs.md](../../policies/specs.md), seção 3).

## Etapas

<!-- Etapas definidas no plano de implementação. Status: planejada, bloqueada, em-andamento, concluida ou descartada. Reserve com scripts/specs/specs.mjs pegar. -->

| Etapa | Título | Repositórios | Status | Responsável | Branch | PRs | Desde |
|---|---|---|---|---|---|---|---|
