# Catálogo de features

Registro do que cada funcionalidade do NordTool faz, uma pasta por feature. As regras estão em [policies/features.md](../policies/features.md) e os modelos em [templates/feature/](../templates/feature/).

Antes de começar qualquer pedido, procure aqui se a funcionalidade já existe. Se existir, o pedido é uma nova versão dela.

| Feature | Slug | Versão atual | Repositórios | Status |
|---|---|---|---|---|
| Controle de chaves | [`controle-chaves`](controle-chaves/README.md) | [v1](controle-chaves/v1.md) (retroativa) | nord-tool-scripts-sql, nord-tool-backend, nord-tool-frontend | ativa |
| Cronograma semanal | [`cronograma-semanal`](cronograma-semanal/README.md) | [v1](cronograma-semanal/v1.md) (retroativa) | nord-tool-scripts-sql, nord-tool-backend, nord-tool-frontend | ativa |
| Escadinha | [`escadinha`](escadinha/README.md) | [v1](escadinha/v1.md) (retroativa) | nord-tool-scripts-sql, nord-tool-backend, nord-tool-frontend | ativa |
| Medições | [`medicoes`](medicoes/README.md) | [v1](medicoes/v1.md) (retroativa) | nord-tool-scripts-sql, nord-tool-backend, nord-tool-frontend | ativa |

`Status` é `ativa` ou `descontinuada`. Uma feature descontinuada mantém a pasta como histórico. Uma v1 "retroativa" descreve o código encontrado quando a feature foi registrada; as decisões anteriores a ela aparecem como não registradas.

## Funcionalidades ainda sem registro

Estas telas já existiam no app quando o registro começou (rotas do frontend em 2026-10-30) e ainda não têm pasta. Um pedido que mexa em uma delas é tratado como legado: registre o estado atual em `v1.md` retroativo e entregue o pedido como v2, conforme a policy.

- Autenticação e conta: `/login`, `/cadastro`, `/esqueci-senha`, `/redefinir-senha`, `/configuracoes`
- Início e painel: `/`, `/dashboard`, `/lugia`
- `/apartamentos`, `/entregas`
- Gestão: `/gestao/caixinha`, `/gestao/casamento`, `/gestao/financeiro`, `/gestao/treinos`
- Mapeamentos: `/mapeamentos/conferencias`, `/mapeamentos/relatorio-fotografico`

Ao registrar uma delas, retire-a desta lista no mesmo PR.

## Telas reservadas, ainda sem funcionalidade

Estas rotas aparecem no menu, mas só mostram o aviso "Página em fase de planejamento" (`components/Placeholder.tsx`, conferido em 2026-10-30): não há regra de negócio, backend nem tabela. Por isso não ganham pasta retroativa. Um pedido para construir uma delas é uma **feature nova (v1)**; registre no `v1.md` que a rota e o item de menu já existiam e tire a rota desta lista no mesmo PR.

- Organizacional: `/organizacional/rte` (RTE), `/organizacional/diario-obras` (Diário de obras), `/organizacional/fluxograma` (Fluxo de atividades), `/organizacional/fvs` (Controle de FVs), `/organizacional/projetos` (Controle de projetos), `/treinamentos` (Controle de treinamentos)
- Mapeamentos: `/mapeamentos/pendencias` (Mapeamento de pendências)
- Gestão: `/gestao/repertorio` (Repertório), `/gestao/academico` (Desenvolvimento acadêmico)
