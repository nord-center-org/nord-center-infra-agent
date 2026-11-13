# Catálogo de features

Registro do que cada funcionalidade do NordTool faz, uma pasta por feature. As regras estão em [policies/features.md](../policies/features.md) e os modelos em [templates/feature/](../templates/feature/).

Antes de começar qualquer pedido, procure aqui se a funcionalidade já existe. Se existir, o pedido é uma nova versão dela.

| Feature | Slug | Versão atual | Repositórios | Status |
|---|---|---|---|---|
| Aparência | [`aparencia`](aparencia/README.md) | [v2](aparencia/v2.md) | frontend | ativa |
| Avatar | [`avatar`](avatar/README.md) | [v3](avatar/v3.md) | backend, frontend | ativa |
| Bloco de notas | [`bloco-notas`](bloco-notas/README.md) | [v5](bloco-notas/v5.md) | scripts-sql, backend, frontend | ativa |
| Cubicagem | [`cubicagem`](cubicagem/README.md) | [v1](cubicagem/v1.md) | scripts-sql, backend, frontend | ativa |
| Conversor de arquivos | [`conversor-arquivos`](conversor-arquivos/README.md) | [v1](conversor-arquivos/v1.md) | frontend | ativa |
| Cronograma semanal | [`cronograma-semanal`](cronograma-semanal/README.md) | [v4](cronograma-semanal/v4.md) | scripts-sql, backend, frontend | ativa |
| Editor de imagens | [`editor-imagens`](editor-imagens/README.md) | [v2](editor-imagens/v2.md) | frontend | ativa |
| Escadinha | [`escadinha`](escadinha/README.md) | [v2](escadinha/v2.md) | scripts-sql, backend, frontend | ativa |
| Favoritos do menu | [`menu-favoritos`](menu-favoritos/README.md) | [v1](menu-favoritos/v1.md) | scripts-sql, backend, frontend | ativa |
| Lugia | [`lugia`](lugia/README.md) | [v2](lugia/v2.md) | backend, frontend | ativa |
| Meus dados | [`meus-dados`](meus-dados/README.md) | [v1](meus-dados/v1.md) | backend, frontend | ativa |
| Notificações no celular | [`notificacoes`](notificacoes/README.md) | [v1](notificacoes/v1.md) | scripts-sql, backend, frontend | ativa |
| Placas | [`placas`](placas/README.md) | [v2](placas/v2.md) | scripts-sql, backend, frontend | ativa |
| Relatório fotográfico | [`relatorio-fotografico`](relatorio-fotografico/README.md) | [v4](relatorio-fotografico/v4.md) | scripts-sql, backend, frontend | ativa |
| Repertório | [`repertorio`](repertorio/README.md) | [v3](repertorio/v3.md) | frontend | ativa |
| SAC | [`sac`](sac/README.md) | [v3](sac/v3.md) | scripts-sql, backend, frontend | ativa |

`Status` é `ativa` ou `descontinuada`. Uma feature descontinuada mantém a pasta como histórico.

## Funcionalidades ainda sem registro

Estas telas já existiam no app quando o registro começou (rotas do frontend em 2026-10-30) e ainda não têm pasta. Um pedido que mexa em uma delas é tratado como legado: registre o estado atual em `v1.md` retroativo e entregue o pedido como v2, conforme a policy.

- Autenticação e conta: `/login`, `/cadastro`, `/esqueci-senha`, `/redefinir-senha`, `/configuracoes`
- Início e painel: `/`, `/dashboard`
- `/apartamentos`, `/entregas`, `/treinamentos`
- Gestão: `/gestao/academico`, `/gestao/caixinha`, `/gestao/casamento`, `/gestao/financeiro`, `/gestao/treinos`
- Mapeamentos: `/mapeamentos/conferencias`, `/mapeamentos/pendencias`
- Organizacional: `/organizacional/controle-chaves`, `/organizacional/diario-obras`, `/organizacional/fluxograma`, `/organizacional/fvs`, `/organizacional/medicoes`, `/organizacional/projetos`, `/organizacional/rte`

Ao registrar uma delas, retire-a desta lista no mesmo PR.
