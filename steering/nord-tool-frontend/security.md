# Frontend: segurança

- Nunca incluir tokens, senhas ou segredos no bundle do navegador.
- Não confiar em validações somente no cliente; autorização pertence ao backend.
- Não renderizar HTML não confiável sem sanitização e justificativa.
- Aplique as policies globais de branch e permissões em `policies/`.
