# SPEC-24 — Spec

> Copiado do plano de origem ("NordTool — Plano de specs", 26/11/2026). A situação atual ainda não foi conferida no código: confira antes de escrever o plano de implementação (policies/specs.md, seção 3).

**Origem:** pedido de documentar todas as funcionalidades do sistema, menos as de segurança, como uma das primeiras entregas. A partir daí, cada spec nova fica documentada numa pasta junto com as collections da funcionalidade, no projeto de infra e seguindo SDD. Reaproveita a parte de documentação que estava na SPEC-14 (fichas, collections, READMEs e mapa do sistema).

**O que é:** a memória do sistema, num lugar só. Para cada funcionalidade, uma pasta no `nord-center-infra-agent` guarda quatro coisas:

- o que ela faz hoje;
- todas as specs que a criaram e alteraram, cada uma num documento separado e com as decisões e o porquê;
- o contexto técnico separado por repositório (SQL, backend, front);
- a collection para testar os endpoints.

O trabalho segue **SDD (Spec-Driven Development)**: a spec é escrita e aprovada antes do código, e depois da entrega é atualizada com o que foi feito. Uma IA ou uma pessoa que vá mexer numa funcionalidade lê a pasta dela primeiro e entende o que existe, o que foi decidido e o que pode ser afetado.

**Situação atual:**

- A base já existe. A policy `policies/features.md` define `features/<slug>/` com uma ficha (`README.md`) e um arquivo por versão (`v1.md`, `v2.md`…), e o template `templates/feature/vN.md` já traz pedido, escopo, especificação por repositório, decisões e validação.
- O catálogo `features/README.md` está vazio, e cerca de 30 telas aparecem como "ainda sem registro".
- Não há contexto separado por repositório, nem collections, nem lugar para as specs transversais (segurança, CI, infraestrutura), como as deste plano.

**Estrutura proposta (no `nord-center-infra-agent`):**

```text
features/
  README.md                    catálogo de todas as funcionalidades
  <slug>/                      ex.: controle-chaves, cronograma-semanal
    README.md                  ficha: o que faz hoje, regras vigentes, telas, endpoints, tabelas
    v1.md, v2.md, …            uma spec por versão, nunca reescrita depois de integrada
    contexto/
      nord-tool-scripts-sql.md tabelas, colunas, índices, scripts e ordem no filelist
      nord-tool-backend.md     contexto (pacote), endpoints, services, queries, permissões exigidas
      nord-tool-frontend.md    rotas, telas, componentes, services e estados da tela
    collections/               collection Bruno da funcionalidade (sem segredos)
specs/
  SPEC-NN-<slug>/              specs transversais (este plano): spec.md, decisoes.md e contexto por repositório
```

**O que fazer:**

1. **Atualizar a policy e os templates.**
   - Ampliar `policies/features.md` com a pasta `contexto/` (um arquivo por repositório tocado) e a pasta `collections/`.
   - Criar `specs/` para as specs transversais, com o mesmo princípio de uma versão por documento.
   - Novos templates em `templates/feature/`.
   - As collections saem do backend (antes previstas na SPEC-14) e passam a morar aqui, junto da funcionalidade.
2. **Fluxo SDD obrigatório para toda spec nova:**
   1. Spec: o quê e por quê, no `vN.md`.
   2. Plano técnico por repositório, no `contexto/` e no `vN.md`.
   3. Tarefas divididas em partes de até 500 linhas (SPEC-01).
   4. Aprovação do plano.
   5. Implementação.
   6. Atualização da ficha, do contexto e da collection no mesmo conjunto de PRs.

   Ferramentas como o Spec Kit do GitHub seguem esse fluxo e podem ser avaliadas, mas o formato de referência é o da infra.
3. **Documentação retroativa de todas as funcionalidades, menos as de segurança:**
   - Uma pasta por funcionalidade, com `v1.md` marcado como retroativo (descreve o código de hoje; decisões antigas "não registradas"), ficha, contexto por repositório e collection.
   - **Primeiro os módulos do MVP:** Vistoria e entrega, Planejamento, Registro de campo e cadastros. **Depois os demais:** gestão pessoal, Lugia, Davi Job e integrações.
   - A IA do dev gera o rascunho a partir do código, e uma pessoa revisa.
4. **Fora da documentação aberta: segurança (decisão confirmada).** Autenticação, sessão, 2FA, permissões internas, limites de tentativa, regras de WAF e rate limit, chaves e rotação não ganham ficha detalhada em `features/`.
   - Ficam só com um resumo do que o usuário vê, sem detalhes que ajudem um ataque.
   - O detalhe vai para um local restrito (repositório ou pasta com acesso limitado por CODEOWNERS), fora do contexto padrão dos agentes. Proposta concreta: um repositório privado só para isso, com acesso apenas dos responsáveis pelo projeto. Ele fica fora da allowlist do MCP e do \`get\_project\_context\`, e todo acesso fica registrado. Nenhum documento de segurança, collection ou exemplo com credencial fica na infra aberta, no backend ou no front.
5. **Contexto sob medida para os agentes.** Uma ferramenta nova no MCP, `get_feature_context(slug, projeto)`, devolve a ficha, o contexto daquele repositório e a última spec da funcionalidade. A IA carrega só o que importa para a tarefa, em vez da infra inteira. O grafo de código da SPEC-02 complementa isso mais adiante.
6. **Garantia de que a documentação acompanha o código:**
   - Branch `feature-<slug>` ou `fix-<slug>` sem alteração em `features/<slug>/` é recusada pelo MCP e pelo checklist de PR (SPEC-01).
   - Endpoint novo ou alterado sem collection atualizada falha a revisão.
7. **READMEs e mapa do sistema** (antes na SPEC-14):
   - READMEs dos quatro repositórios com o mesmo esqueleto: o que é, stack, arquitetura, padrões de código e nomenclatura, como rodar localmente e como testar, com links para `features/`.
   - Um mapa do sistema (repositórios, serviços, banco e integrações) na infra.
8. **As specs deste plano** entram em `specs/` quando cada uma começar a ser executada, para o histórico de decisões ficar junto do código.

**Critérios de aceite:**

- [ ] Toda funcionalidade do MVP tem pasta com ficha, `v1.md` retroativo, contexto por repositório e collection que roda localmente só com o token.
- [ ] A lista "ainda sem registro" do catálogo está vazia ao fim da spec, contando também os módulos fora do MVP.
- [ ] Nenhum detalhe sensível de segurança aparece em `features/` ou nas collections.
- [ ] `get_feature_context` devolve só o contexto do repositório pedido.
- [ ] Um PR de feature sem atualizar a pasta da funcionalidade é recusado.
- [ ] Uma pessoa nova entende uma funcionalidade e sobe o projeto local só com a pasta e o README.

**Depende de:** SPEC-01 (regras dos agentes e do PR). Não depende de nenhuma outra, por isso entra cedo no MVP (item 3).

**Prazo estimado:** 18 a 27 dias úteis (144 a 216 horas):

- estrutura, policy, templates e ferramenta MCP: 3 a 4 dias (24 a 32 horas);
- funcionalidades do MVP: 8 a 12 dias (64 a 96 horas);
- demais funcionalidades: 5 a 8 dias (40 a 64 horas);
- READMEs e mapa: 2 a 3 dias (16 a 24 horas).

No MVP entram as duas primeiras partes, de 11 a 16 dias (88 a 128 horas).
