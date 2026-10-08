# Backend: implementar funcionalidade

1. Leia `projects/nord-tool-backend.md` e `steering/nord-tool-backend/`.
2. Inspecione os controllers, services, repositories, entidades e testes relevantes antes de escolher onde mudar.
3. Preserve Java 11 e Spring Boot 2.7.x; valide entradas e mantenha regras de negócio fora dos controllers.
4. Considere transações, autorização, compatibilidade de API e migrações no repositório SQL.
5. Para testes automatizados, siga a regra obrigatória: somente testes de classes `*ServiceImpl`, nomeados `*ServiceImplTest`, exercitando seus métodos públicos com JUnit 5 e Mockito. Não crie testes de controller, DTO/form, repository, handler, configuração, segurança ou integração. Quando o comportamento não puder ser coberto no `ServiceImpl`, registre a lacuna e inclua uma verificação manual objetiva no plano de validação.
6. Rode as verificações Maven documentadas no steering do backend, deixando claro quais testes foram executados e se a suíte existente ainda contém testes legados fora do padrão.
7. Siga o fluxo global de Git: commit na branch de trabalho e merge somente em `develop` após as verificações.
