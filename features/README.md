# Catálogo de features

Registro do que cada funcionalidade do NordTool faz, uma pasta por feature. As regras estão em [policies/features.md](../policies/features.md) e os modelos em [templates/feature/](../templates/feature/).

Antes de começar qualquer pedido, procure aqui se a funcionalidade já existe. Se existir, o pedido é uma nova versão dela.

| Feature | Slug | Versão atual | Repositórios | Status |
|---|---|---|---|---|
| Aparência | [`aparencia`](aparencia/README.md) | [v2](aparencia/v2.md) | frontend | ativa |
| Cronograma semanal | [`cronograma-semanal`](cronograma-semanal/README.md) | [v2](cronograma-semanal/v2.md) | scripts-sql, backend, frontend | ativa |
| Escadinha | [`escadinha`](escadinha/README.md) | [v2](escadinha/v2.md) | scripts-sql, backend, frontend | ativa |
| Notificações no celular | [`notificacoes`](notificacoes/README.md) | [v1](notificacoes/v1.md) | scripts-sql, backend, frontend | ativa |
| Placas | [`placas`](placas/README.md) | [v1](placas/v1.md) | scripts-sql, backend, frontend | ativa |
| SAC | [`sac`](sac/README.md) | [v2](sac/v2.md) | scripts-sql, backend, frontend | ativa |

`Status` é `ativa` ou `descontinuada`. Uma feature descontinuada mantém a pasta como histórico.

## Funcionalidades ainda sem registro

Estas telas já existiam no app quando o registro começou (rotas do frontend em 2026-10-30) e ainda não têm pasta. Um pedido que mexa em uma delas é tratado como legado: registre o estado atual em `v1.md` retroativo e entregue o pedido como v2, conforme a policy.

- Autenticação e conta: `/login`, `/cadastro`, `/esqueci-senha`, `/redefinir-senha`, `/configuracoes`
- Início e painel: `/`, `/dashboard`, `/lugia`
- `/apartamentos`, `/entregas`, `/treinamentos`
- Gestão: `/gestao/academico`, `/gestao/caixinha`, `/gestao/casamento`, `/gestao/financeiro`, `/gestao/repertorio`, `/gestao/treinos`
- Mapeamentos: `/mapeamentos/conferencias`, `/mapeamentos/pendencias`, `/mapeamentos/relatorio-fotografico`
- Organizacional: `/organizacional/controle-chaves`, `/organizacional/diario-obras`, `/organizacional/fluxograma`, `/organizacional/fvs`, `/organizacional/medicoes`, `/organizacional/projetos`, `/organizacional/rte`

Ao registrar uma delas, retire-a desta lista no mesmo PR.
