/* eslint-disable no-undef */
// Biblioteca que roda DENTRO do Newman/Postman (sandbox). O gerador grava este arquivo na variável `nordLib`
// da collection e cada script faz `eval(pm.collectionVariables.get('nordLib'))` antes de usar `nord`.
// Nada de token, senha ou dado pessoal aqui: credenciais vêm do environment montado pelo newman-run.ps1.
var nord = (function () {
  var cache = {};

  function variavel(nome) {
    var v = pm.variables.get(nome);
    return v === undefined || v === null ? "" : String(v);
  }

  function guardar(nome, valor) {
    pm.collectionVariables.set(nome, valor === undefined || valor === null ? "" : valor);
  }

  function contratos() {
    if (!cache.contratos) cache.contratos = JSON.parse(pm.collectionVariables.get("nordContratos") || "{}");
    return cache.contratos;
  }

  function json() {
    if (!("json" in cache)) {
      try { cache.json = pm.response.json(); } catch (e) { cache.json = undefined; }
    }
    return cache.json;
  }

  function body() {
    var j = json();
    return j && typeof j === "object" && "body" in j ? j.body : j;
  }

  function texto() {
    try { return pm.response.text() || ""; } catch (e) { return ""; }
  }

  function ehJson() {
    var ct = String(pm.response.headers.get("Content-Type") || "");
    return /json/i.test(ct) || json() !== undefined;
  }

  // ------------------------------------------------------------------ contrato OpenAPI
  function validarSchema(op, alvo) {
    var c = contratos();
    var nome = c.respostas && c.respostas[op];
    if (!nome) return null;
    var Ajv = require("ajv");
    var ajv = new Ajv({ allErrors: true, unknownFormats: "ignore", schemaId: "auto", jsonPointers: true });
    var schema = { definitions: c.schemas, $ref: "#/definitions/" + nome };
    var ok = ajv.validate(schema, alvo);
    if (ok) return [];
    return (ajv.errors || []).slice(0, 6).map(function (e) {
      return (e.dataPath || "(raiz)") + " " + e.message + (e.params && e.params.type ? " (" + e.params.type + ")" : "");
    });
  }

  // ------------------------------------------------------------------ o que o front lê
  function conferirForma(valor, forma, caminho, erros, avisos) {
    if (!forma || forma.k === "any" || forma.k === "map" || forma.k === "blob") return;
    if (valor === null || valor === undefined) {
      if (!forma.nulo && !forma.opcional) avisos.push(caminho + " veio " + (valor === null ? "null" : "ausente") + " e o tipo do front não aceita");
      return;
    }
    if (forma.k === "string" || forma.k === "number" || forma.k === "boolean") {
      if (typeof valor !== forma.k) { erros.push(caminho + ": front espera " + forma.k + ", veio " + typeof valor); return; }
      if (forma.valores && forma.valores.indexOf(valor) < 0) erros.push(caminho + ": valor '" + valor + "' fora do que o front conhece (" + forma.valores.join(", ") + ")");
      return;
    }
    if (forma.k === "array") {
      if (!Array.isArray(valor)) { erros.push(caminho + ": front espera lista, veio " + typeof valor); return; }
      for (var i = 0; i < Math.min(valor.length, 3); i++) conferirForma(valor[i], forma.item, caminho + "[" + i + "]", erros, avisos);
      return;
    }
    if (forma.k === "object") {
      if (typeof valor !== "object" || Array.isArray(valor)) { erros.push(caminho + ": front espera objeto, veio " + (Array.isArray(valor) ? "lista" : typeof valor)); return; }
      var campos = forma.campos || {};
      Object.keys(campos).forEach(function (k) { conferirForma(valor[k], campos[k], caminho + "." + k, erros, avisos); });
    }
  }

  // ------------------------------------------------------------------ verificação padrão
  // spec: { op, status: 200 | [200, 201], erro: 'CD_ERRO', schema: true, front: true, faltando: [], binario: false }
  function verificar(spec) {
    var op = spec.op;
    var esperados = [].concat(spec.status || 200);
    var codigo = pm.response.code;
    var sucesso = codigo >= 200 && codigo < 300;
    var limite = Number(spec.tempo || variavel("tempoMaximoMs") || 10000);
    var envelope = spec.envelope !== false;

    pm.test("[" + op + "] status " + esperados.join(" ou "), function () {
      pm.expect(esperados, "veio " + codigo + ": " + texto().slice(0, 300)).to.include(codigo);
    });
    pm.test("[" + op + "] responde em até " + limite + " ms", function () {
      pm.expect(pm.response.responseTime).to.be.below(limite);
    });

    if (codigo === 204 || codigo === 304) {
      pm.test("[" + op + "] " + codigo + " sem corpo", function () { pm.expect(texto().trim()).to.eql(""); });
      return;
    }

    if (sucesso && spec.binario) {
      pm.test("[" + op + "] devolve conteúdo binário", function () {
        pm.expect(pm.response.responseSize, "corpo vazio").to.be.above(0);
        pm.expect(String(pm.response.headers.get("Content-Type") || "")).to.not.match(/json/i);
      });
      return;
    }

    if (!ehJson()) {
      if (spec.texto) return;
      pm.test("[" + op + "] devolve JSON", function () { pm.expect.fail("Content-Type " + pm.response.headers.get("Content-Type")); });
      return;
    }
    var j = json();

    if (envelope) {
      pm.test("[" + op + "] envelope: nrStatus igual ao HTTP, timestamp e txMensagem", function () {
        pm.expect(j, "resposta não é objeto").to.be.an("object");
        pm.expect(j.nrStatus).to.eql(codigo);
        pm.expect(j.timestamp, "timestamp").to.be.a("string");
        pm.expect(j.txMensagem, "txMensagem").to.be.a("string");
      });
    }

    if (!sucesso) {
      pm.test("[" + op + "] erro no formato padrão: cdErro" + (spec.erro ? " = " + spec.erro : "") + ", idCorrelacao e sem body", function () {
        pm.expect(j.cdErro, "cdErro").to.be.a("string").and.not.empty;
        if (spec.erro) pm.expect([].concat(spec.erro), "cdErro veio " + j.cdErro + ": " + j.txMensagem).to.include(j.cdErro);
        pm.expect(j.idCorrelacao, "idCorrelacao").to.be.a("string").and.not.empty;
        pm.expect(j.body === null || j.body === undefined, "erro não devolve body").to.eql(true);
      });
      pm.test("[" + op + "] erro sem detalhe técnico (stack trace, classe, SQL)", function () {
        pm.expect(texto()).to.not.match(/\bat (br\.com|org\.|java\.)|Exception|SQLState|org\.hibernate|could not execute/i);
      });
      return;
    }

    if (spec.schema !== false) {
      var problemas = validarSchema(op, j);
      if (problemas) {
        pm.test("[" + op + "] contrato OpenAPI da resposta", function () {
          pm.expect(problemas, problemas.join("; ")).to.be.empty;
        });
      }
    }

    if (spec.front !== false) {
      var formas = (contratos().front || {})[op] || [];
      if (formas.length) {
        var erros = [], avisos = [];
        formas.forEach(function (f) { conferirForma(body(), f.forma, "body", erros, avisos); });
        pm.test("[" + op + "] campos que o front lê (" + formas.map(function (f) { return f.tipo; }).join(", ") + ")", function () {
          pm.expect(erros, erros.slice(0, 6).join("; ")).to.be.empty;
        });
        if (avisos.length) console.warn("[front] " + op + ": " + avisos.slice(0, 5).join("; "));
      }
      if (spec.faltando && spec.faltando.length) {
        pm.test("[" + op + "] o backend declara todos os campos que o front lê", function () {
          pm.expect(spec.faltando, "o front lê e o OpenAPI não tem: " + spec.faltando.join(", ")).to.be.empty;
        });
      }
    }
  }

  function regra(nome, fn) {
    pm.test("regra: " + nome, fn);
  }

  function pular(motivo) {
    console.log("[pulado] " + pm.info.requestName + ": " + motivo);
    pm.execution.skipRequest();
  }

  function achar(lista, pred) {
    return (lista || []).filter(pred)[0];
  }

  function uuid() {
    return require("uuid").v4();
  }

  function hoje(deltaDias) {
    var d = new Date(Date.now() + (deltaDias || 0) * 86400000);
    return d.toISOString().slice(0, 10);
  }

  return {
    variavel: variavel, guardar: guardar, json: json, body: body, texto: texto, verificar: verificar, regra: regra,
    pular: pular, achar: achar, uuid: uuid, hoje: hoje, contratos: contratos,
  };
})();
