# Backend: validação e política obrigatória de testes

## Escopo permitido da suíte automatizada

- Testes automatizados do backend devem cobrir somente classes de implementação `*ServiceImpl`. O arquivo de teste deve se chamar `<NomeDaClasse>Test`, por exemplo `FinanceiroServiceImplTest`.
- Teste os métodos públicos do `ServiceImpl` e concentre a cobertura em regras de negócio, validação, autorização decidida no serviço, idempotência, transições de estado, resultados e erros esperados, além das interações relevantes com as dependências.
- Use JUnit 5 e Mockito. Instancie a implementação sob teste com dependências simuladas; não simule a própria classe testada. Injete `Clock` controlável quando a regra depender de tempo.
- Mantenha os testes determinísticos, isolados e rápidos. Não dependa de banco de dados, rede, contexto Spring, estado global ou relógio real.

## Categorias proibidas para novos testes

- Não crie testes automatizados para controllers/endpoints, DTOs, forms, entidades, repositories, handlers, configuração, filtros/cadeia de segurança, utilitários, mapeadores ou testes de integração.
- Não use `@WebMvcTest`, `@SpringBootTest`, banco de teste ou ferramenta de teste HTTP para contornar essa regra.
- Se a mudança ocorrer fora de um `ServiceImpl` e não puder ser observada por um caso de uso de serviço, não crie uma nova categoria de teste. Registre a lacuna e descreva uma verificação manual reproduzível, especialmente para configuração HTTP e infraestrutura de segurança.

## Exceção fechada: guardas de segurança

A política acima tem uma única exceção, para impedir regressões de autenticação e autorização que nenhum `ServiceImpl` consegue observar. São permitidas **exatamente** estas duas classes, em `src/test/java/br/com/nord_tool_backend/guard/`:

- `RotasProtegidasGuardTest`: varre todos os `@RestController` e garante que toda rota exige autenticação, exceto a allowlist pública (`POST /api/v1/nord-tool/auth/login` e os endpoints de health).
- `ContratoSegurancaGuardTest`: garante `401` sem token e com token inválido ou expirado, `403` sem permissão e corpo de erro sem detalhes internos (stack trace, SQL, nome de classe).

Regras da exceção:

- Somente essas duas classes podem usar `@WebMvcTest`. Nenhuma outra classe pode ser criada em `guard/` sem alterar esta política.
- Elas verificam o contrato de segurança, não regras de negócio. Não acrescente nelas casos de controller, DTO ou fluxo funcional.
- Classes de apoio sem `@Test` (fixtures, builders, dados de exemplo) ficam em `src/test/java/br/com/nord_tool_backend/support/` e são permitidas.
- Ao criar ou alterar rota pública, atualize a allowlist de `RotasProtegidasGuardTest` no mesmo PR e justifique a rota na descrição.

## Suíte legada e execução

- A regra vale para todo teste novo ou alterado. Testes já existentes fora do padrão são legados; não os apague incidentalmente durante uma feature ou correção. Uma migração que os remova deve ser uma tarefa explícita, revisar o que deixará de ser verificado e atualizar o gate Maven para impedir o retorno dessas categorias.
- Comandos Maven documentados: `mvn clean`, `mvn install` e `mvn test`. Execute apenas os comandos solicitados ou pertinentes à alteração; `mvn test` executará também os testes legados enquanto eles continuarem no repositório.
- Informe quais comandos e testes foram executados, quais falharam e quais lacunas foram verificadas manualmente. Nunca afirme uma validação que não ocorreu.
