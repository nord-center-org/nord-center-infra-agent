// Testes das funções puras do registro de specs: node --test scripts/specs/lib.test.mjs
import assert from "node:assert/strict";
import { test } from "node:test";
import {
  catalogoAtualizado, celulas, progressoDaSpec, motivoParaNaoPlanejar, roteiroDoPlano, branchDoPlano, situacaoDaSpec, lerPerguntas, validarPlanejamento, validarResponsabilidades, celulasEtapa, conflitosComOutrosPrs, erroBranchEtapa, etapaDaBranch, hoje, lerCatalogo, lerFicha,
  linhaDeTabela, motivoParaNaoPegar, reservasDoPr, rotuloPr, statusDaSpec, trocarLinha, validarCatalogo, validarFicha, validarTransicoes,
} from "./lib.mjs";

const PR = "https://github.com/nord-center-org/nord-tool-backend/pull/12";

function ficha({ plano = "aprovado 2026-11-27 por zzNICK", tipo = "implementacao", bloqueada = "—", id = "SPEC-01", etapas }) {
  const linhas = etapas.map(e => `| ${e.join(" | ")} |`).join("\n");
  return `# ${id} — Regras

| Campo | Valor |
|---|---|
| ID | ${id} |
| Tipo | ${tipo} |
| Prioridade | P0 |
| Plano | ${plano} |
| Responsável pela spec | zzNICK |
| Bloqueada por | ${bloqueada} |
| Depende de | — |
| Origem | plano |

## Etapas

| Etapa | Título | Repositórios | Status | Responsável | Branch | PRs | Desde |
|---|---|---|---|---|---|---|---|
${linhas}
`;
}

const livre = (id = "E01") => [id, "Título", "infra", "planejada", "—", "—", "—", "—"];
const andando = (id = "E01", quem = "ana", branch = `ci-spec-01-${id.toLowerCase()}-x`) => [id, "Título", "infra", "em-andamento", quem, `\`${branch}\``, "—", "2026-11-27"];
const pronta = (id = "E01") => [id, "Título", "infra", "concluida", "ana", `\`ci-spec-01-${id.toLowerCase()}-x\``, `[b#12](${PR})`, "2026-11-28"];

const catalogo = (situacao = "🟡 Em aberto", pasta = "[SPEC-01-regras](SPEC-01-regras/README.md)", progresso = "▱▱▱▱▱▱▱▱▱▱ 0/1", resumo = "—") => `# Todas as specs

<!-- resumo:inicio -->
${resumo}
<!-- resumo:fim -->

| ID | Spec | Tipo | Prioridade | No MVP | Situação | Progresso | Pasta |
|---|---|---|---|---|---|---|---|
| SPEC-01 | Regras | implementacao | P0 | item 2 | ${situacao} | ${progresso} | ${pasta} |
| SPEC-16 | Doc | implementacao | — | não | ⚪ Incorporada | — | — |
`;
const estado = (textoCatalogo, textoFicha) => ({
  catalogo: lerCatalogo(textoCatalogo),
  fichas: textoFicha ? new Map([["SPEC-01-regras", lerFicha(textoFicha)]]) : new Map(),
});

test("células respeitam o pipe escapado", () => {
  assert.deepEqual(celulas("| a | `x\\|y` | c |"), ["a", "`x\\|y`", "c"]);
});

test("lê a ficha: plano, etapas, branch sem crase e PRs", () => {
  const f = lerFicha(ficha({ etapas: [andando("E01"), pronta("E02")] }));
  assert.equal(f.id, "SPEC-01");
  assert.equal(f.plano.aprovado, true);
  assert.equal(f.plano.por, "zzNICK");
  assert.equal(f.etapas[0].branch, "ci-spec-01-e01-x");
  assert.deepEqual(f.etapas[1].prs, [PR]);
  assert.deepEqual(validarFicha(f, "SPEC-01-regras"), []);
});

test("ficha: em andamento sem plano aprovado é erro", () => {
  const f = lerFicha(ficha({ plano: "pendente", etapas: [andando()] }));
  assert.match(validarFicha(f, "SPEC-01-regras").join("\n"), /plano da spec ainda não foi aprovado/);
});

test("ficha: concluída sem PR, planejada com responsável e status inválido são erros", () => {
  const semPr = [...pronta()]; semPr[6] = "—";
  const comDono = [...livre("E02")]; comDono[4] = "ana";
  const invalido = [...livre("E03")]; invalido[3] = "feita";
  const erros = validarFicha(lerFicha(ficha({ etapas: [semPr, comDono, invalido] })), "SPEC-01-regras").join("\n");
  assert.match(erros, /E01: etapa concluída precisa de ao menos um link de PR/);
  assert.match(erros, /E02: etapa planejada não pode ter responsável/);
  assert.match(erros, /E03: status "feita" inválido/);
});

test("branch da etapa precisa do padrão e do token spec-NN-eNN", () => {
  assert.equal(erroBranchEtapa("ci-spec-01-e03-limite-linhas", "SPEC-01", "E03"), null);
  assert.match(erroBranchEtapa("ci-spec-01-e04-hooks", "SPEC-01", "E03"), /não contém "spec-01-e03"/);
  assert.match(erroBranchEtapa("ci/spec-01-e03", "SPEC-01", "E03"), /fora do padrão/);
  assert.match(erroBranchEtapa("develop", "SPEC-01", "E03"), /não é branch de trabalho/);
  assert.match(erroBranchEtapa(`ci-spec-01-e03-${"x".repeat(40)}`, "SPEC-01", "E03"), /fora do padrão/);
  assert.deepEqual(etapaDaBranch("docs-spec-02-e10-reserva"), { spec: "SPEC-02", etapa: "E10" });
  assert.equal(etapaDaBranch("feature-cronograma-semanal"), null);
});

test("status da spec calculado pelas etapas", () => {
  const e = status => ({ status });
  assert.equal(statusDaSpec("implementacao", []), "planejada");
  assert.equal(statusDaSpec("implementacao", [e("planejada"), e("bloqueada")]), "planejada");
  assert.equal(statusDaSpec("implementacao", [e("planejada"), e("em-andamento")]), "em-andamento");
  assert.equal(statusDaSpec("implementacao", [e("planejada"), e("concluida")]), "em-andamento");
  assert.equal(statusDaSpec("implementacao", [e("concluida"), e("descartada")]), "implementada");
  assert.equal(statusDaSpec("correcao", [e("concluida")]), "corrigida");
  assert.equal(statusDaSpec("correcao", [e("descartada")]), "descartada");
});

test("situação: concluída, em aberto, bloqueada por spec e por etapas", () => {
  const f = (etapas, extra = {}) => lerFicha(ficha({ etapas, ...extra }));
  const bloqueada = [...livre("E02")]; bloqueada[3] = "bloqueada";
  assert.equal(situacaoDaSpec(f([pronta()]), new Set()), "🟢 Concluída (implementada)");
  assert.equal(situacaoDaSpec(f([pronta()], { tipo: "correcao" }), new Set()), "🟢 Concluída (corrigida)");
  assert.equal(situacaoDaSpec(f([livre()]), new Set()), "🟡 Em aberto");
  assert.equal(situacaoDaSpec(f([]), new Set()), "🟡 Em aberto", "sem plano ainda é em aberto");
  assert.equal(situacaoDaSpec(f([livre()], { bloqueada: "SPEC-03, SPEC-11" }), new Set(["SPEC-11"])), "🔴 Bloqueada (SPEC-03)");
  assert.equal(situacaoDaSpec(f([livre()], { bloqueada: "SPEC-03" }), new Set(["SPEC-03"])), "🟡 Em aberto", "o bloqueio cai quando a spec termina");
  assert.equal(situacaoDaSpec(f([pronta(), bloqueada]), new Set()), "🔴 Bloqueada (etapas)");
  assert.equal(situacaoDaSpec(null, new Set(), { incorporada: true }), "⚪ Incorporada");
});

test("progresso: barra, contagem e em andamento", () => {
  const f = etapas => lerFicha(ficha({ etapas }));
  const descartada = [...livre("E04")]; descartada[3] = "descartada";
  assert.equal(progressoDaSpec(f([])), "sem plano");
  assert.equal(progressoDaSpec(f([pronta("E01"), andando("E02"), livre("E03"), descartada])), "▰▰▰▱▱▱▱▱▱▱ 1/3 · 1 em andamento");
  assert.equal(progressoDaSpec(f([pronta("E01"), pronta("E02")])), "▰▰▰▰▰▰▰▰▰▰ 2/2");
});

test("painel: situação, progresso e resumo desatualizados são erro e o catalogo corrige", () => {
  const fichas = new Map([["SPEC-01-regras", lerFicha(ficha({ etapas: [pronta()] }))]]);
  const texto = catalogo();
  const lido = lerCatalogo(texto);
  const { erros, calculados, resumo } = validarCatalogo(lido, fichas);
  assert.match(erros.join("\n"), /SPEC-01: o catálogo diz "🟡 Em aberto".*"🟢 Concluída \(implementada\)"/);
  assert.match(erros.join("\n"), /resumo de progresso está desatualizado/);
  assert.equal(resumo, "**Progresso geral:** 🟢 1 concluídas · 🟡 0 em aberto · 🔴 0 bloqueadas · ⚪ 1 fora do plano. Etapas: 1 de 1 concluídas, 0 em andamento.");
  const corrigido = catalogoAtualizado(texto, lido, calculados, resumo);
  assert.deepEqual(validarCatalogo(lerCatalogo(corrigido), fichas).erros, []);
  assert.equal(lerCatalogo(corrigido).specs[0].situacao, "🟢 Concluída (implementada)");
  assert.equal(lerCatalogo(corrigido).specs[0].progresso, "▰▰▰▰▰▰▰▰▰▰ 1/1");
});

test("painel: spec sem pasta, pasta órfã e bloqueio para spec inexistente são erros", () => {
  const { erros } = validarCatalogo(lerCatalogo(catalogo("🟡 Em aberto", "—", "sem pasta")), new Map([["SPEC-02-outra", lerFicha(ficha({ id: "SPEC-02", etapas: [livre()] }))]]));
  assert.match(erros.join("\n"), /toda spec tem pasta própria/);
  assert.match(erros.join("\n"), /SPEC-02-outra\/: pasta sem linha no catálogo/);
  const comBloqueio = new Map([["SPEC-01-regras", lerFicha(ficha({ bloqueada: "SPEC-99", etapas: [livre()] }))]]);
  assert.match(validarCatalogo(lerCatalogo(catalogo()), comBloqueio).erros.join("\n"), /cita SPEC-99, que não está no catálogo/);
  assert.match(validarFicha(lerFicha(ficha({ bloqueada: "a SPEC-03", etapas: [] })), "SPEC-01-regras").join("\n"), /"Bloqueada por" deve ser/);
});
test("transição: etapa concluída não pode mudar, e a mensagem diz implementada ou corrigida", () => {
  const base = estado(catalogo("implementada"), ficha({ etapas: [pronta()] }));
  const reaberta = estado(catalogo("em-andamento"), ficha({ etapas: [andando("E01", "bia")] }));
  assert.match(validarTransicoes(base, reaberta).join("\n"), /SPEC-01 E01: já está implementada/);
  const baseCorrecao = estado(catalogo("corrigida"), ficha({ tipo: "correcao", etapas: [pronta()] }));
  const headCorrecao = estado(catalogo("em-andamento"), ficha({ tipo: "correcao", etapas: [andando("E01", "bia")] }));
  assert.match(validarTransicoes(baseCorrecao, headCorrecao).join("\n"), /já está corrigida/);
  assert.deepEqual(validarTransicoes(base, reaberta, { rotulos: ["corrige-registro"] }), []);
});

test("transição: tomar etapa em andamento de outra pessoa é recusado; liberar e concluir passam", () => {
  const base = estado(catalogo("em-andamento"), ficha({ etapas: [andando("E01", "ana")] }));
  const tomada = estado(catalogo("em-andamento"), ficha({ etapas: [andando("E01", "bia")] }));
  assert.match(validarTransicoes(base, tomada).join("\n"), /em andamento com ana/);
  assert.deepEqual(validarTransicoes(base, estado(catalogo(), ficha({ etapas: [livre()] }))), []);
  assert.deepEqual(validarTransicoes(base, estado(catalogo("implementada"), ficha({ etapas: [pronta()] }))), []);
});

test("transição: remover etapa aberta, a pasta ou o ID do catálogo é recusado", () => {
  const base = estado(catalogo("em-andamento"), ficha({ etapas: [andando("E01"), livre("E02")] }));
  const semE01 = estado(catalogo("planejada"), ficha({ etapas: [livre("E02")] }));
  assert.match(validarTransicoes(base, semE01).join("\n"), /E01: a etapa \(em-andamento\) foi removida/);
  const semE02 = estado(catalogo("em-andamento"), ficha({ etapas: [andando("E01")] }));
  assert.deepEqual(validarTransicoes(base, semE02), []);
  const semPasta = { catalogo: lerCatalogo(catalogo("planejada", "—")), fichas: new Map() };
  assert.match(validarTransicoes(base, semPasta).join("\n"), /a pasta existe em develop e foi removida/);
  const semSpec = { catalogo: lerCatalogo("| ID | Spec | Tipo | Prioridade | No MVP | Status | Pasta |\n|---|---|---|---|---|---|---|\n"), fichas: base.fichas };
  assert.match(validarTransicoes(base, semSpec).join("\n"), /SPEC-01 saiu do catálogo/);
});

test("dois PRs reservando a mesma etapa entram em conflito", () => {
  const base = estado(catalogo(), ficha({ etapas: [livre("E01"), livre("E02")] }));
  const meu = estado(catalogo("em-andamento"), ficha({ etapas: [andando("E01", "ana"), livre("E02")] }));
  const deles = estado(catalogo("em-andamento"), ficha({ etapas: [andando("E01", "bia"), andando("E02", "bia")] }));
  const minhas = reservasDoPr(base.fichas, meu.fichas);
  assert.deepEqual([...minhas.keys()], ["SPEC-01/E01"]);
  const outros = [{ numero: 7, url: "https://x/pull/7", autor: "bia", reservas: reservasDoPr(base.fichas, deles.fichas) }];
  const erros = conflitosComOutrosPrs(minhas, outros);
  assert.equal(erros.length, 1);
  assert.match(erros[0], /SPEC-01 E01: o PR #7 \(bia\)/);
  assert.equal(reservasDoPr(meu.fichas, meu.fichas).size, 0, "sem mudança em relação a develop, nada é reservado");
});

test("pegar: recusa concluída, em andamento, bloqueada e plano pendente", () => {
  const f = etapas => lerFicha(ficha({ etapas }));
  assert.match(motivoParaNaoPegar({ fichaDevelop: f([pronta()]), idEtapa: "E01" }), /já está implementada .*pull\/12/);
  assert.match(motivoParaNaoPegar({ fichaDevelop: lerFicha(ficha({ tipo: "correcao", etapas: [pronta()] })), idEtapa: "E01" }), /já está corrigida/);
  assert.match(motivoParaNaoPegar({ fichaDevelop: f([andando("E01", "ana")]), idEtapa: "E01" }), /em andamento com ana/);
  assert.match(motivoParaNaoPegar({ fichaDevelop: f([livre()]), fichaLocal: f([andando("E01", "bia")]), idEtapa: "E01" }), /em andamento com bia .*cópia local/);
  const bloqueada = [...livre()]; bloqueada[3] = "bloqueada";
  assert.match(motivoParaNaoPegar({ fichaDevelop: f([bloqueada]), idEtapa: "E01" }), /bloqueada/);
  assert.equal(motivoParaNaoPegar({ fichaDevelop: f([bloqueada]), idEtapa: "E01", desbloquear: true }), null);
  assert.match(motivoParaNaoPegar({ fichaDevelop: lerFicha(ficha({ plano: "pendente", etapas: [livre()] })), idEtapa: "E01" }), /não foi aprovado/);
  assert.match(motivoParaNaoPegar({ fichaDevelop: f([livre()]), idEtapa: "E09" }), /não existe/);
  assert.match(motivoParaNaoPegar({ fichaDevelop: null, idEtapa: "E01" }), /ainda não tem pasta/);
  assert.equal(motivoParaNaoPegar({ fichaDevelop: f([livre()]), fichaLocal: f([livre()]), idEtapa: "E01" }), null);
});

test("reescreve a linha da etapa e o catálogo mantendo CRLF", () => {
  const texto = ficha({ etapas: [livre()] }).replace(/\n/g, "\r\n");
  const etapa = lerFicha(texto).etapas[0];
  const novo = trocarLinha(texto, etapa.indice, linhaDeTabela(celulasEtapa(etapa, { status: "em-andamento", responsavel: "ana", branch: "ci-spec-01-e01-x", desde: "2026-11-27" })));
  assert.ok(novo.includes("| E01 | Título | infra | em-andamento | ana | `ci-spec-01-e01-x` | — | 2026-11-27 |\r\n"));
  assert.equal(novo.split("\r\n").length, texto.split("\r\n").length);
  const lido = lerFicha(novo).etapas[0];
  assert.equal(lido.branch, "ci-spec-01-e01-x");

  const cat = catalogo().replace(/\n/g, "\r\n");
  const atualizado = catalogoAtualizado(cat, lerCatalogo(cat), new Map([["SPEC-01", { situacao: "🔴 Bloqueada (SPEC-03)", progresso: "sem plano" }]]), "novo resumo");
  assert.equal(lerCatalogo(atualizado).specs[0].situacao, "🔴 Bloqueada (SPEC-03)");
  assert.equal(lerCatalogo(atualizado).specs[1].situacao, "⚪ Incorporada");
  assert.equal(lerCatalogo(atualizado).resumo, "novo resumo");
  assert.ok(!/[^\r]\n/.test(atualizado), "mantém CRLF");
});

test("rótulo de PR e data local", () => {
  assert.equal(rotuloPr(PR), `[nord-tool-backend#12](${PR})`);
  assert.equal(hoje(new Date(2026, 10, 26, 23, 30)), "2026-11-26");
});

const decisoes = perguntas => `# SPEC-01 — Decisões

## Tomadas no plano de origem

### D1 — algo

- **Decisão:** x

## Perguntas ao responsável

${perguntas.map(([id, decidirEm, resposta]) => `### ${id} — Pergunta ${id}\n\n- **Recomendação:** r\n- **Decidir em:** ${decidirEm}\n- **Resposta:** ${resposta}\n`).join("\n")}`;

const planoOk = ids => ids.map(id => `## ${id} — Etapa\n\n**Feito pela IA:**\n\n- código\n\n**Ação humana:** nenhuma\n`).join("\n");

test("plano: cada etapa separa o que a IA faz da ação humana", () => {
  assert.deepEqual(validarResponsabilidades(planoOk(["E01", "E02"]), ["E01", "E02"]), []);
  const plano = "## E01 — A\n\n**Feito pela IA:**\n\n- x\n\n## E02 — B\n\n**Feito pela IA:**\n\n**Ação humana:**\n\n## Riscos\n\n**Ação humana:** nenhuma";
  const erros = validarResponsabilidades(plano, ["E01", "E02", "E03"]).join("\n");
  assert.match(erros, /E01: falta "\*\*Ação humana:\*\*"/);
  assert.match(erros, /E02: "\*\*Feito pela IA:\*\*" está vazio/);
  assert.match(erros, /E02: "\*\*Ação humana:\*\*" está vazio/);
  assert.match(erros, /E03: falta a seção/);
});

test("perguntas: lê a seção com recomendação, prazo e resposta", () => {
  const ps = lerPerguntas(decisoes([["P1", "antes da aprovação", "sim (2026-11-26, zzNICK)"], ["P2", "E01", "pendente"]]));
  assert.deepEqual(ps.map(p => [p.id, p.decidirEm, p.resposta]), [["P1", "antes da aprovação", "sim (2026-11-26, zzNICK)"], ["P2", "E01", "pendente"]]);
  assert.equal(lerPerguntas("# sem seção"), null);
});

test("planejamento: spec com etapas exige plano.md e perguntas ao responsável", () => {
  const f = lerFicha(ficha({ plano: "pendente", etapas: [livre()] }));
  const erros = validarPlanejamento(f, "SPEC-01-regras", { plano: null, decisoes: "# sem perguntas" }).join("\n");
  assert.match(erros, /plano\.md: obrigatório/);
  assert.match(erros, /falta a seção "Perguntas ao responsável"/);
  assert.match(validarPlanejamento(f, "SPEC-01-regras", { plano: planoOk(["E01"]), decisoes: decisoes([]) }).join("\n"), /ao menos uma pergunta/);
  assert.deepEqual(validarPlanejamento(lerFicha(ficha({ plano: "pendente", etapas: [] })), "SPEC-01-regras", { plano: null, decisoes: null }), [], "spec ainda sem plano não é cobrada");
});

test("planejamento: aprovação e etapa exigem as respostas no prazo", () => {
  const aprovada = lerFicha(ficha({ etapas: [andando("E01"), livre("E02")] }));
  const erros = validarPlanejamento(aprovada, "SPEC-01-regras", { plano: planoOk(["E01", "E02"]), decisoes: decisoes([["P1", "antes da aprovação", "pendente"], ["P2", "E01", "pendente"], ["P3", "E02", "pendente"], ["P4", "E09", "pendente"]]) }).join("\n");
  assert.match(erros, /P1: o plano foi aprovado, mas esta pergunta/);
  assert.match(erros, /E01: a etapa está em-andamento, mas a pergunta P2/);
  assert.doesNotMatch(erros, /P3/, "E02 ainda está planejada");
  assert.match(erros, /P4: "- \*\*Decidir em:\*\*" deve ser/);
  const ok = validarPlanejamento(aprovada, "SPEC-01-regras", { plano: planoOk(["E01", "E02"]), decisoes: decisoes([["P1", "antes da aprovação", "sim"], ["P2", "E01", "não"], ["P3", "E02", "pendente"]]) });
  assert.deepEqual(ok, []);
});

test("pegar: recusa etapa com pergunta sem resposta e sugere montar o plano", () => {
  const f = lerFicha(ficha({ etapas: [livre("E01")] }));
  const perguntas = lerPerguntas(decisoes([["P1", "E01", "pendente"]]));
  assert.match(motivoParaNaoPegar({ fichaDevelop: f, fichaLocal: f, idEtapa: "E01", perguntas }), /precisa responder P1/);
  const semPlano = lerFicha(ficha({ plano: "pendente", etapas: [] }));
  assert.match(motivoParaNaoPegar({ fichaDevelop: semPlano, idEtapa: "E01" }), /monte o plano\.md, as etapas e as perguntas.*planejar SPEC-01$/);
});
test("planejar: recusa concluída, incorporada e spec que já tem plano; libera a em aberto", () => {
  const linha = situacao => ({ situacao });
  const semPlano = lerFicha(ficha({ plano: "pendente", etapas: [] }));
  assert.equal(motivoParaNaoPlanejar({ idSpec: "SPEC-01", spec: linha("🟡 Em aberto"), fichaDevelop: semPlano, temPlano: false }), null);
  assert.equal(motivoParaNaoPlanejar({ idSpec: "SPEC-01", spec: linha("🔴 Bloqueada (SPEC-03)"), fichaDevelop: semPlano, temPlano: false }), null, "bloqueada pode ser planejada");
  assert.match(motivoParaNaoPlanejar({ idSpec: "SPEC-01", spec: linha("🟢 Concluída (implementada)"), fichaDevelop: lerFicha(ficha({ etapas: [pronta()] })), temPlano: true }), /já está concluída/);
  assert.match(motivoParaNaoPlanejar({ idSpec: "SPEC-16", spec: linha("⚪ Incorporada"), fichaDevelop: null }), /não há o que planejar/);
  assert.match(motivoParaNaoPlanejar({ idSpec: "SPEC-01", spec: linha("🟡 Em aberto"), fichaDevelop: lerFicha(ficha({ plano: "pendente", etapas: [livre()] })), temPlano: true }), /esperando a aprovação/);
  assert.match(motivoParaNaoPlanejar({ idSpec: "SPEC-01", spec: linha("🟡 Em aberto"), fichaDevelop: lerFicha(ficha({ etapas: [livre()] })), temPlano: true }), /já tem plano aprovado/);
  assert.match(motivoParaNaoPlanejar({ idSpec: "SPEC-99", spec: undefined }), /não está no painel/);
});

test("planejar: roteiro com branch, perguntas e parada antes do código", () => {
  assert.equal(branchDoPlano("SPEC-03"), "docs-spec-03-plano");
  const roteiro = roteiroDoPlano({ idSpec: "SPEC-03", pasta: "SPEC-03-plataforma", branch: "docs-spec-03-plano" });
  assert.match(roteiro, /Perguntas ao responsável/);
  assert.match(roteiro, /Não escreva código/);
  assert.match(roteiro, /specs\/SPEC-03-plataforma\/plano\.md/);
});

test("planejamento: trecho do modelo esquecido no plano é erro", () => {
  const f = lerFicha(ficha({ plano: "pendente", etapas: [livre()] }));
  const erros = validarPlanejamento(f, "SPEC-01-regras", { plano: "## E01 — <título>\n- <risco e como reduzir>", decisoes: decisoes([["P1", "E01", "pendente"]]) }).join("\n");
  assert.match(erros, /plano\.md: ainda tem trechos do modelo para preencher: <risco e como reduzir>, <título>/);
});