# Registro de features

Toda funcionalidade do NordTool é entregue e registrada como uma **feature** com um nome fixo, o *slug*. Uma melhoria de uma feature que já existe é uma nova **versão** dela (v2, v3…), nunca uma funcionalidade solta. O registro fica em [`features/`](../features/README.md) deste repositório, uma pasta por feature, com a especificação técnica e o porquê de cada decisão. Esta policy vale para qualquer agente, em qualquer repositório consumidor.

## 1. Classifique o pedido antes de criar a branch

Leia o [catálogo de features](../features/README.md), confira o código afetado e classifique o pedido:

| Pedido | Classificação | Branch | Registro |
|---|---|---|---|
| Funcionalidade que ainda não existe | feature nova (v1) | `feature-<slug>` | cria `features/<slug>/` com `README.md` e `v1.md` |
| Mudança ou ampliação do comportamento de uma feature existente | nova versão (vN) | `feature-<slug>-vN` | cria `features/<slug>/vN.md` e atualiza o `README.md` da feature |
| Comportamento que não segue as regras já registradas | correção | `fix-<slug>-<resumo>` | linha em "Correções" do `README.md` da feature; ajusta as regras se estavam erradas |
| Refatoração, testes, CI, dependências ou documentação, sem mudar o comportamento | manutenção | `refactor-…`, `test-…`, `ci-…`, `chore-…` ou `docs-…` | nenhum, salvo se mudar algo descrito numa feature |

- **Melhoria é nova versão.** Se o pedido muda, amplia ou complementa algo que já existe, ele é a próxima versão da feature existente, mesmo que não use a palavra "melhoria".
- **Feature existente sem pasta (legado).** Se a funcionalidade já está no código mas ainda não tem pasta, crie a pasta registrando o estado atual em `v1.md`, marcado como retroativo: ele descreve o que o código faz hoje, e as decisões antigas ficam como "não registradas". O pedido é entregue como v2.
- **Um pedido, uma feature.** Uma branch entrega uma única versão de uma única feature. Pedidos que misturam features diferentes viram branches separadas. Se não der para separar, a versão fica na feature principal, e o `README.md` da outra registra o impacto em "Dependências e impactos".
- **Dúvida na classificação.** Pergunte à pessoa que fez o pedido antes de criar a branch. Se não houver como perguntar, escolha e registre a escolha como a primeira decisão do `vN.md`.

## 2. Slug e nome da branch

- O slug identifica a feature para sempre: é o nome da pasta, o sufixo da branch e o escopo do commit. Depois de criado, não muda.
- Formato do slug: pt-br, minúsculas, sem acento, só `a-z`, `0-9` e hífens entre as palavras, descrevendo a funcionalidade e sem artigos ou preposições. Exemplos: `cronograma-semanal`, `controle-chaves`, `relatorio-fotografico`.
- O nome da branch tem **no máximo 50 caracteres** no total. Mantenha o slug com até 38 caracteres para que `feature-<slug>-vNN` caiba no limite.
- A v1 não leva sufixo: `feature-cronograma-semanal`. A partir da v2: `feature-cronograma-semanal-v2`.
- O número da nova versão é o seguinte à maior versão já existente, considerando os arquivos em `features/<slug>/` e as branches remotas `feature-<slug>-v*` ainda abertas em qualquer repositório.
- Correções usam `fix-<slug>-<resumo>`, também com até 50 caracteres; abrevie o resumo, nunca o slug, e, se não couber, use `fix-<slug>`.
- Prefixos permitidos: `feature-`, `fix-`, `refactor-`, `test-`, `ci-`, `chore-` e `docs-`. O MCP só cria branches que seguem `^(feature|fix|refactor|test|ci|chore|docs)-[a-z0-9]+(-[a-z0-9]+)*$` com até 50 caracteres.
- Branches antigas no formato `tipo/nome` seguem até serem integradas; toda branch nova usa este padrão.

## 3. A mesma branch em todos os repositórios da entrega

Uma feature costuma atravessar mais de um repositório. Use **o mesmo nome de branch** em cada repositório alterado (SQL, backend, frontend) e também neste repositório de infra, onde fica a documentação. Cada repositório tem seu próprio PR para `develop`, conforme o [fluxo Git global](git-workflow.md), e cada PR cita os demais e o caminho da documentação.

Integre na ordem das dependências (normalmente SQL, depois backend, depois frontend) e a documentação junto com o último PR. A entrega só termina quando todos os PRs, inclusive o da documentação, estiverem integrados.

## 4. Documentação da feature

```
features/
  README.md        catálogo de todas as features
  <slug>/
    README.md      ficha: o que a feature faz hoje, regras vigentes, onde está no código, versões e correções
    v1.md          especificação técnica e decisões da v1
    v2.md          especificação técnica e decisões da v2
```

- Parta dos modelos em [`templates/feature/`](../templates/feature/): `README.md` para a ficha e `vN.md` para cada versão.
- Escreva o `vN.md` **no início** do trabalho, com o pedido, o escopo e o plano técnico, e finalize-o **antes de abrir os PRs** com o que foi de fato entregue: decisões, arquivos, validação e pendências. Acrescente os links dos PRs depois de abri-los.
- O `vN.md` registra **o porquê de cada decisão**, principalmente das tomadas pelo agente: o que foi decidido, por quê, as alternativas descartadas e quem decidiu (a pessoa ou o agente). Registre também as decisões pequenas que mudam o comportamento, como nome de endpoint, regra de validação, valor padrão ou permissão exigida.
- O `README.md` da feature é sempre o retrato **atual**. A cada versão, reescreva "O que faz" e "Regras de negócio vigentes" para refletir o comportamento depois da entrega, indicando em cada regra a versão que a criou ou alterou. Quem lê o `README.md` não precisa ler todas as versões para saber como a feature funciona hoje.
- Um `vN.md` já integrado é histórico e não é reescrito, exceto para corrigir um erro de registro. Uma versão nova descreve o que mudou em relação à anterior e por quê.
- Antes de planejar uma nova versão, leia o `README.md` e todos os `vN.md` da feature. Uma decisão anterior só é desfeita de forma consciente, com o motivo registrado na nova versão.
- Atualize o catálogo [`features/README.md`](../features/README.md), uma linha por feature em ordem alfabética do slug, ao criar uma feature ou mudar sua versão atual.
- Escreva em pt-br, para quem não participou da conversa com o agente. Nunca copie segredos, dados pessoais ou valores de ambiente.

## 5. Commit e PR

O que fica em `develop` é o squash do PR, então o título e a descrição do PR são o commit da entrega.

- Título com até 72 caracteres: `feat(<slug>): <resumo>` na v1, `feat(<slug>-vN): <resumo>` nas versões seguintes e `fix(<slug>): <resumo>` nas correções. Manutenção usa o tipo do prefixo da branch: `refactor:`, `test:`, `ci:`, `chore:` ou `docs:`.
- O resumo, em pt-br, diz o que a funcionalidade passa a fazer. Exemplo: `feat(cronograma-semanal-v2): filtro de demandas por equipe`.
- A descrição tem de duas a cinco linhas com o que foi entregue, o caminho da documentação (`Doc: features/<slug>/vN.md`) e os links dos PRs irmãos.
- Na branch, faça poucos commits, com mensagens no mesmo formato.

## 6. Antes de abrir os PRs

- [ ] Pedido classificado; slug e versão conferidos no catálogo e nas branches remotas.
- [ ] Mesmo nome de branch, com até 50 caracteres, em todos os repositórios tocados e na infra.
- [ ] `vN.md` com pedido, escopo, especificação técnica, regras, decisões com o porquê, validação e pendências.
- [ ] `README.md` da feature e catálogo atualizados.
- [ ] Título e descrição dos PRs no formato da seção 5.
- [ ] Entrada nas novidades da tela inicial quando a mudança for visível para quem usa o app ([novidades.md](novidades.md)).
