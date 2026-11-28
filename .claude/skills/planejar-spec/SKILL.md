---
name: planejar-spec
description: Começa uma spec do plano do NordTool (SPEC-01 a SPEC-24). Use sempre que alguém disser que vai pegar, começar, fazer, implementar ou planejar uma spec, ou pedir o status de uma ("quero pegar a SPEC-03", "vou fazer a spec 12", "/planejar-spec 03"). Confere no painel se a spec está concluída, bloqueada ou em aberto. Se não tiver plano, monta o plano de implementação com as perguntas ao responsável e abre o PR. Se já tiver plano aprovado, reserva uma etapa livre.
argument-hint: "<número da spec, ex.: 03>"
---

# Começar uma spec do plano

Regras completas em `policies/specs.md`. Trabalhe na pasta do `nord-center-infra-agent`. A spec pedida é `$ARGUMENTS`; normalize para `SPEC-NN` (ex.: `3` → `SPEC-03`). Se não veio número, pergunte qual spec antes de qualquer coisa.

## 1. Situação da spec

Rode `node scripts/specs/specs.mjs status SPEC-NN` e diga à pessoa, em uma ou duas linhas, a situação que o painel `specs/todas-as-specs.md` mostra:

- **🟢 Concluída:** diga que já está implementada (ou corrigida), com os PRs. Pare. Comportamento novo vira etapa nova, combinada com o responsável.
- **⚪ Incorporada ou descartada:** diga para qual spec ela foi e pare.
- **🔴 Bloqueada:** diga quais specs faltam. O plano pode ser feito agora, mas nenhuma etapa começa antes. Pergunte se a pessoa quer montar o plano mesmo assim.
- **🟡 Em aberto:** siga.

## 2. Sem plano: montar o plano de implementação

Se a ficha ainda não tem etapas (Progresso "sem plano"):

1. Rode `node scripts/specs/specs.mjs planejar SPEC-NN`. Ele recusa se outra pessoa já está planejando, cria a branch `docs-spec-NN-plano`, copia os modelos e imprime o roteiro.
2. Siga o roteiro impresso, passo a passo. O mais importante:
   - confira no código cada ponto de "Situação atual" antes de planejar;
   - divida o trabalho em etapas, com partes de até 500 linhas de código;
   - em cada etapa, separe `**Feito pela IA:**` (código, testes, configuração versionada, documentação) de `**Ação humana:**` (token, variável, secret, acesso, configuração do GitHub ou do provedor, aprovação), cada ação com quem faz, onde, antes de qual parte e como conferir; sem ação humana, `nenhuma`;
   - levante em `decisoes.md`, seção "Perguntas ao responsável", **toda** decisão que não cabe a você e toda dúvida que o código levantar. Cada pergunta leva contexto, recomendação, "Decidir em" e "Resposta: pendente". Não decida sozinho o que é do responsável: pergunte.
3. Rode `node scripts/specs/specs.mjs catalogo` e `node scripts/specs/specs.mjs validar --base origin/develop`, até não sobrar erro.
4. Faça commit só de `specs/`, abra o PR para `develop` com o título `docs(specs): plano da SPEC-NN` e **pare**. Não escreva código.
5. Responda à pessoa com o link do PR e a lista das perguntas, marcando quais precisam de resposta antes da aprovação.

## 3. Com plano: pegar uma etapa

- **Plano pendente:** diga que o plano espera a aprovação do responsável, com as perguntas ainda sem resposta, e pare.
- **Plano aprovado:** mostre as etapas livres e pergunte qual a pessoa quer.
  1. Crie a branch de reserva `docs-spec-NN-eMM-reserva` a partir de `origin/develop`.
  2. Rode `node scripts/specs/specs.mjs pegar SPEC-NN EMM --responsavel <login> --branch <tipo>-spec-NN-eMM-<resumo>`.
  3. Abra o PR da reserva e só comece o código depois que ele for integrado.
  4. Antes de cada parte, confira a "Ação humana" da etapa: liste para a pessoa o que ainda falta e não siga com a parte que depende disso até ela confirmar.

  Se o `pegar` recusar (etapa concluída, em andamento com outra pessoa, pergunta sem resposta), repasse o motivo e pare.
