# SQL: segurança

## Credenciais e informações sensíveis

**Padrão vigente**

- Forneça credenciais por variáveis de ambiente ou por um secret manager. Nunca as inclua em scripts SQL, arquivos versionados, commits ou exemplos com valores reais.
- Não exponha credenciais em argumentos de comando, mensagens de erro, logs ou relatórios. Oculte ou mascare valores sensíveis quando forem necessários para diagnosticar uma conexão.
- Proteja arquivos de credenciais locais e não os adicione ao repositório.

## Banco e permissões

**Padrão vigente**

- Antes de executar scripts, confirme explicitamente o projeto, o ambiente, o banco e o schema alvo. Não use produção para testes.
- Use uma conta com apenas as permissões necessárias para executar a alteração. Não use uma conta superusuária quando privilégios mais restritos forem suficientes.
- Para orientações sobre validação antes da execução, consulte [testing.md](testing.md).

## Operações destrutivas e conversões

**Padrão vigente**

- Antes de executar uma operação destrutiva ou converter dados, avalie o impacto em objetos e registros existentes e defina uma estratégia de backup e recuperação.
- Não execute a operação até que o ambiente alvo e a estratégia de recuperação estejam claros.

## Limite de escopo

Este steering trata da segurança dos scripts e de sua execução. Parametrização de entradas de usuários em queries da aplicação pertence aos steerings do backend, especialmente JDBC e queries.

As policies globais de permissões e fluxo Git continuam válidas: [permissões](../../policies/permissions.md) e [fluxo Git](../../policies/git-workflow.md).
