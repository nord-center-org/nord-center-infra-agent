# <Nome da feature> — vN

<!-- Uma versão por arquivo (v1.md, v2.md…). Escreva no início do trabalho e finalize antes dos PRs. Depois de integrado, é histórico. Regras em policies/features.md. -->

| | |
|---|---|
| Data | AAAA-MM-DD |
| Branch | `feature-<slug>` na v1, `feature-<slug>-vN` nas seguintes |
| PRs | <um link por repositório, inclusive a infra> |
| Pedido por | <pessoa ou canal> |
| Agente | <ferramenta e modelo, ex.: Claude Code com Claude Opus 5.5> |
| Versão anterior | [vN-1](vN-1.md) <!-- remova na v1 --> |

## Pedido

<O que foi pedido, resumindo com fidelidade as palavras da pessoa.>

## Escopo

- **Entra:** <…>
- **Fica de fora:** <…> e por quê.

## O que muda em relação à versão anterior

<A partir da v2: como era e como fica. Na v1 retroativa: "Registra o estado encontrado no código em AAAA-MM-DD; as decisões anteriores não foram registradas." Na v1 de uma feature nova, remova esta seção.>

## Especificação técnica

<Inclua só as partes que a versão tocou.>

### Banco (nord-tool-scripts-sql)

<Tabelas e colunas criadas ou alteradas, índices, scripts e ordem no `filelist.txt`.>

### Backend (nord-tool-backend)

<Endpoints (método, rota e permissão), contrato de entrada e saída, services, regras aplicadas e erros.>

### Frontend (nord-tool-frontend)

<Rotas, telas, componentes, estados de carregamento, vazio, erro e sucesso, e chamadas de API.>

## Regras de negócio

<Regras criadas ou alteradas nesta versão, com os mesmos IDs do README.md da feature.>

## Decisões

<Toda escolha que alguém poderia ter feito de outro jeito, principalmente as tomadas pelo agente.>

### D1 — <título curto>

- **Decisão:** <o que foi escolhido>
- **Por quê:** <o motivo>
- **Alternativas descartadas:** <o que mais foi considerado e por que não>
- **Decidido por:** <agente | nome da pessoa>

## Validação

<Comandos e testes executados com o resultado, verificações manuais e o que não foi validado.>

## Pendências e riscos

<O que ficou para depois, limitações conhecidas e riscos de dados ou de compatibilidade.>
