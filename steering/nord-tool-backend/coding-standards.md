# Backend: padrões de código

- Mantenha compatibilidade com Java 11 e dependências existentes.
- Siga convenções de nomes, organização de pacotes e tratamento de erros já presentes.
- Valide entrada HTTP com mecanismos Spring existentes e use logs sem segredos ou dados sensíveis.
- Evite dependências e refatorações não relacionadas ao pedido.

## Serviços: interface `*Service` e implementação `*ServiceImpl`

- Todo tipo com sufixo `Service` é uma **interface**. Nunca crie classe concreta com sufixo `Service`.
- A implementação se chama `<Nome>ServiceImpl`, é anotada com `@Service` e implementa `<Nome>Service`. Exemplo: `FinanceiroService` → `FinanceiroServiceImpl`.
- Quando houver mais de uma implementação da mesma interface (estratégia por provedor), use `<Nome><Variante>ServiceImpl`. Exemplo: `ArmazenamentoService` → `ArmazenamentoPostgresServiceImpl`, `ArmazenamentoS3ServiceImpl`.
- Local: interfaces em `service/` e implementações em `service/impl/`. Infraestrutura de segurança e de armazenamento mantém interface e implementação juntas no próprio pacote (`security/`, `storage/`), com a mesma regra de nomes.
- Controllers, filtros e outros serviços dependem da **interface**, nunca da `*ServiceImpl`.
- Regra de negócio fica em `*ServiceImpl`, porque é a única classe com teste automatizado permitido (`steering/nord-tool-backend/testing.md`). O teste se chama `<NomeDaImplementacao>Test` e precisa de uma classe com esse nome em `src/main`.

## Classes de apoio que não são serviço

- Não use o sufixo `Service` para o que não é serviço. Sufixos aceitos:
  - `*Calculator`: funções puras de cálculo, sem estado e sem I/O, chamadas por um `*ServiceImpl`;
  - `*Provider` / `*Client`: adaptadores de integração externa (HTTP, APIs de terceiros), atrás de uma interface;
  - `*Repository` / `*RepositoryImpl`: persistência;
  - `*Validador`, `*Handler`, `*Builder`: apoio já existente no projeto.
- Essas classes não têm teste próprio. O comportamento delas é verificado pelo `*ServiceImplTest` do serviço que as usa, com as dependências de I/O (provider, repository, `Clock`) simuladas.

## Injeção de dependências

- Somente por construtor (`@RequiredArgsConstructor` com campos `final`, ou construtor explícito). Não use `@Autowired` em campo.
