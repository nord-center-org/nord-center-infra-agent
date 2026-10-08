# Backend: Java e Spring

- Preserve Java 11 e Spring Boot 2.7.15 salvo solicitação explícita de migração.
- Siga o desenho existente entre controller, service e repository; evite lógica de negócio em controllers.
- Use forms/DTOs e validação nas fronteiras HTTP; não exponha diretamente modelos de persistência ou projections sem seguir o contrato existente.
- Trate erros sem revelar stack traces, credenciais ou dados pessoais.
- Consulte `pom.xml` antes de propor dependências e valide com Maven.
- Política obrigatória de testes: crie e mantenha testes automatizados somente para classes `*ServiceImpl`, com classes de teste nomeadas `*ServiceImplTest`. Exercite os métodos públicos da implementação e cubra regras de negócio, validação, autorização aplicada no serviço, erros e interações relevantes com dependências.
- Não crie testes automatizados para controllers, DTOs/forms, entidades, repositories, handlers, configuração, filtros de segurança, utilitários ou outras classes. Não use `@WebMvcTest`, `@SpringBootTest` nem testes de integração para ampliar a suíte. Se uma mudança não puder ser verificada por um teste de `*ServiceImpl`, registre a lacuna e descreva uma verificação manual objetiva, sem criar outra categoria de teste.
- Exceção única: as duas classes de guarda de segurança em `guard/` (`RotasProtegidasGuardTest` e `ContratoSegurancaGuardTest`), descritas em `steering/nord-tool-backend/testing.md`. Mantenha-as atualizadas quando mudar rotas públicas ou o contrato de erro de segurança; não crie outras.
- Use JUnit 5 e Mockito. Instancie a implementação testada com dependências simuladas; mantenha os testes determinísticos e independentes de banco, rede, relógio real e estado compartilhado.
