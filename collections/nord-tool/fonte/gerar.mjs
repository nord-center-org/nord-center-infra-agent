#!/usr/bin/env node
// =============================================================================
// gerar.mjs - Monta a collection única do NordTool (Postman v2.1, para o Newman)
//   a partir de:
//     contrato/openapi.json   rotas e schemas que o backend declara
//     contrato/status.json    status de sucesso que cada controller devolve
//     contrato/front.json     o que cada service do front chama e lê
//     fonte/dominios/*.mjs    as requisições e regras de negócio de cada domínio
//   e grava:
//     nord-tool.postman_collection.json   (não editar à mão: rode este script)
//     cobertura.md                        rota x requisições x regras x front
//
// Falha (código 1) se alguma operação do OpenAPI ficar sem requisição, se uma
// requisição citar uma operação que não existe ou se um arquivo de teste faltar.
//
// USO: node collections/nord-tool/fonte/gerar.mjs [--verificar]
//   --verificar  só confere a cobertura e se a collection gravada está atualizada
// =============================================================================
import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const AQUI = path.dirname(fileURLToPath(import.meta.url));
const PASTA = path.resolve(AQUI, "..");
const PREFIXO = "/api/v1/nord-tool";
// O checkout no Windows pode trazer CRLF: a collection gerada é sempre igual, com LF.
const lerTexto = (arquivo) => readFileSync(arquivo, "utf8").replace(/\r\n/g, "\n");
const ler = (rel) => JSON.parse(readFileSync(path.join(PASTA, rel), "utf8"));

const openapi = ler("contrato/openapi.json");
const statusReal = existsSync(path.join(PASTA, "contrato/status.json")) ? ler("contrato/status.json") : {};
const front = existsSync(path.join(PASTA, "contrato/front.json")) ? ler("contrato/front.json") : { chamadas: [] };
const libSandbox = lerTexto(path.join(AQUI, "lib/nord.js"));
const scriptColecao = lerTexto(path.join(AQUI, "lib/colecao-pre.js"));

// -----------------------------------------------------------------------------
// Operações do OpenAPI
// -----------------------------------------------------------------------------
const operacoes = new Map();
for (const [rotaCheia, metodos] of Object.entries(openapi.paths)) {
  const rota = rotaCheia.startsWith(PREFIXO) ? rotaCheia.slice(PREFIXO.length) : rotaCheia;
  for (const [m, op] of Object.entries(metodos)) {
    const chave = `${m.toUpperCase()} ${rota}`;
    // Resposta de sucesso documentada: 200, 201 ou 204 (com @ResponseStatus o OpenAPI passa a dizer o código real).
    const sucesso = ["200", "201", "204"].find((c) => op.responses?.[c]);
    const schema = sucesso && Object.values(op.responses[sucesso].content || {})[0]?.schema;
    operacoes.set(chave, { chave, rotaCheia, rota, metodo: m.toUpperCase(), op, tag: op.tags?.[0] || "?", resposta: schema, requisicoes: [] });
  }
}

// -----------------------------------------------------------------------------
// Schemas das respostas (OpenAPI 3.0 -> JSON Schema draft-07 para o ajv do sandbox)
// -----------------------------------------------------------------------------
const componentes = openapi.components?.schemas || {};
const usados = new Set();
const respostas = {};
for (const o of operacoes.values()) {
  const s = o.resposta;
  if (!s) continue;
  if (s.$ref) { const nome = s.$ref.split("/").pop(); respostas[o.chave] = nome; marcar(nome); }
}
function marcar(nome) {
  if (usados.has(nome) || !componentes[nome]) return;
  usados.add(nome);
  JSON.stringify(componentes[nome], (k, v) => { if (k === "$ref") marcar(v.split("/").pop()); return v; });
}
const schemas = {};
for (const nome of [...usados].sort()) schemas[nome] = nome === "JsonNode" ? {} : converter(componentes[nome], nome.startsWith("ApiResponseBody"));

function converter(s, envelope) {
  const r = conv(s);
  if (envelope) r.required = ["timestamp", "nrStatus", "txMensagem"];
  return r;
  function conv(x) {
    if (!x || typeof x !== "object") return x;
    if (x.$ref) return { $ref: "#/definitions/" + x.$ref.split("/").pop() };
    const out = {};
    for (const [k, v] of Object.entries(x)) {
      if (["format", "example", "exclusiveMinimum", "exclusiveMaximum", "description", "pattern", "minLength", "maxLength", "minimum", "maximum", "minItems", "maxItems", "required"].includes(k)) continue;
      if (k === "properties") out.properties = Object.fromEntries(Object.entries(v).map(([pk, pv]) => [pk, anulavel(conv(pv))]));
      else if (k === "items") out.items = anulavel(conv(v));
      else if (k === "additionalProperties" && typeof v === "object") out.additionalProperties = anulavel(conv(v));
      else out[k] = v;
    }
    return out;
  }
  // O backend serializa campo nulo (e o NON_NULL o omite): todo campo aceita null.
  function anulavel(x) {
    if (x.$ref) return x.$ref.endsWith("/JsonNode") ? x : { anyOf: [x, { type: "null" }] };
    if (typeof x.type === "string") return { ...x, type: [x.type, "null"] };
    return x;
  }
}

// -----------------------------------------------------------------------------
// O que o front lê, por operação, e o que ele lê que o OpenAPI não declara
// -----------------------------------------------------------------------------
const frontPorOp = {};
const semRotaNoBackend = [];
for (const c of front.chamadas) {
  if (!c.operacao) { semRotaNoBackend.push(c); continue; }
  if (!c.forma || ["any", "blob", "map"].includes(c.forma.k)) continue;
  const lista = (frontPorOp[c.operacao] ||= []);
  if (!lista.some((f) => JSON.stringify(f.forma) === JSON.stringify(c.forma))) lista.push({ tipo: c.tipo, forma: c.forma });
}
const faltandoPorOp = {};
for (const [chave, formas] of Object.entries(frontPorOp)) {
  const o = operacoes.get(chave);
  if (!o?.resposta?.$ref) continue;
  const env = componentes[o.resposta.$ref.split("/").pop()];
  const alvo = env?.properties?.body;
  const faltas = new Set();
  for (const f of formas) comparar(f.forma, alvo, "body", faltas);
  if (faltas.size) faltandoPorOp[chave] = [...faltas];
}
function resolver(s) {
  let x = s;
  for (let i = 0; x?.$ref && i < 10; i++) x = componentes[x.$ref.split("/").pop()];
  return x;
}
function comparar(forma, schema, caminho, faltas) {
  const s = resolver(schema);
  if (!forma || !s) return;
  if (forma.k === "array") { if (s.type === "array") comparar(forma.item, s.items, caminho + "[]", faltas); return; }
  if (forma.k !== "object" || !forma.campos || !s.properties) return;
  for (const [nome, f] of Object.entries(forma.campos)) {
    if (!(nome in s.properties)) { if (!f.opcional) faltas.add(`${caminho}.${nome}`); continue; }
    comparar(f, s.properties[nome], `${caminho}.${nome}`, faltas);
  }
}

// -----------------------------------------------------------------------------
// Domínios
// -----------------------------------------------------------------------------
const pastaDominios = path.join(AQUI, "dominios");
const dominios = [];
for (const f of readdirSync(pastaDominios).filter((x) => x.endsWith(".mjs")).sort()) {
  const mod = await import(pathToFileURL(path.join(pastaDominios, f)).href);
  dominios.push({ arquivo: f, ...mod.default });
}

const problemas = [];
const regrasPorOp = {};
const itens = dominios.map((d) => montarPasta(d, d.arquivo, []));

function montarPasta(p, arquivo, trilha) {
  const nomes = [...trilha, p.nome];
  return {
    name: p.nome,
    description: p.descricao || "",
    item: p.itens.map((i) => (i.tipo === "pasta" ? montarPasta(i, arquivo, nomes) : montarReq(i, arquivo, nomes))),
  };
}

function montarReq(r, arquivo, trilha) {
  const o = operacoes.get(r.op);
  if (!o) { problemas.push(`${arquivo}: "${r.nome}" cita ${r.op}, que não existe no OpenAPI`); return { name: r.nome, request: { method: "GET", url: "" } }; }
  const prefixo = o.rotaCheia.startsWith(PREFIXO) ? PREFIXO : "";
  const rota = r.url ?? o.rota.replace(/\{(\w+)\}/g, "{{$1}}");
  if (/\{(?!\{)\w+\}/.test(rota.replace(/\{\{\w+\}\}/g, ""))) problemas.push(`${arquivo}: "${r.nome}" tem parâmetro sem valor na URL (${rota})`);
  let url = `{{baseUrl}}${prefixo}${rota}`;
  if (r.query) url += "?" + Object.entries(r.query).map(([k, v]) => `${encodeURIComponent(k)}=${codificar(v)}`).join("&");

  const sucesso = statusReal[r.op] ?? 200;
  const status = r.status ?? sucesso;
  const esperados = [].concat(status);
  const deSucesso = esperados.some((s) => s >= 200 && s < 300);
  o.requisicoes.push({ nome: r.nome, pasta: trilha.join(" / "), status: esperados, auth: r.auth || "admin" });
  for (const [nome] of r.regras || []) (regrasPorOp[r.op] ||= []).push(nome);

  const header = [{ key: "Accept", value: "application/json, */*" }];
  if (!r.semContexto) header.push({ key: "X-Obra", value: "{{idObra}}" }, { key: "X-Fase", value: "{{idFase}}" });
  for (const [k, v] of Object.entries(r.headers || {})) header.push({ key: k, value: v });

  const request = { method: o.metodo, header, url, description: descricaoReq(o, r, esperados) };
  if (r.auth === "nenhum") request.auth = { type: "noauth" };
  else if (r.auth === "usuario") request.auth = { type: "bearer", bearer: [{ key: "token", value: "{{tokenUsuario}}", type: "string" }] };
  else if (r.auth && r.auth.startsWith("{{")) request.auth = { type: "bearer", bearer: [{ key: "token", value: r.auth, type: "string" }] };

  if (r.corpo !== undefined) {
    const raw = typeof r.corpo === "string" ? r.corpo : JSON.stringify(r.corpo, null, 2).replace(/"__cru__([\s\S]*?)__fim__"/g, (_, v) => v.replace(/\\"/g, '"'));
    request.body = { mode: "raw", raw, options: { raw: { language: "json" } } };
    header.push({ key: "Content-Type", value: "application/json" });
  } else if (r.form) {
    request.body = {
      mode: "formdata",
      formdata: Object.entries(r.form).flatMap(([k, v]) => [].concat(v).map((x) => (x && x.__arquivo ? { key: k, type: "file", src: arquivoTeste(x.__arquivo, arquivo) } : { key: k, value: String(x), type: "text" }))),
    };
  } else if (r.arquivo) {
    request.body = { mode: "file", file: { src: arquivoTeste(r.arquivo.__arquivo, arquivo) } };
    header.push({ key: "Content-Type", value: "application/octet-stream" });
  }

  const spec = { op: r.op, status: esperados.length === 1 ? esperados[0] : esperados };
  if (r.erro) spec.erro = r.erro;
  if (r.schema === false) spec.schema = false;
  if (r.front === false) spec.front = false;
  if (r.binario) spec.binario = true;
  if (r.texto) spec.texto = true;
  if (r.tempoMaximoMs) spec.tempo = r.tempoMaximoMs;
  if (r.envelope === false || o.chave === "GET /nord-tool/health") spec.envelope = false;
  if (deSucesso && faltandoPorOp[r.op]) spec.faltando = faltandoPorOp[r.op];

  const pre = ["eval(pm.collectionVariables.get('nordLib'));"];
  let se = r.se, motivo = r.motivo;
  if (r.auth === "usuario") { se = se ? `nord.variavel('tokenUsuario') && (${se})` : "nord.variavel('tokenUsuario')"; motivo = motivo || "sem o usuário comum de teste (veja 00 Preparação)"; }
  if (se) pre.push(`if (!(${se})) { nord.pular(${JSON.stringify(motivo || "condição: " + se)}); } else {`);
  if (r.pre) pre.push(...linhas(r.pre));
  if (se) pre.push("}");

  const teste = ["eval(pm.collectionVariables.get('nordLib'));", `nord.verificar(${JSON.stringify(spec)});`, "var j = nord.json(); var b = nord.body();"];
  for (const [v, caminho] of Object.entries(r.guardar || {})) {
    teste.push(`try { nord.guardar(${JSON.stringify(v)}, ${caminho.startsWith("(") || caminho.includes("(") ? caminho : "j." + caminho}); } catch (e) { console.warn("não guardou ${v}: " + e.message); }`);
  }
  for (const [nome, codigo] of r.regras || []) teste.push(`nord.regra(${JSON.stringify(nome)}, function () { ${codigo} });`);
  if (r.testes) teste.push(...linhas(r.testes));

  return {
    name: r.nome,
    event: [
      { listen: "prerequest", script: { type: "text/javascript", exec: pre } },
      { listen: "test", script: { type: "text/javascript", exec: teste } },
    ],
    request,
  };
}

// Codifica o valor da query, mas deixa as variáveis {{x}} para o Newman resolver.
function codificar(v) {
  return String(v).split(/({{[^}]+}})/).map((p) => (p.startsWith("{{") ? p : encodeURIComponent(p))).join("");
}

function linhas(codigo) {
  return String(codigo).replace(/^\n+|\s+$/g, "").split("\n");
}

function arquivoTeste(nome, origem) {
  if (!existsSync(path.join(PASTA, "arquivos", nome))) problemas.push(`${origem}: arquivo de teste arquivos/${nome} não existe`);
  return `arquivos/${nome}`;
}

function descricaoReq(o, r, esperados) {
  const linhasDesc = [`**${o.metodo} ${o.rotaCheia}** — ${o.op.summary || o.op.operationId}`, "", `Espera: ${esperados.join(" ou ")}${r.erro ? ` (${[].concat(r.erro).join(" / ")})` : ""}.`];
  if (r.regras?.length) linhasDesc.push("", "Regras:", ...r.regras.map(([n]) => `- ${n}`));
  if (r.obs) linhasDesc.push("", r.obs);
  return linhasDesc.join("\n");
}

// -----------------------------------------------------------------------------
// Cobertura
// -----------------------------------------------------------------------------
const naoCobertas = [...operacoes.values()].filter((o) => !o.requisicoes.length);
for (const o of naoCobertas) problemas.push(`sem requisição: ${o.chave} (${o.tag})`);

const colecao = {
  info: {
    name: "NordTool API",
    description: lerTexto(path.join(AQUI, "lib/descricao.md")),
    schema: "https://schema.getpostman.com/json/collection/v2.1.0/collection.json",
  },
  auth: { type: "bearer", bearer: [{ key: "token", value: "{{token}}", type: "string" }] },
  event: [{ listen: "prerequest", script: { type: "text/javascript", exec: linhas(scriptColecao) } }],
  variable: [
    { key: "baseUrl", value: "http://localhost:8081" },
    { key: "tempoMaximoMs", value: "10000" },
    { key: "nordLib", value: libSandbox },
    { key: "nordContratos", value: JSON.stringify({ schemas, respostas, front: frontPorOp }) },
  ],
  item: itens,
};

const destino = path.join(PASTA, "nord-tool.postman_collection.json");
const conteudo = JSON.stringify(colecao, null, 2) + "\n";
const cobertura = montarCobertura();

if (problemas.length) {
  console.error(`[gerar] ${problemas.length} problema(s):\n  - ` + problemas.join("\n  - "));
  process.exit(1);
}
if (process.argv.includes("--verificar")) {
  const atual = existsSync(destino) ? lerTexto(destino) : "";
  if (atual !== conteudo) { console.error("[gerar] a collection gravada está desatualizada: rode node collections/nord-tool/fonte/gerar.mjs"); process.exit(1); }
  console.log("[gerar] collection atualizada e todas as operações cobertas.");
  process.exit(0);
}
writeFileSync(destino, conteudo);
writeFileSync(path.join(PASTA, "cobertura.md"), cobertura);
const totalReq = [...operacoes.values()].reduce((s, o) => s + o.requisicoes.length, 0);
console.log(`[gerar] ${operacoes.size} operações cobertas por ${totalReq} requisições em ${dominios.length} pastas -> ${path.relative(process.cwd(), destino)}`);

function montarCobertura() {
  const l = [];
  const ops = [...operacoes.values()];
  const usadasFront = new Set(front.chamadas.map((c) => c.operacao).filter(Boolean));
  const divergentes = ops.filter((o) => (statusReal[o.chave] ?? 200) !== 200);
  l.push("# Cobertura da collection NordTool API", "");
  l.push("> Gerado por `fonte/gerar.mjs` a partir de `contrato/` e `fonte/dominios/`. Não edite à mão.", "");
  l.push(`- Operações no OpenAPI: **${ops.length}**, todas com ao menos uma requisição (${ops.reduce((s, o) => s + o.requisicoes.length, 0)} requisições).`);
  l.push(`- Usadas pelo front (${front.ref} ${String(front.commit || "").slice(0, 7)}): **${ops.filter((o) => usadasFront.has(o.chave)).length}**; sem uso no front: ${ops.filter((o) => !usadasFront.has(o.chave)).length}.`);
  l.push(`- Campos que o front lê e o OpenAPI não declara: **${Object.values(faltandoPorOp).flat().length}** em ${Object.keys(faltandoPorOp).length} operações.`);
  l.push(`- Chamadas do front sem rota no backend: **${semRotaNoBackend.length}**.`);
  l.push(`- Operações cujo status real difere do OpenAPI (que declara 200 em tudo): **${divergentes.length}**.`, "");

  if (semRotaNoBackend.length) {
    l.push("## O front chama e o backend não tem", "", "| Método | Rota | Service | Função |", "|---|---|---|---|");
    for (const c of semRotaNoBackend) l.push(`| ${c.metodo} | \`${c.rota}\` | ${c.arquivo} | \`${c.funcao}\` |`);
    l.push("");
  }
  if (Object.keys(faltandoPorOp).length) {
    l.push("## O front lê e o OpenAPI não declara", "", "| Operação | Campos |", "|---|---|");
    for (const [k, v] of Object.entries(faltandoPorOp).sort()) l.push(`| \`${k}\` | ${v.map((x) => `\`${x}\``).join(", ")} |`);
    l.push("");
  }

  l.push("## Por domínio", "");
  const porTag = new Map();
  for (const o of ops) (porTag.get(o.tag) || porTag.set(o.tag, []).get(o.tag)).push(o);
  for (const [tag, lista] of [...porTag.entries()].sort((a, b) => a[0].localeCompare(b[0]))) {
    l.push(`### ${tag}`, "", "| Método | Rota | Status real | Requisições (status esperado) | Front | Regras |", "|---|---|---|---|---|---|");
    for (const o of lista.sort((a, b) => a.rota.localeCompare(b.rota) || a.metodo.localeCompare(b.metodo))) {
      const reqs = o.requisicoes.map((r) => `${r.nome} (${r.status.join("/")}${r.auth !== "admin" ? ", " + r.auth : ""})`).join("<br>");
      const fr = usadasFront.has(o.chave) ? "sim" : "—";
      const rg = (regrasPorOp[o.chave] || []).length;
      l.push(`| ${o.metodo} | \`${o.rota}\` | ${statusReal[o.chave] ?? 200} | ${reqs.replace(/\|/g, "\\|")} | ${fr} | ${rg || "—"} |`);
    }
    l.push("");
  }
  return l.join("\n") + "\n";
}
