# Projeto: nord-tool-backend

- Repositório irmão: `../nord-tool-backend`.
- Repositório canônico: `nord-center-org/nord-tool-backend`.
- Propósito: backend do Nord Tool.
- Stack observada: Java 11, Maven, Spring Boot 2.7.15, Spring Web, Validation, Spring Data JPA, PostgreSQL e testes Spring Boot/JUnit 5.
- Containerização: Docker e Docker Compose.
- Instruções específicas: `skills/nord-tool-backend/` e `steering/nord-tool-backend/`.

## Orientações

- Preserve Java 11 e Spring Boot 2.7.x até uma tarefa explícita de migração.
- Consulte o `pom.xml` e o código atual para confirmar dependências e estrutura antes de implementar.
- O README documenta `mvn clean` e `mvn install`; prefira também executar testes Maven quando aplicável.
- Configuração de banco varia por ambiente. Nunca copie valores de senha do Compose para código, logs ou novos documentos; migre segredos para configuração externa quando alterar essa área.
- O SQL relacionado é mantido em `nord-tool-scripts-sql`.
