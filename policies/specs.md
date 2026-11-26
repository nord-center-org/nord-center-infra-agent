# Specs do plano

As **specs** são os itens do plano de evolução do NordTool (SPEC-01 a SPEC-24): regras dos agentes, segurança, plataforma, infraestrutura, cobrança. Diferem das **features** ([features.md](features.md)), que registram uma funcionalidade do app. Uma spec pode criar ou mudar features; nesse caso, a feature também ganha a sua versão, conforme a policy de features.

Esta policy evita que duas pessoas (ou dois agentes) façam o mesmo trabalho: cada spec é dividida em **etapas**, cada etapa tem um dono e um status, e o status vive neste repositório, em `develop`. Uma etapa já entregue aparece como implementada (ou corrigida) para quem chegar depois.

## 1. Onde fica

```
specs/
  todas-as-specs.md        painel de todas as specs: tipo, prioridade, situação (🟢 🟡 🔴), progresso e pasta
  SPEC-NN-<slug>/          uma pasta por spec, desde o início
    README.md              ficha: dados da spec, bloqueios, aprovação do plano e tabela de etapas (o estado)
    spec.md                o quê e por quê, situação conferida no código e critérios de aceite
    plano.md               plano de implementação: etapas, ordem, arquivos, riscos e validação
    decisoes.md            decisões com o porquê
    contexto/<repo>.md     o que existe hoje em cada repositório tocado e o que muda
```

- Toda spec tem a sua pasta com a ficha e o `spec.md` copiado do plano de origem. `plano.md`, `decisoes.md` e `contexto/` entram quando a spec começa a ser planejada, a partir dos modelos em [`templates/spec/`](../templates/spec/). Só a spec incorporada a outra não tem pasta.
- O ID (`SPEC-NN`) é o do plano e nunca muda. O slug segue as regras de slug de [features.md](features.md).
- **Segurança fora do detalhe aberto.** Specs de segurança (autenticação, sessão, WAF, rate limit, permissões internas, chaves) registram aqui só a ficha, as etapas e um resumo do que o usuário vê. O detalhe técnico fica no repositório restrito previsto na SPEC-24, item 4.

## 2. Tipos e status

**Tipo da spec** (coluna `Tipo` do catálogo e da ficha): `implementacao` (algo novo) ou `correcao` (corrige um problema existente, como vulnerabilidade ou falha de configuração).

**Status da etapa** (tabela de etapas da ficha):

| Status | Significa |
|---|---|
| `planejada` | livre para ser pega, desde que o plano esteja aprovado |
| `bloqueada` | depende de algo que ainda não existe; o motivo está no `plano.md` |
| `em-andamento` | reservada: tem responsável, branch e data |
| `concluida` | entregue: tem os links dos PRs integrados |
| `descartada` | não será feita; o motivo está em `decisoes.md` |

**Situação da spec** (colunas `Situação` e `Progresso` de [todas-as-specs.md](../specs/todas-as-specs.md), mais o resumo no topo) é calculada a partir das fichas pelo script, nunca editada à mão, e conferida pelo CI:

| Situação | Quando |
|---|---|
| 🟢 Concluída (implementada) | todas as etapas concluídas ou descartadas, com pelo menos uma concluída, e tipo `implementacao` |
| 🟢 Concluída (corrigida) | o mesmo, com tipo `correcao` |
| 🔴 Bloqueada (SPEC-NN…) | alguma spec do campo "Bloqueada por" da ficha ainda não está concluída |
| 🔴 Bloqueada (etapas) | todas as etapas abertas estão `bloqueada` |
| 🟡 Em aberto | o resto: há etapas livres ou em andamento, ou o plano ainda não foi escrito |
| ⚪ Descartada | todas as etapas descartadas, nenhuma concluída |
| ⚪ Incorporada | a spec foi unida a outra (sem pasta) |

**Progresso** é a barra das etapas concluídas sobre o total, sem as descartadas (`▰▰▱▱▱▱▱▱▱▱ 2/10 · 1 em andamento`), ou `sem plano` quando as etapas ainda não foram definidas.

**Bloqueada por** (campo da ficha) lista só as specs que precisam estar inteiras antes de qualquer etapa. Dependência parcial (um item de outra spec) fica em "Depende de" e, quando o plano existir, vira etapa `bloqueada`. Quando a última etapa de uma spec é concluída, as que esperavam por ela saem de 🔴 sozinhas no próximo `catalogo`, `pegar` ou `concluir`.

## 3. Fluxo de uma spec

1. **Plano de implementação, sempre.** Quem pegar uma spec que ainda não tem plano (pessoa ou agente) monta o plano antes de qualquer código, mesmo que ninguém peça:
   - confere no código cada ponto de "Situação atual" do `spec.md` e registra o resultado;
   - escreve `plano.md` (etapas, ordem, arquivos, riscos e validação), `decisoes.md` e `contexto/`, pelos modelos de [`templates/spec/`](../templates/spec/);
   - preenche a tabela de etapas da ficha;
   - **levanta as perguntas ao responsável** na seção "Perguntas ao responsável" do `decisoes.md`: toda decisão que não cabe a quem planejou e toda dúvida encontrada no código. Cada pergunta traz a recomendação, o prazo (`Decidir em: antes da aprovação` ou a etapa, como `E03`) e `Resposta: pendente`. O plano tem ao menos uma pergunta.

   `Plano` fica `pendente`, e o plano vai num PR próprio para o responsável revisar.
2. **Aprovação.** O responsável responde as perguntas marcadas para antes da aprovação (preenchendo `Resposta`, com data e login) e aprova o plano: a ficha passa a dizer `aprovado AAAA-MM-DD por <login>`. Nenhuma etapa entra em andamento antes disso, e uma etapa só pode ser pega depois que as perguntas dela tiverem resposta.
3. **Reserva de uma etapa.** Veja a seção 4. A reserva entra em `develop` antes do código.
4. **Implementação** na branch da etapa, com o mesmo nome em todos os repositórios tocados.
5. **Conclusão.** No PR da infra da etapa, marque a etapa como concluída com os links dos PRs e atualize `decisoes.md` e `contexto/` com o que foi feito de fato.

Um `plano.md` aprovado só muda com o motivo registrado em `decisoes.md`. Uma etapa concluída nunca é reaberta: comportamento novo vira etapa nova (E11, E12…), na mesma spec.

## 4. Pegar uma etapa sem conflito

```
git fetch origin
git switch -c docs-spec-01-e03-reserva origin/develop
node scripts/specs/specs.mjs status SPEC-01
node scripts/specs/specs.mjs pegar SPEC-01 E03 --responsavel <login> --branch ci-spec-01-e03-limite-linhas
```

O comando `pegar` consulta a ficha em `origin/develop` e na cópia local e **recusa** quando:

- a etapa já foi concluída: responde que ela já está implementada (ou corrigida), com os PRs;
- a etapa está em andamento com outra pessoa ou outra branch: responde quem e onde;
- a etapa está bloqueada (use `--desbloquear` só se a dependência já foi resolvida);
- o plano da spec ainda não foi aprovado;
- você está em `develop`, `master` ou `main`;
- com `GITHUB_TOKEN` no ambiente: existe outra branch `*-spec-NN-eMM-*` em algum repositório, ou outro PR aberto reservando a mesma etapa.

Se tudo estiver livre, ele grava a reserva na ficha e atualiza a situação e o progresso em `todas-as-specs.md`. Faça commit só desses dois arquivos, abra o PR de reserva para `develop` e só comece o código depois que ele for integrado. Para desistir, mude a linha de volta para `planejada` (sem responsável, branch nem data) num PR.

Ao terminar, no PR da infra da etapa:

```
node scripts/specs/specs.mjs concluir SPEC-01 E03 --pr <url> --pr <url>
```

## 5. Nome das branches

- Trabalho de uma etapa: `<tipo>-spec-NN-eMM-<resumo>`, com os prefixos e o limite de 50 caracteres de [features.md](features.md). Exemplo: `ci-spec-01-e03-limite-linhas`.
- Reserva: `docs-spec-NN-eMM-reserva`.
- Quando a programação incremental da SPEC-01 (etapa E03) estiver ativa, a branch da etapa é a branch mãe e as partes levam o sufixo `-001`, `-002`…

O token `spec-NN-eMM` no nome é o que liga a branch à etapa: o `status` e o `pegar` procuram por ele nos repositórios.

## 6. Validação automática

O workflow `Specs` roda em todo PR e em todo push em `develop`:

- `node --test scripts/specs/lib.test.mjs`;
- `node scripts/specs/specs.mjs validar --base origin/develop`, que confere:
  - formato do catálogo e das fichas (campos, colunas, status, datas, branch e PRs);
  - spec com etapas ou plano aprovado tem `plano.md` e `decisoes.md` com ao menos uma pergunta ao responsável; plano aprovado sem resposta para as perguntas "antes da aprovação", ou etapa em andamento sem resposta para as perguntas dela, é recusado;
  - situação, progresso e resumo de `todas-as-specs.md` iguais aos calculados pelas fichas;
  - transições de cada etapa em relação a `develop`, pela tabela abaixo;
  - nenhum outro PR aberto reservando ou concluindo a mesma etapa.

| De (em `develop`) | Para (no PR) | Regra |
|---|---|---|
| `planejada` ou `bloqueada` | `em-andamento` | exige plano aprovado, responsável, branch da etapa e data |
| `em-andamento` | `em-andamento` com outro responsável ou branch | recusado: quem tem a etapa precisa liberá-la antes |
| `em-andamento` | `planejada` | permitido (liberar) |
| qualquer um aberto | `concluida` | exige ao menos um link de PR e data |
| `concluida` ou `descartada` | qualquer outro | recusado |
| etapa existente | removida da tabela | recusado, salvo se ainda `planejada` |

Correção de um erro de registro numa etapa concluída: PR com o rótulo `corrige-registro` e o motivo na descrição. O rótulo libera só as regras de transição; formato e status continuam conferidos.
