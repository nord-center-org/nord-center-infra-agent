# Backend: segurança

- Nunca versionar credenciais ou segredos; utilizar configuração de ambiente/secret manager.
- Validar autenticação, autorização e dados de entrada nos limites do serviço.
- Use consultas parametrizadas e não exponha dados sensíveis em respostas ou logs.
- A policy global de branch e permissões em `policies/` também se aplica.
