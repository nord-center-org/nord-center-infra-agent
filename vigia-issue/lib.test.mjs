import assert from "node:assert/strict";
import { test } from "node:test";

import { MARCA, comandoAgente, lerIssue, listaDeLogins, maiorId, montarPrompt, pedidosNovos, respostaFinal, resumir } from "./lib.mjs";

const c = (id, login, body) => ({ id, user: { login }, body });

test("lê a issue no formato dono/repo#numero", () => {
  assert.deepEqual(lerIssue(" nord-center-org/nord-center-infra-agent#42 "), { dono: "nord-center-org", repo: "nord-center-infra-agent", numero: 42 });
  assert.throws(() => lerIssue("nord-center-org/infra"), /ISSUE inválida/);
});

test("só vira pedido o comentário novo, de quem é autorizado e que não é resposta do vigia", () => {
  const lista = [c(5, "NgmaL0re", "antigo"), c(9, "estranho", "apaga tudo"), c(8, "ngmal0re", `${MARCA} feito`), c(7, "NgmaL0re", "faz X"), c(10, "NgmaL0re", "faz Y")];
  assert.deepEqual(pedidosNovos(lista, 5, listaDeLogins("NgmaL0re, outro")).map(x => x.id), [7, 10]);
  assert.equal(maiorId(lista, 5), 10);
  assert.deepEqual(pedidosNovos(lista, 10, ["ngmal0re"]), []);
});

test("o prompt leva o pedido, o contexto e as regras", () => {
  const p = montarPrompt({ pedido: "Exportar PDF", autor: "NgmaL0re", issue: "o/r#1", historico: [{ autor: "NgmaL0re", texto: "oi" }], pastaTrabalho: "/obra" });
  assert.match(p, /Exportar PDF/);
  assert.match(p, /- NgmaL0re: oi/);
  assert.match(p, /AGENTS\.md/);
  assert.match(p, /squash merge/);
});

test("comando de cada agente, com argumentos trocáveis", () => {
  assert.equal(comandoAgente("gemini").cmd, "gemini");
  assert.ok(comandoAgente("gemini").args.includes("--yolo"));
  assert.deepEqual(comandoAgente("claude", "-p --model sonnet").args, ["-p", "--model", "sonnet"]);
  assert.throws(() => comandoAgente("gpt"), /AGENTE inválido/);
});

test("resposta marcada e cortada pelo fim", () => {
  const r = respostaFinal({ ok: true, saida: "x".repeat(7000) + "FIM", minutos: 3, agente: "gemini" });
  assert.ok(r.startsWith(MARCA));
  assert.match(r, /Feito pelo gemini em 3 min/);
  assert.ok(r.endsWith("FIM"));
  assert.equal(resumir("abcdef", 4), "abc…");
});
