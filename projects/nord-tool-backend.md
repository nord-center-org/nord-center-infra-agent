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
- Política obrigatória da suíte automatizada: testar somente classes `*ServiceImpl`, em testes `*ServiceImplTest` com JUnit 5 e Mockito. Não criar testes para controllers, DTOs/forms, repositories, configuração ou integração. Única exceção: as duas guardas de segurança em `guard/`. A cobertura de linhas dos `*ServiceImpl` deve ficar em no mínimo 90% (gate do JaCoCo no `mvn verify`). Consulte `steering/nord-tool-backend/testing.md`.
- O repositório ainda pode conter testes legados fora desse padrão; não os remova em alterações não relacionadas. Uma limpeza da suíte deve ser planejada como tarefa explícita.
- Comandos Maven documentados: `mvn clean`, `mvn install`, `mvn test` e `mvn verify` (este último reproduz o gate de cobertura do CI); ao relatar validação, identifique testes legados executados e lacunas verificadas manualmente.
- Na máquina de desenvolvimento não há `mvn` no PATH: rode o Maven embutido do IntelliJ com `scripts/java/java-local-run.ps1` desta infra. Exemplos: `-Projeto nord-tool-backend` (o `clean verify` do CI), `-Projeto nord-tool-backend -Test LimiteTentativasServiceImplTest` (um teste, sem o gate de cobertura) e `-Goals "compile pmd:check spotbugs:check"`. O script escolhe o JDK pela versão do `pom.xml`, mesmo que o `JAVA_HOME` aponte para outra. Detalhes em `scripts/README.md`.
- Para validar endpoints com collections Postman, use `scripts/api/newman-run.ps1` (backend local em `http://localhost:8081`, token em `NORD_API_TOKEN`, nunca na collection).
- Configuração de banco varia por ambiente. Nunca copie valores de senha do Compose para código, logs ou novos documentos; migre segredos para configuração externa quando alterar essa área.
- O SQL relacionado é mantido em `nord-tool-scripts-sql`.
