# SPEC-05 — Spec

> Copiado do plano de origem ("NordTool — Plano de specs", 26/11/2026). A situação atual ainda não foi conferida no código: confira antes de escrever o plano de implementação (policies/specs.md, seção 3).

**No MVP:** fica para a evolução. A guarda de isolamento entre contas (SPEC-21) e os testes de cobrança (SPEC-22) já entram no MVP.

**Origem:** I-5 ("testes replicados para o front"); R (quality gates, automatizar processos, escrever mais testes); L-32 (novos conceitos de quality gate: carga, complexidade ciclomática, estrutura de dependências, cobertura); L-47 (testes com isolamento).

**O que é:** levar para o front a mesma disciplina que o backend já tem: política escrita do que se testa, script que verifica a política, cobertura mínima bloqueante e análise estática bloqueante. Depois, somar testes de componente e um smoke E2E, que hoje não existem.

**Situação atual:**

- **Backend (referência):** testes só em `*ServiceImpl`, cobertura mínima de 90% das linhas pelo JaCoCo, `verificar-politica-testes.sh`, e PMD e SpotBugs bloqueantes no PR.
- **Front:** cerca de 65 testes de funções puras em `utils/` com `node --test`. Os arquivos estão listados à mão no script `test` do `package.json`, então um teste novo não listado simplesmente não roda.
- O front não mede cobertura e não tem teste de componente, de hook, de `apiClient` nem E2E. O único gate é o ESLint, sem regra de acessibilidade, embora o `PADRAO_VISUAL.md` traga regras de a11y.

**O que fazer:**

1. **Runner.** Migrar para Vitest (nativo do Vite) com descoberta por glob (`**/*.test.ts(x)`) e eliminar a lista manual. Os testes atuais de `node:test` migram quase sem mudança. Ambiente `jsdom` + Testing Library para componentes; MSW para simular a API.
2. **Política (espelho do backend).** Reescrever `steering/nord-tool-frontend/testing.md` definindo:
   - regra de negócio fica em `utils/` e é obrigatoriamente testada (equivale ao `ServiceImpl`);
   - `services/` (`apiClient`, tratamento de 401/409/500) e hooks de sessão e sincronização otimista têm teste;
   - componentes só nos fluxos críticos (login, `RotaProtegida`, permissões do menu, formulários do Financeiro).
3. **Script de política.** Criar `scripts/verificar-politica-testes.mjs`: todo arquivo em `utils/` tem o `.test.ts` correspondente, e nenhum teste fora dos padrões permitidos.
4. **Cobertura bloqueante.** Thresholds no Vitest de 90% das linhas em `utils/**` e `services/**`; o CI falha abaixo disso. Mesma regra do back: não baixar o mínimo nem ampliar exclusões.
5. **Análise estática.** Job `tsc --noEmit` separado, ESLint com `--max-warnings 0`, `eslint-plugin-jsx-a11y` e uma regra que proíbe `dangerouslySetInnerHTML` sem sanitização (SPEC-04).
6. **Smoke E2E (fase 2).** Playwright com a API simulada: login, menu conforme permissão, um fluxo por módulo principal e checagem de acessibilidade com axe. Roda no merge em `develop`, não no PR, para manter o PR rápido.
7. **Orçamento de bundle.** Falhar o build se o chunk inicial passar de um limite a definir; three.js e pdfjs pesam e devem carregar sob demanda.

**O que fazer — quality gates novos, back e front (L-32):**

- **Complexidade ciclomática:** regras PMD `CyclomaticComplexity` e `CognitiveComplexity` com limite por método no back, e `complexity` do ESLint no front. Bloqueiam só código novo ou alterado, para não travar o legado.
- **Estrutura de dependências:** sem ciclos entre pacotes e camadas respeitadas, com Spring Modulith ou ArchUnit no back (SPEC-09) e `eslint-plugin-boundaries` ou `dependency-cruiser` no front.
- **Duplicação:** CPD (do PMD) no back e `jscpd` no front, com limite.
- **Cobertura:** mantém os 90% do back e adota os 90% do front (item 4), com a cobertura de branches também bloqueando nas classes alteradas.
- **Carga:** o resultado do teste da SPEC-08 entra como gate de release (não de PR); regressão acima do limite bloqueia a promoção para `master`.
- **Painel único:** avaliar SonarQube ou SonarCloud, já recomendado no README do backend, para juntar todos esses números num quality gate só, por PR.

**O que fazer — testes com isolamento (L-47):**

- Cada teste prepara e limpa o próprio estado, roda em qualquer ordem e em paralelo. No Vitest, ordem aleatória ligada.
- O back já é isolado: mocks, sem banco nem rede, `Clock` controlado.
- Os testes que precisarem de Postgres (SPEC-13 e 15) usam Testcontainers com banco descartável por execução e transação desfeita ao fim de cada teste.
- No front, MSW por teste e nenhum estado global compartilhado entre arquivos.

**Critérios de aceite:**

- [ ] `npm test` descobre os testes sozinho; nenhum arquivo listado à mão.
- [ ] Cobertura abaixo do mínimo, `utils` sem teste, erro de tipo ou warning de lint falham o PR.
- [ ] Resumo de cobertura no `GITHUB_STEP_SUMMARY`, como no backend.
- [ ] Smoke E2E verde no merge em `develop`.

**Depende de:** SPEC-03 (Node e Vite atualizados).

**Decidido (backend):** a política do backend proíbe teste de integração, então as queries SQL dos arquivos `query/*.properties` nunca são executadas em teste. Aprovado no ADR único da política de testes, como exceção fechada igual às guardas: testes de repository com Testcontainers + Postgres aplicando os scripts do `nord-tool-scripts-sql`. Isso pega erro de SQL antes do deploy.

**Prazo estimado:** 15 a 20 dias úteis (120 a 160 horas).
