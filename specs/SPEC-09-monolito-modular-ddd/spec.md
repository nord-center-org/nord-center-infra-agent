# SPEC-09 — Spec

> Copiado do plano de origem ("NordTool — Plano de specs", 26/11/2026). A situação atual ainda não foi conferida no código: confira antes de escrever o plano de implementação (policies/specs.md, seção 3).

**No MVP:** fica para a evolução, logo depois do MVP. Os módulos novos do MVP (Contas e Assinaturas) já nascem no formato modular, e o mapa de contextos ganha esses dois contextos.

**Origem:** I-7 ("refatoração do design system da aplicação, aplicando tudo em DDD"); L-28 (EDD), L-29 (arquitetura monolítica modular), L-33 (refatoração completa para DDD, com um loop de revisão da estrutura).

**O que é:** reorganizar o código por domínio de negócio (bounded contexts) em vez de por camada técnica. As regras passam a morar em entidades e objetos de valor do domínio, com a persistência isolada atrás de interfaces. A refatoração é incremental, um contexto por vez, sem mudar comportamento.

**Interpretação:** "design system" foi lido como o desenho do sistema (a arquitetura), e isso foi confirmado. A lista de prioridades detalha a ideia: monólito modular (L-29), DDD com loop de revisão (L-33) e EDD (L-28). O item 5 do "O que fazer" mantém a organização do front e os componentes base de UI dentro da mesma refatoração.

**Situação atual:**

- O backend tem 517 classes organizadas por camada: `controller` (67), `service` (107), `dto` (98), `repository` (70), `form` (67), `domain` (66). Para mexer no Financeiro, a pessoa passa por seis pacotes diferentes.
- As regras ficam nos `*ServiceImpl` por exigência da política de testes (só eles são testados). Isso conflita diretamente com o DDD, que coloca regra na entidade.
- O app mistura dois mundos: ferramentas de obra (vistoria, termos, chaves, cronograma, medição, mapeamento, escadinha) e gestão pessoal (financeiro, caixinha, casamento, treinos). São candidatos naturais a contextos separados.
- O front também está por tipo (`pages`, `components`, `services`, `utils`). Já existe um começo de design system visual (`components/ui/CabecalhoPagina`, `docs/PADRAO_VISUAL.md`).

**Contextos propostos (a validar com o time):**

| Contexto | Inclui hoje |
| --- | --- |
| Identidade e acesso | usuário, perfil, permissões, sessão, cadastro, avatar |
| Obras | obra, fases, empresas, cargos, colaboradores, ferramentas |
| Vistoria e entrega | apartamentos, vistorias, termos de reprova e fotos, controle de chaves |
| Planejamento | cronograma semanal, equipe e pessoal, medições, escadinha |
| Registro de campo | mapeamentos, relatório fotográfico |
| Finanças pessoais | financeiro (lançamentos, conta do mês, investimentos), caixinha |
| Vida pessoal | casamento, treinos |
| Assistente | Lugia, Davi Job, integrações |
| Núcleo compartilhado | segurança, armazenamento, erros, correlação, relógio |

**O que fazer:**

1. **Atualizar as regras antes do código.** Hoje a política de testes e o `coding-standards.md` (interfaces em `service/`, regra só no `ServiceImpl`) impedem o DDD. Registrar um ADR e reescrever as steerings para permitir:
   - teste de entidades e objetos de valor do domínio;
   - a nova estrutura de pacotes;
   - a verificação de fronteiras entre módulos.
2. **Estrutura alvo por contexto:** `br.com.nord_tool_backend.<contexto>.api` (controllers, forms, DTOs), `.aplicacao` (casos de uso, o atual `ServiceImpl`), `.dominio` (entidades, objetos de valor como `Dinheiro`, `Competencia` e `Email`, regras e interfaces de repositório) e `.infraestrutura` (JDBC, queries, providers).
3. **Fronteiras verificadas** com Spring Modulith (ou ArchUnit). Um contexto só acessa outro pela API pública dele, e a violação falha o build.
4. **Migração incremental.** Um piloto num contexto pequeno (Vida pessoal ou Caixinha), depois Finanças pessoais, depois os de obra. Cada contexto é uma série de PRs dentro do limite da SPEC-01, sem mudança de rota ou contrato; as guardas de segurança e a cobertura seguem verdes.
5. **Front e design system visual.** Pastas por contexto (`src/react-app/modulos/<contexto>/`) com páginas, componentes, serviços e utils próprios. Uma camada `ui/` com os componentes base: botão, campo, cartão, modal, tabela com `ColumnFilter` e cabeçalho. As cores e tamanhos do `PADRAO_VISUAL.md` viram tokens no tema do Tailwind, em vez de classes repetidas.
6. **Banco (opcional):** um schema do Postgres por contexto, só se houver ganho claro; não é pré-requisito.

**O que fazer — itens da lista de prioridades:**

- **Monólito modular (L-29).** O sistema continua sendo um único deploy, mas cada contexto vira um módulo com API pública (fachada em `.api`) e interior escondido:
  - Spring Modulith verifica no build que nenhum módulo acessa o interior de outro (`ApplicationModules.verify()`).
  - Gera a documentação dos módulos e diagramas C4, que alimentam a SPEC-14.
  - Separar um módulo em serviço próprio só se, um dia, a carga ou o time pedirem.
- **EDD (L-28), interpretado como Event-Driven Design.** Módulos conversam por eventos de domínio (ex.: `LancamentoCriado`, `MesFechado`, `TermoReprovado`) em vez de chamadas diretas. O registro de publicação de eventos do Spring Modulith guarda os eventos no banco e reentrega em caso de falha, o mesmo papel da *outbox* da SPEC-15, e prepara a SPEC-19. Se "EDD" quis dizer *Eval-Driven Development* (avaliar agentes de IA com casos de teste antes de mudar prompts), o item vai para a SPEC-02.
- **Loop de revisão da estrutura (L-33).** Uma steering `arquitetura-alvo.md` descreve a estrutura esperada. Para cada contexto, o ciclo é:
  1. O Planejador compara o que existe com o alvo.
  2. O Executor migra em partes de 500 linhas.
  3. O Revisor confere contra a steering, e o build roda o `verify` do Modulith e as regras de dependência da SPEC-05.
  4. Se algo falhar, volta ao Executor.

  O contexto só é dado como migrado quando a verificação passa sem exceções. Essas regras viram *fitness functions* permanentes no CI, para a arquitetura não degradar depois.

**Critérios de aceite:**

- [ ] ADR e steerings atualizados antes do primeiro PR de código.
- [ ] Contexto piloto migrado, com fronteiras verificadas no build e sem nenhuma mudança de contrato da API.
- [ ] Mapa de contextos validado pelo time e registrado na infra.
- [ ] No front, o piloto em `modulos/` usa só componentes de `ui/`.

**Depende de:** SPEC-03 (Spring Boot novo, que o Spring Modulith exige), SPEC-01 (tamanho de PR e ADR da política de testes). Começa logo depois do MVP comercial (onda A), com a SPEC-03 já concluída no MVP. Os módulos vendidos são os primeiros a migrar. O item 5 (front) fica para depois da SPEC-05, para a reorganização das pastas ter testes protegendo.

**Prazo estimado:** 60 a 80 dias úteis (480 a 640 horas):

- backend, todos os contextos: 50 a 65 dias (400 a 520 horas), com o contexto piloto em 10 a 12 dias (80 a 96 horas);
- front: 10 a 15 dias (80 a 120 horas).
