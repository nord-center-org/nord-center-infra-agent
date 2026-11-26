// Testes das funções puras do registro de specs: node --test scripts/specs/lib.test.mjs
import assert from "node:assert/strict";
import { test } from "node:test";
import {
  catalogoAtualizado, celulas, celulasEtapa, conflitosComOutrosPrs, erroBranchEtapa, etapaDaBranch, hoje, lerCatalogo, lerFicha,
  linhaDeTabela, motivoParaNaoPegar, reservasDoPr, rotuloPr, statusDaSpec, trocarLinha, validarCatalogo, validarFicha, validarTransicoes,
} from "./lib.mjs";

const PR = "https://github.com/nord-center-org/nord-tool-backend/pull/12";

function ficha({ plano = "aprovado 2026-11-27 por zzNICK", tipo = "implementacao", etapas }) {
  const linhas = etapas.map(e => `| ${e.join(" | ")} |`).join("\n");
  return `# SPEC-01 — Regras

| Campo | Valor |
|---|---|
| ID | SPEC-01 |
| Tipo | ${tipo} |
| Prioridade | P0 |
| Plano | ${plano} |
| Responsável pela spec | zzNICK |
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

const catalogo = (status = "planejada", pasta = "[SPEC-01-regras](SPEC-01-regras/README.md)") => `# Catálogo

| ID | Spec | Tipo | Prioridade | No MVP | Status | Pasta |
|---|---|---|---|---|---|---|
| SPEC-01 | Regras | implementacao | P0 | item 2 | ${status} | ${pasta} |
| SPEC-16 | Doc | implementacao | — | não | incorporada | — |
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

test("catálogo: status diferente do calculado e pasta inexistente são erros", () => {
  const atual = estado(catalogo("implementada"), ficha({ etapas: [andando()] }));
  assert.match(validarCatalogo(atual.catalogo, atual.fichas).erros.join("\n"), /Status implementada, mas as etapas dizem em-andamento/);
  const semPasta = estado(catalogo(), null);
  assert.match(validarCatalogo(semPasta.catalogo, semPasta.fichas).erros.join("\n"), /não existe ou não tem README/);
  const certo = estado(catalogo("em-andamento"), ficha({ etapas: [andando()] }));
  assert.deepEqual(validarCatalogo(certo.catalogo, certo.fichas).erros, []);
});

test("catálogo: spec sem pasta só planejada ou incorporada; pasta órfã é erro", () => {
  const texto = catalogo("em-andamento", "—");
  const { erros } = validarCatalogo(lerCatalogo(texto), new Map([["SPEC-02-outra", lerFicha(ficha({ etapas: [livre()] }))]]));
  assert.match(erros.join("\n"), /spec sem pasta só pode estar planejada ou incorporada/);
  assert.match(erros.join("\n"), /SPEC-02-outra\/: pasta sem linha no catálogo/);
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

  const cat = catalogo();
  const atualizado = catalogoAtualizado(cat, lerCatalogo(cat), new Map([["SPEC-01", "em-andamento"]]));
  assert.equal(lerCatalogo(atualizado).specs[0].status, "em-andamento");
  assert.equal(lerCatalogo(atualizado).specs[1].status, "incorporada");
});

test("rótulo de PR e data local", () => {
  assert.equal(rotuloPr(PR), `[nord-tool-backend#12](${PR})`);
  assert.equal(hoje(new Date(2026, 10, 26, 23, 30)), "2026-11-26");
});
