# Projeto: nord-tool-backend

- Repositório irmão: `../nord-tool-backend`.
- Repositório canônico: `nord-center-org/nord-tool-backend`.
- Propósito: backend do Nord Tool.
- Stack observada: Java 11, Maven, Spring Boot 2.7.15, Spring Web, Validation, Spring JDBC, PostgreSQL e testes Spring Boot/JUnit 5.
- Containerização: Docker e Docker Compose.
- Instruções específicas: `skills/nord-tool-backend/` e `steering/nord-tool-backend/`.

## Orientações

- Preserve Java 11 e Spring Boot 2.7.x até uma tarefa explícita de migração.
- Consulte o `pom.xml` e o código atual para confirmar dependências e estrutura antes de implementar.
- Política obrigatória da suíte automatizada: testar somente classes `*ServiceImpl`, em testes `*ServiceImplTest` com JUnit 5 e Mockito. Não criar testes para controllers, DTOs/forms, repositories, configuração ou integração; consulte `steering/nord-tool-backend/testing.md`.
- O repositório ainda pode conter testes legados fora desse padrão; não os remova em alterações não relacionadas. Uma limpeza da suíte deve ser planejada como tarefa explícita.
- Comandos Maven documentados: `mvn clean`, `mvn install` e `mvn test`; ao relatar validação, identifique testes legados executados e lacunas verificadas manualmente.
- Configuração de banco varia por ambiente. Nunca copie valores de senha do Compose para código, logs ou novos documentos; migre segredos para configuração externa quando alterar essa área.
- O SQL relacionado é mantido em `nord-tool-scripts-sql`.
