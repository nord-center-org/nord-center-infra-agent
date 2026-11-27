# SPEC-03 — Spec

> Copiado do plano de origem ("NordTool — Plano de specs", 26/11/2026). A situação atual ainda não foi conferida no código: confira antes de escrever o plano de implementação (policies/specs.md, seção 3).

**No MVP:** entra inteira (item 7), para não vender sobre uma versão sem correções de segurança.

**Origem:** I-1 ("ajustar as vulnerabilidades e deixá-las obrigatórias, colocando no Java 21, mesmo vale para o front"); parte de I-6 (dependências do front); L-60 e L-61 (atualizar todas as dependências e bibliotecas do back, incluindo o Java, e do front).

**O que é:** levar backend e frontend para versões com suporte de segurança. Depois disso, o scan de vulnerabilidades deixa de só alertar e passa a bloquear merge e deploy. As duas coisas andam juntas: hoje o scan não bloqueia justamente porque a versão do Spring tem CVEs sem correção.

**Situação atual:**

- Backend em Java 11 e Spring Boot 2.7.18, linha sem suporte open source. Spring Boot 4.0 encerra o suporte OSS em 31/12/2026 e 4.1 vai até cerca de julho de 2027 ([HeroDevs](https://www.herodevs.com/blog-posts/spring-boot-versions-eol-dates-and-latest-releases-april-2026), [Dan Vega](https://www.danvega.dev/blog/spring-boot-end-of-life)).
- `pipeline-dev.yml`: OSV-Scanner e Trivy rodam com `continue-on-error` e só no push para `develop`, nunca no PR. O comentário no arquivo dá o motivo: a linha 2.7 tem CVEs conhecidas sem correção.
- `dependabot.yml` bloqueia upgrades minor e major do Spring Boot e do jjwt, e prende as imagens Docker no Java 11.
- Frontend: o `dockerfile` usa Node 20 (fora de suporte) enquanto o CI usa Node 22. O build usa `npm install` em vez de `npm ci`. A imagem `nginx:alpine` não tem digest fixo e roda como root. O `npm audit` só alerta e o front não tem Dependabot.
- O front carrega resíduos do template Mocha que não são usados: `hono`, `@hono/zod-validator`, `@getmocha/*`, scripts com `wrangler`, nome `mocha-app` no `package.json`, e favicon e metatags apontando para `static.getmocha.com`.
- O pacote `xlsx@0.18.5` do npm foi abandonado pelo SheetJS e tem vulnerabilidades conhecidas. As versões corrigidas só são distribuídas pelo CDN do próprio SheetJS.

**O que fazer — backend:**

1. **Java 21 + Spring Boot 4.1.x** (decisão confirmada; usar a 4.x mais recente na data do início). O caminho é 2.7 para 3.5 para 4.x, com receitas do OpenRewrite e um PR por etapa (SPEC-01 limita o tamanho). Principais quebras:
   - `javax.*` vira `jakarta.*`.
   - Spring Security passa a ter só `SecurityFilterChain`; revisar o `SecurityConfig` e o `JwtAuthenticationFilter`.
   - `springdoc-openapi-ui` vira `springdoc-openapi-starter-webmvc-ui` na versão compatível.
   - jjwt 0.11 vai para 0.12+, que muda `parserBuilder` e `signWith`.
   - Jackson 3 no Boot 4.
   - `spring.mvc.pathmatch.matching-strategy: ant_path_matcher` não existe mais; as rotas que dependem dele precisam ser ajustadas.
2. Tirar os overrides de Kotlin e OkHttp do `pom.xml` se a versão nova do SDK da Anthropic não precisar mais deles.
3. Atualizar o `Dockerfile` (imagens temurin 21 por digest), o CI (`java-version: 21`), o `targetJdk` do PMD, o `dependabot.yml` e o `AGENTS.md`/steering que mandam preservar Java 11.
4. Avaliar virtual threads (`spring.threads.virtual.enabled`) para o SSE da Lugia e as chamadas externas. É opcional e só entra depois de medir (SPEC-08).

**O que fazer — frontend:**

1. Node 24 LTS no `dockerfile` e no CI (mesma versão nos dois), `npm ci` no build, `nginx` por digest com imagem *unprivileged* (não root).
2. Remover os resíduos do Mocha (dependências, scripts, metatags, favicon) e o domínio `static.getmocha.com` da CSP; usar ícones próprios.
3. Trocar `xlsx@0.18.5` pela versão atual do SheetJS (tarball do CDN oficial, fixado no lockfile) ou por outra biblioteca mantida, como `exceljs`.
4. Atualizar todas as dependências (L-61), começando pelas com major atrasado (Vite, Tailwind, ESLint) em PRs separados.
5. Criar `.github/dependabot.yml` no front: npm, docker e github-actions, semanal, para `develop`.

**O que fazer — gates obrigatórios (back e front):**

1. OSV, `npm audit --omit=dev` e Trivy passam a bloquear para severidade HIGH e CRITICAL com correção disponível. Isso significa remover o `continue-on-error` e incluir os jobs no Resumo de Alertas como bloqueantes.
2. Rodar os scans também no PR, não só no push.
3. Exceções só por arquivo versionado (`osv-scanner.toml`, `.trivyignore`). Cada exceção leva CVE, justificativa e data de expiração; vencida, volta a bloquear.

**Critérios de aceite:**

- [ ] Backend compila e passa `mvn verify` (cobertura de 90%), PMD e SpotBugs em Java 21 e Spring Boot 4.x.
- [ ] As guardas `RotasProtegidasGuardTest` e `ContratoSegurancaGuardTest` continuam verdes.
- [ ] Front sem nenhuma dependência do Mocha, com `xlsx` substituído e build em Node 24.
- [ ] OSV, Trivy e `npm audit` bloqueiam PR e deploy; o pipeline atual roda limpo ou só com exceções documentadas e com prazo.

**Depende de:** SPEC-01 (tamanho de PR). Deve vir antes das SPEC-04, 06, 07, 09, 12, 14 e 15, que já assumem a versão nova.

**Prazo estimado:** 11 a 16 dias úteis (88 a 128 horas): cerca de 8 a 12 dias no backend e 3 a 4 no front.
