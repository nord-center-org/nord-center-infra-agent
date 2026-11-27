# SPEC-21 — Spec

> Copiado do plano de origem ("NordTool — Plano de specs", 26/11/2026). A situação atual ainda não foi conferida no código: confira antes de escrever o plano de implementação (policies/specs.md, seção 3).

**Origem:** decisão de vender o NordTool como serviço para empresas de obra (MVP comercial). Pré-requisito das SPEC-22 e 23.

**O que é:** cada empresa cliente vira uma **conta**, e todo dado passa a pertencer a uma conta. Um usuário só enxerga os dados da conta em que está logado; nem um bug numa query deixa vazar dado de outro cliente. A spec também traz o cadastro self-service da empresa, os convites de usuários e os módulos liberados por conta.

**Situação atual:**

- O sistema foi feito para uma única organização: as tabelas não têm coluna de cliente, e as permissões são por usuário e perfil (`usuario_permissao`, `perfil_permissao`).
- A tabela `empresas` já existe, mas representa as empresas que trabalham nas obras, não o cliente do serviço. Por isso o novo conceito se chama **conta**, para não confundir.
- O primeiro usuário é criado por variável de ambiente (`AdminBootstrapRunner`); não há cadastro de empresa nem convite.
- Arquivos, caches e chaves de cache são globais.

**Modelo escolhido:** banco e esquema compartilhados, com coluna `id_conta` em toda tabela de cliente e RLS do Postgres por conta como rede de segurança. É o modelo mais barato de operar para muitos clientes pequenos e médios.

- **Descartado — um esquema por cliente:** cada um dos 60 scripts DDL teria de rodar em N esquemas.
- **Descartado — um banco por cliente:** caro e pesado demais para o tamanho atual.

**O que fazer:**

1. **Tabela `conta`**: nome, CNPJ, status, plano e datas. Também uma tabela `usuario_conta` desde o início, porque um engenheiro ou consultor pode atender mais de uma construtora. O JWT leva a conta ativa, e trocar de conta emite um token novo.
2. **`id_conta` em todas as tabelas dos módulos do MVP e dos cadastros**, no padrão expandir e depois contrair (SPEC-15 e regras do MVP):
   1. coluna opcional;
   2. preenchimento dos dados atuais com a conta interna "NordTool";
   3. `NOT NULL`, chave estrangeira e índices compostos começando por `id_conta`.

   As constraints de unicidade passam a ser por conta (ex.: número do apartamento único dentro da conta).
3. **Filtro na aplicação:** um `ContaAtualProvider` lê a conta do token, e toda query de `query/*.properties` ganha `AND id_conta = :idConta`.
4. **RLS por conta (rede de segurança):** o mesmo mecanismo da SPEC-13, antecipado e aplicado por conta.
   - O backend define `app.id_conta` em cada transação.
   - Cada tabela tem a política `id_conta = current_setting('app.id_conta')`, com `FORCE ROW LEVEL SECURITY` e o usuário da aplicação sem ser dono das tabelas.
   - Uma query que esqueça o filtro devolve vazio em vez de dados de outro cliente.
   - O RLS por usuário, dentro da conta, continua na SPEC-13.
5. **Arquivos, cache e logs por conta:**
   - arquivos com prefixo da conta no armazenamento, e todo download confere a conta;
   - chaves de cache incluem `id_conta`;
   - logs, métricas e alertas levam `id_conta`;
   - o rate limit também passa a ser por conta (SPEC-17).
6. **Papéis:**
   - **Administrador da conta:** gerencia usuários, perfis e a assinatura.
   - **Perfis e permissões:** os de hoje passam a valer dentro de cada conta.
   - **Backoffice do NordTool:** separado dos clientes, com 2FA obrigatório e auditoria. Não abre dados de cliente sem um "acesso de suporte" autorizado pelo administrador da conta, com prazo e registro.
7. **Cadastro self-service:**
   - a empresa se cadastra (dados da empresa, administrador, e-mail confirmado, aceite dos termos da SPEC-20);
   - um assistente cria a primeira obra;
   - convites por e-mail com token que expira;
   - remover usuário e transferir o papel de administrador.

   O `AdminBootstrapRunner` fica só para a conta interna.
8. **Módulos e flags por conta:** os módulos do MVP ficam liberados conforme o plano. Gestão pessoal, Lugia, Davi Job e integrações ficam só na conta interna. As flags de rollout ficam no mesmo lugar, para liberar novidades primeiro para alguns clientes.
9. **Limites por plano (entitlements):** um serviço único responde "esta conta pode fazer X?" para usuários, obras, armazenamento e módulos. O backend aplica a resposta, nunca só o front, e a SPEC-22 alimenta os valores.
10. **Dados por conta:** exportar e excluir uma conta inteira (SPEC-20) e restaurar uma conta sem afetar as outras (SPEC-11).
11. **Testes:**
    - Uma guarda nova, `IsolamentoContaGuardTest`, permitida pelo ADR da política de testes: para cada rota, o usuário da conta A recebe 404 ao pedir um recurso da conta B.
    - Um teste com Testcontainers prova que o RLS bloqueia uma query sem filtro.

**Critérios de aceite:**

- [ ] Duas contas de teste com dados parecidos: nenhuma tela, rota, arquivo ou exportação de uma mostra algo da outra (guarda automatizada verde).
- [ ] Uma query sem o filtro de conta não devolve nenhuma linha de outra conta.
- [ ] A empresa se cadastra, confirma o e-mail, convida um usuário e usa o sistema sem intervenção manual.
- [ ] Clientes não veem os módulos pessoais nem a Lugia; a conta interna continua com tudo funcionando.
- [ ] Os dados atuais foram migrados para a conta interna sem parada nem perda.

**Depende de:** SPEC-11 (backup antes da migração de dados), SPEC-03 (versão nova) e o ADR da política de testes (SPEC-01).

**Prazo estimado:** 25 a 33 dias úteis (200 a 264 horas).
