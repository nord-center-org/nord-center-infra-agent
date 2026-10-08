# Backend: Java e Spring

- Preserve Java 11 e Spring Boot 2.7.15 salvo solicitação explícita de migração.
- Siga o desenho existente entre controller, service e repository; evite lógica de negócio em controllers.
- Use forms/DTOs e validação nas fronteiras HTTP; não exponha diretamente modelos de persistência ou projections sem seguir o contrato existente.
- Trate erros sem revelar stack traces, credenciais ou dados pessoais.
- Consulte `pom.xml` antes de propor dependências e valide com Maven.
