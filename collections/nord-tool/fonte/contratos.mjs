#!/usr/bin/env node
// =============================================================================
// contratos.mjs - Atualiza os dois contratos que a collection do NordTool cobra:
//   contrato/openapi.json  o que o backend declara (GET /v3/api-docs do backend local)
//   contrato/front.json    o que o front espera: para cada chamada dos services,
//                          o metodo, a rota, a operacao do backend e os campos lidos
//
// O front e lido de um ref do git (default origin/develop), sem trocar a branch
// do checkout, e analisado com o compilador TypeScript do proprio front.
//
// USO (Node 20+, a partir da raiz da infra):
//   node collections/nord-tool/fonte/contratos.mjs [--backend http://localhost:8081]
//        [--front ../nord-tool-frontend] [--ref origin/develop] [--sem-backend] [--sem-front]
// Depois: node collections/nord-tool/fonte/gerar.mjs
// =============================================================================
import { execFileSync } from "node:child_process";
import { createRequire } from "node:module";
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const AQUI = path.dirname(fileURLToPath(import.meta.url));
const PASTA = path.resolve(AQUI, "..");
const CONTRATO = path.join(PASTA, "contrato");
const PREFIXO_API = "/api/v1/nord-tool";

const args = process.argv.slice(2);
const opt = (nome, padrao) => {
  const i = args.indexOf(`--${nome}`);
  return i >= 0 ? args[i + 1] : padrao;
};
const flag = (nome) => args.includes(`--${nome}`);

const backend = opt("backend", "http://localhost:8081").replace(/\/+$/, "");
const front = path.resolve(opt("front", path.resolve(PASTA, "../../../nord-tool-frontend")));
const ref = opt("ref", "origin/develop");

mkdirSync(CONTRATO, { recursive: true });

// -----------------------------------------------------------------------------
// 1. OpenAPI do backend
// -----------------------------------------------------------------------------
if (!flag("sem-backend")) {
  const resp = await fetch(`${backend}/v3/api-docs`);
  if (!resp.ok) throw new Error(`GET ${backend}/v3/api-docs respondeu ${resp.status} (o springdoc só sobe no profile local)`);
  const openapi = await resp.json();
  openapi.servers = [{ url: "{{baseUrl}}", description: "baseUrl da collection" }];
  writeFileSync(path.join(CONTRATO, "openapi.json"), JSON.stringify(ordenar(openapi), null, 2) + "\n");
  console.log(`[contratos] openapi.json: ${Object.keys(openapi.paths).length} rotas de ${backend}`);
}

// -----------------------------------------------------------------------------
// 1b. Status de sucesso que cada controller devolve de verdade (o OpenAPI declara 200 em tudo)
// -----------------------------------------------------------------------------
const backendSrc = path.resolve(opt("backend-src", path.resolve(PASTA, "../../../nord-tool-backend")));
if (!flag("sem-backend-src") && existsSync(path.join(backendSrc, "pom.xml"))) {
  const status = extrairStatus(backendSrc);
  writeFileSync(path.join(CONTRATO, "status.json"), JSON.stringify(status, null, 2) + "\n");
  console.log(`[contratos] status.json: ${Object.keys(status).length} operações lidas dos controllers de ${backendSrc}`);
}

function extrairStatus(raiz) {
  const base = path.join(raiz, "src/main/java/br/com/nord_tool_backend/controller");
  const res = {};
  for (const d of ["read", "write"]) {
    const pasta = path.join(base, d);
    if (!existsSync(pasta)) continue;
    for (const f of readdirSync(pasta).filter((x) => x.endsWith(".java"))) {
      const s = readFileSync(path.join(pasta, f), "utf8");
      const prefixo = (s.match(/@RequestMapping\(\s*(?:value\s*=\s*)?"([^"]*)"/) || [])[1] || "";
      const re = /@(Get|Post|Put|Delete|Patch)Mapping(?:\(([^)]*)\))?([\s\S]*?)(?=@(?:Get|Post|Put|Delete|Patch)Mapping|\n}\s*$)/g;
      let m;
      while ((m = re.exec(s))) {
        const sub = ((m[2] || "").match(/"([^"]*)"/) || [])[1] || "";
        const corpo = m[3];
        let st = /created\(/.test(corpo) ? 201 : /noContent\(/.test(corpo) ? 204 : 200;
        const rota = (prefixo + sub).replace(PREFIXO_API, "") || "/";
        res[`${m[1].toUpperCase()} ${rota}`] = st;
      }
    }
  }
  return Object.fromEntries(Object.keys(res).sort().map((k) => [k, res[k]]));
}

// -----------------------------------------------------------------------------
// 2. O que o front espera
// -----------------------------------------------------------------------------
if (!flag("sem-front")) {
  const openapi = JSON.parse(readFileSync(path.join(CONTRATO, "openapi.json"), "utf8"));
  const resultado = extrairFront(openapi);
  writeFileSync(path.join(CONTRATO, "front.json"), JSON.stringify(resultado, null, 2) + "\n");
  const semOp = resultado.chamadas.filter((c) => !c.operacao).length;
  console.log(`[contratos] front.json: ${resultado.chamadas.length} chamadas em ${resultado.arquivos.length} services (${ref} ${resultado.commit.slice(0, 7)}); ${semOp} sem rota no backend`);
}

// =============================================================================
function git(...a) {
  return execFileSync("git", ["-C", front, ...a], { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
}

function extrairFront(openapi) {
  if (!existsSync(path.join(front, "node_modules/typescript"))) {
    throw new Error(`TypeScript não encontrado em ${front}/node_modules (rode npm ci no front)`);
  }
  const ts = createRequire(path.join(front, "package.json"))("typescript");
  const commit = git("rev-parse", ref).trim();
  const listados = git("ls-tree", "-r", "--name-only", ref, "src").split("\n").filter((f) => /\.(ts|tsx)$/.test(f));
  const conteudo = new Map();
  const ler = (rel) => {
    if (!conteudo.has(rel)) conteudo.set(rel, git("show", `${ref}:${rel}`));
    return conteudo.get(rel);
  };
  const raizVirtual = path.join(front, "__ref__").replace(/\\/g, "/");
  const relDe = (f) => {
    const n = f.replace(/\\/g, "/");
    return n.startsWith(raizVirtual + "/") ? n.slice(raizVirtual.length + 1) : null;
  };
  const services = listados.filter((f) => f.startsWith("src/react-app/services/") && !/\.test\./.test(f));

  const opcoes = {
    target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.ESNext, moduleResolution: ts.ModuleResolutionKind.Bundler,
    jsx: ts.JsxEmit.ReactJSX, strict: true, noEmit: true, skipLibCheck: true, allowImportingTsExtensions: true,
    baseUrl: raizVirtual, paths: { "@/*": ["./src/*"] }, lib: ["lib.es2020.d.ts", "lib.dom.d.ts"], types: [],
  };
  const host = ts.createCompilerHost(opcoes);
  const original = { fileExists: host.fileExists, readFile: host.readFile, getSourceFile: host.getSourceFile };
  const listadosSet = new Set(listados);
  host.fileExists = (f) => { const r = relDe(f); return r ? listadosSet.has(r) : original.fileExists(f); };
  host.readFile = (f) => { const r = relDe(f); return r ? (listadosSet.has(r) ? ler(r) : undefined) : original.readFile(f); };
  host.getSourceFile = (f, v, onErr) => {
    const r = relDe(f);
    if (!r) return original.getSourceFile(f, v, onErr);
    return listadosSet.has(r) ? ts.createSourceFile(f, ler(r), v, true, f.endsWith("x") ? ts.ScriptKind.TSX : ts.ScriptKind.TS) : undefined;
  };
  host.directoryExists = (d) => { const r = relDe(d.endsWith("/") ? d : d + "/x"); return r !== null ? listados.some((f) => f.startsWith(path.posix.dirname(r) + "/")) : ts.sys.directoryExists(d); };
  host.getCurrentDirectory = () => raizVirtual;

  const programa = ts.createProgram(services.map((s) => `${raizVirtual}/${s}`), opcoes, host);
  const checker = programa.getTypeChecker();
  const operacoes = indexarOperacoes(openapi);
  const chamadas = [];

  for (const rel of services) {
    const sf = programa.getSourceFile(`${raizVirtual}/${rel}`);
    if (!sf) continue;
    const visitar = (no) => {
      if (ts.isCallExpression(no) && ts.isIdentifier(no.expression) && ["apiFetch", "apiBlob"].includes(no.expression.text)) {
        chamadas.push(...lerChamada(no, sf, rel));
      }
      ts.forEachChild(no, visitar);
    };
    visitar(sf);
  }
  chamadas.sort((a, b) => (a.operacao || "~").localeCompare(b.operacao || "~") || a.funcao.localeCompare(b.funcao));
  return { geradoEm: new Date().toISOString().slice(0, 10), ref, commit, arquivos: services, chamadas };

  // ---------------------------------------------------------------------------
  // Uma chamada apiFetch dentro de um helper genérico (rota ou tipo vindos de parâmetro) vira uma chamada por uso
  // do helper no mesmo arquivo, com o argumento e o tipo de cada uso.
  function lerChamada(call, sf, rel) {
    const fn = funcaoEnvolvente(call);
    const nomeFn = fn && nomeDaFuncao(fn);
    const params = fn ? fn.parameters.map((p) => checker.getSymbolAtLocation(p.name)).filter(Boolean) : [];
    const tParams = fn?.typeParameters?.map((t) => t.name.text) || [];
    const tipoNo = call.typeArguments?.[0];
    const usaParam = fn && (referencia(call.arguments[0], params) || (tipoNo && tParams.includes(tipoNo.getText(sf))));
    if (usaParam && nomeFn) {
      const usos = [];
      const visitar = (no) => {
        if (ts.isCallExpression(no) && ts.isIdentifier(no.expression) && no.expression.text === nomeFn && no !== call) usos.push(no);
        ts.forEachChild(no, visitar);
      };
      visitar(sf);
      if (usos.length) {
        return usos.flatMap((uso) => {
          const subst = new Map(params.map((s, i) => [s, uso.arguments[i]]));
          const tipoUso = tipoNo && tParams.includes(tipoNo.getText(sf)) ? uso.typeArguments?.[tParams.indexOf(tipoNo.getText(sf))] : tipoNo;
          return montar(call, sf, rel, subst, tipoUso, nomeFuncao(uso));
        });
      }
    }
    return montar(call, sf, rel, new Map(), tipoNo, nomeFuncao(call));
  }

  function montar(call, sf, rel, subst, tipoNo, funcao) {
    const [urlExpr, initExpr] = call.arguments;
    const urls = avaliar(urlExpr, sf, 0, subst);
    const metodoLido = initExpr ? metodos(initExpr, sf, subst) : null;
    const pares = [];
    // `id ? A : B` na URL e no método com a mesma condição: casa os dois lados.
    if (urls.cond && metodoLido?.cond && urls.cond === metodoLido.cond) {
      urls.lista.forEach((u, i) => pares.push([metodoLido.lista[i] || "GET", u]));
    } else {
      for (const u of urls.lista) for (const m of metodoLido?.lista?.length ? metodoLido.lista : ["GET"]) pares.push([m, u]);
    }
    const forma = call.expression.text === "apiBlob" ? { k: "blob" } : tipoNo ? formaDe(checker.getTypeFromTypeNode(tipoNo), 0, new Set()) : null;
    const vistos = new Set();
    return pares
      .map(([metodo, bruto]) => {
        const rota = normalizar(bruto);
        return { arquivo: rel.replace("src/react-app/services/", ""), funcao, metodo: metodo.toUpperCase(), rota, operacao: casar(metodo.toUpperCase(), rota), tipo: tipoNo ? tipoNo.getText(tipoNo.getSourceFile()) : null, forma };
      })
      .filter((c) => { const k = c.metodo + c.rota; if (vistos.has(k)) return false; vistos.add(k); return true; });
  }

  function funcaoEnvolvente(no) {
    for (let p = no.parent; p; p = p.parent) if (ts.isArrowFunction(p) || ts.isFunctionExpression(p) || ts.isFunctionDeclaration(p) || ts.isMethodDeclaration(p)) return p;
    return null;
  }

  function nomeDaFuncao(fn) {
    if (ts.isFunctionDeclaration(fn) && fn.name) return fn.name.text;
    if (fn.parent && ts.isVariableDeclaration(fn.parent) && ts.isIdentifier(fn.parent.name)) return fn.parent.name.text;
    return null;
  }

  function referencia(expr, simbolos) {
    if (!expr || !simbolos.length) return false;
    let achou = false;
    const v = (n) => { if (ts.isIdentifier(n) && simbolos.includes(checker.getSymbolAtLocation(n))) achou = true; ts.forEachChild(n, v); };
    v(expr);
    return achou;
  }

  function nomeFuncao(no) {
    const partes = [];
    for (let p = no.parent; p; p = p.parent) {
      if ((ts.isPropertyAssignment(p) || ts.isMethodDeclaration(p) || ts.isFunctionDeclaration(p) || ts.isVariableDeclaration(p)) && p.name && ts.isIdentifier(p.name)) partes.unshift(p.name.text);
    }
    return partes.join(".") || "(anônima)";
  }

  function metodos(init, sf, subst) {
    if (!ts.isObjectLiteralExpression(init)) return null;
    const prop = init.properties.find((p) => ts.isPropertyAssignment(p) && p.name.getText(sf) === "method");
    if (!prop) return null;
    return avaliar(prop.initializer, sf, 0, subst);
  }

  // Avalia uma expressão de string como lista de valores possíveis; o que não dá para saber vira {}.
  // `subst` troca parâmetros de um helper pelos argumentos de um uso dele.
  function avaliar(expr, sf, prof = 0, subst = new Map()) {
    const um = (s) => ({ lista: [s] });
    const ir = (e, s = sf, sub = subst) => avaliar(e, s, prof + 1, sub);
    if (!expr || prof > 12) return um("{}");
    if (ts.isParenthesizedExpression(expr) || ts.isAsExpression(expr) || ts.isNonNullExpression(expr)) return ir(expr.expression);
    if (ts.isStringLiteral(expr) || ts.isNoSubstitutionTemplateLiteral(expr)) return um(expr.text);
    if (ts.isTemplateExpression(expr)) {
      let atuais = [expr.head.text];
      for (const span of expr.templateSpans) {
        const v = ir(span.expression).lista;
        atuais = atuais.flatMap((a) => v.map((x) => a + x + span.literal.text));
      }
      return { lista: atuais };
    }
    if (ts.isBinaryExpression(expr) && expr.operatorToken.kind === ts.SyntaxKind.PlusToken) {
      const e = ir(expr.left).lista, d = ir(expr.right).lista;
      return { lista: e.flatMap((a) => d.map((b) => a + b)) };
    }
    // `import.meta.env.X ?? padrão`: vale o padrão do código.
    if (ts.isBinaryExpression(expr) && [ts.SyntaxKind.QuestionQuestionToken, ts.SyntaxKind.BarBarToken].includes(expr.operatorToken.kind)) return ir(expr.right);
    if (ts.isConditionalExpression(expr)) {
      const a = ir(expr.whenTrue).lista, b = ir(expr.whenFalse).lista;
      return { lista: [...a, ...b], cond: a.length === 1 && b.length === 1 ? expr.condition.getText(sf) : undefined };
    }
    if (ts.isIdentifier(expr)) {
      const simbolo = checker.getSymbolAtLocation(expr);
      if (simbolo && subst.has(simbolo)) {
        const arg = subst.get(simbolo);
        return arg ? avaliar(arg, arg.getSourceFile(), prof + 1, new Map()) : um("{}");
      }
      const alvo = simbolo && simbolo.flags & ts.SymbolFlags.Alias ? checker.getAliasedSymbol(simbolo) : simbolo;
      const decl = alvo?.valueDeclaration;
      if (decl && ts.isVariableDeclaration(decl) && decl.initializer && (decl.parent.flags & ts.NodeFlags.Const)) {
        const v = ir(decl.initializer, decl.getSourceFile(), new Map());
        if (v.lista.every((s) => s !== "{}")) return v;
      }
      return um("{}");
    }
    if (ts.isCallExpression(expr)) {
      // `base.replace(...)`, `.trim()`: a rota é a do objeto.
      if (ts.isPropertyAccessExpression(expr.expression) && ["replace", "trim", "toString"].includes(expr.expression.name.text)) return ir(expr.expression.expression);
      // Helper local de uma expressão só (`const url = (c) => juntar(BASE, c)`): avalia o corpo com os argumentos.
      const s = ts.isIdentifier(expr.expression) ? checker.getSymbolAtLocation(expr.expression) : null;
      const alvo = s && s.flags & ts.SymbolFlags.Alias ? checker.getAliasedSymbol(s) : s;
      const decl = alvo?.valueDeclaration;
      const fn = decl && ts.isVariableDeclaration(decl) && decl.initializer && ts.isArrowFunction(decl.initializer) ? decl.initializer : null;
      if (fn && !ts.isBlock(fn.body)) {
        const sub = new Map(fn.parameters.map((p, i) => [checker.getSymbolAtLocation(p.name), expr.arguments[i]]));
        for (const [k, v] of subst) if (!sub.has(k)) sub.set(k, v);
        return ir(fn.body, fn.getSourceFile(), sub);
      }
      // Outro helper: junta, em ordem, os argumentos que parecem rota (ex.: urlLugia(BASE, "/chat", origem)).
      const rotas = expr.arguments.map((a) => ir(a).lista).filter((l) => l.some((x) => x.startsWith("/") || x.startsWith("{}/")));
      if (rotas.length) return { lista: rotas.reduce((acc, l) => acc.flatMap((a) => l.map((b) => a + b)), [""]).map((x) => x + "?") };
    }
    return um("{}");
  }

  function normalizar(bruto) {
    let r = bruto.split("?")[0];
    r = r.replace(/^\{\}(?=\/)/, "");
    if (r.startsWith(PREFIXO_API)) r = r.slice(PREFIXO_API.length);
    // `/lancamentos${consulta(filtro)}`: o {} grudado no fim é a query string.
    r = r.replace(/([^/{}])\{\}$/, "$1");
    r = r.replace(/\{\}(\{\})+/g, "{}").replace(/\/+$/, "");
    return r.startsWith("/") ? r : "/" + r;
  }

  function casar(metodo, rota) {
    const segs = rota.split("/").filter(Boolean);
    let melhor = null, nota = -1;
    for (const op of operacoes) {
      if (op.metodo !== metodo || op.segs.length !== segs.length) continue;
      let pontos = 0, ok = true;
      for (let i = 0; i < segs.length; i++) {
        const f = segs[i], b = op.segs[i];
        if (f === "{}" && b.startsWith("{")) pontos += 1;
        else if (f.includes("{}")) { if (!b.startsWith("{") && !new RegExp("^" + f.split("{}").map(esc).join(".+") + "$").test(b)) { ok = false; break; } }
        else if (b.startsWith("{")) pontos += 0;
        // (o {} do front prefere um parâmetro do backend a uma rota fixa: /{id} antes de /equipes)
        else if (f === b) pontos += 2;
        else { ok = false; break; }
      }
      if (ok && pontos > nota) { melhor = op; nota = pontos; }
    }
    return melhor ? `${metodo} ${melhor.rota}` : null;
  }

  // Forma do tipo que o front espera: campos obrigatórios, nulos, tipos e enums.
  function formaDe(tipo, prof, vistos) {
    if (!tipo) return { k: "any" };
    const flags = tipo.flags;
    if (flags & (ts.TypeFlags.Any | ts.TypeFlags.Unknown | ts.TypeFlags.Void | ts.TypeFlags.Never)) return { k: "any" };
    if (tipo.isUnion()) {
      const partes = tipo.types.filter((t) => !(t.flags & (ts.TypeFlags.Null | ts.TypeFlags.Undefined)));
      const nulo = partes.length !== tipo.types.length;
      if (partes.length && partes.every((t) => t.isStringLiteral())) return { k: "string", valores: partes.map((t) => t.value).sort(), ...(nulo && { nulo }) };
      if (partes.every((t) => t.flags & ts.TypeFlags.BooleanLike)) return { k: "boolean", ...(nulo && { nulo }) };
      if (partes.length === 1) return { ...formaDe(partes[0], prof, vistos), ...(nulo && { nulo }) };
      return { k: "any", ...(nulo && { nulo }) };
    }
    if (flags & ts.TypeFlags.StringLike) return tipo.isStringLiteral() ? { k: "string", valores: [tipo.value] } : { k: "string" };
    if (flags & ts.TypeFlags.NumberLike) return { k: "number" };
    if (flags & ts.TypeFlags.BooleanLike) return { k: "boolean" };
    if (flags & (ts.TypeFlags.Null | ts.TypeFlags.Undefined)) return { k: "any", nulo: true };
    if (checker.isArrayType(tipo) || checker.isTupleType?.(tipo)) {
      const [item] = checker.getTypeArguments(tipo);
      return { k: "array", item: formaDe(item, prof + 1, vistos) };
    }
    const nome = tipo.symbol?.name;
    if (nome === "Blob" || nome === "Date" || nome === "Promise") return { k: nome === "Blob" ? "blob" : "any" };
    if (checker.getIndexInfosOfType(tipo).length && !checker.getPropertiesOfType(tipo).length) return { k: "map" };
    if (!(flags & ts.TypeFlags.Object) && !tipo.isIntersection()) return { k: "any" };
    const id = tipo.id;
    if (vistos.has(id) || prof > 4) return { k: "object" };
    const props = checker.getPropertiesOfType(tipo).filter((p) => !(p.flags & ts.SymbolFlags.Method));
    if (!props.length) return { k: "object" };
    const proximo = new Set(vistos).add(id);
    const campos = {};
    for (const p of props) {
      const decl = p.valueDeclaration || p.declarations?.[0];
      const t = decl ? checker.getTypeOfSymbolAtLocation(p, decl) : checker.getTypeOfSymbol(p);
      const f = formaDe(t, prof + 1, proximo);
      if (p.flags & ts.SymbolFlags.Optional) f.opcional = true;
      if (f.k === "any" && f.opcional) continue;
      campos[p.name] = f;
    }
    return { k: "object", ...(nome && nome !== "__type" && nome !== "__object" && { nome }), campos };
  }
}

function indexarOperacoes(openapi) {
  const ops = [];
  for (const [rotaCheia, metodos] of Object.entries(openapi.paths)) {
    const rota = rotaCheia.startsWith(PREFIXO_API) ? rotaCheia.slice(PREFIXO_API.length) : rotaCheia;
    for (const m of Object.keys(metodos)) ops.push({ metodo: m.toUpperCase(), rota, segs: rota.split("/").filter(Boolean) });
  }
  return ops;
}

function esc(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function ordenar(v) {
  if (Array.isArray(v)) return v.map(ordenar);
  if (v && typeof v === "object") return Object.fromEntries(Object.keys(v).sort().map((k) => [k, ordenar(v[k])]));
  return v;
}
