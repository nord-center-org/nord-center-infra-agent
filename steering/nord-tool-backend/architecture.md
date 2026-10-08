# Backend: arquitetura

- Stack observada: Java 11, Spring Boot 2.7.15, Maven, Spring MVC, Spring JDBC e PostgreSQL.
- A persistência atual usa JDBC; consulte o `pom.xml` e o código antes de propor mudanças de dependência ou arquitetura.
- Preserve separação existente de API, regras de negócio e persistência.
- Alterações de schema devem ser coordenadas com `nord-tool-scripts-sql`.
