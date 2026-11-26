# Specs do plano

As **specs** são os itens do plano de evolução do NordTool (SPEC-01 a SPEC-24): regras dos agentes, segurança, plataforma, infraestrutura, cobrança. Diferem das **features** ([features.md](features.md)), que registram uma funcionalidade do app. Uma spec pode criar ou mudar features; nesse caso, a feature também ganha a sua versão, conforme a policy de features.

Esta policy evita que duas pessoas (ou dois agentes) façam o mesmo trabalho: cada spec é dividida em **etapas**, cada etapa tem um dono e um status, e o status vive neste repositório, em `develop`. Uma etapa já entregue aparece como implementada (ou corrigida) para quem chegar depois.

## 1. Onde fica

```
specs/
  README.md                catálogo de todas as specs do plano: tipo, prioridade, status e pasta
  SPEC-NN-<slug>/
    README.md              ficha: dados da spec, aprovação do plano e tabela de etapas (o estado)
    spec.md                o quê e por quê, situação conferida no código e critérios de aceite
    plano.md               plano de implementação: etapas, ordem, arquivos, riscos e validação
    decisoes.md            decisões com o porquê
    contexto/<repo>.md     o que existe hoje em cada repositório tocado e o que muda
```

- A pasta nasce quando a spec começa a ser planejada, a partir dos modelos em [`templates/spec/`](../templates/spec/). Até lá, a spec aparece só no catálogo, como `planejada`.
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

**Status da spec** (coluna `Status` do catálogo) é calculado a partir das etapas e conferido pelo CI:

| Status da spec | Quando |
|---|---|
| `planejada` | nenhuma etapa começou (ou a spec ainda não tem pasta) |
| `em-andamento` | alguma etapa está em andamento ou concluída, mas não todas |
| `implementada` | todas as etapas concluídas ou descartadas, com pelo menos uma concluída, e tipo `implementacao` |
| `corrigida` | o mesmo, com tipo `correcao` |
| `descartada` | todas as etapas descartadas, nenhuma concluída |
| `incorporada` | a spec foi unida a outra (só no catálogo, sem pasta) |

## 3. Fluxo de uma spec

1. **Spec e plano.** Crie a pasta com `spec.md`, `plano.md`, `decisoes.md`, `contexto/` e a ficha. Confira no código cada ponto de "Situação atual" do plano de origem e registre o resultado. Na ficha, `Plano` fica `pendente`.
2. **Aprovação.** O responsável pelo projeto aprova o plano. A ficha passa a dizer `aprovado AAAA-MM-DD por <login>`. Nenhuma etapa entra em andamento antes disso.
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

Se tudo estiver livre, ele grava a reserva na ficha e o status no catálogo. Faça commit só desses dois arquivos, abra o PR de reserva para `develop` e só comece o código depois que ele for integrado. Para desistir, mude a linha de volta para `planejada` (sem responsável, branch nem data) num PR.

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
  - status de cada spec no catálogo igual ao calculado pelas etapas;
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
