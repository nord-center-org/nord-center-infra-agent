// Funções puras do registro de specs (testadas em lib.test.mjs): sem rede, sem disco, sem processo.
// Regras em policies/specs.md.

export const STATUS_ETAPA = ["planejada", "bloqueada", "em-andamento", "concluida", "descartada"];
export const STATUS_SPEC = ["planejada", "em-andamento", "implementada", "corrigida", "descartada", "incorporada"];
export const TIPOS = ["implementacao", "correcao"];
export const ROTULO_CORRIGE_REGISTRO = "corrige-registro";

export const COLUNAS_CATALOGO = ["ID", "Spec", "Tipo", "Prioridade", "No MVP", "Status", "Pasta"];
export const COLUNAS_ETAPAS = ["Etapa", "Título", "Repositórios", "Status", "Responsável", "Branch", "PRs", "Desde"];
const CAMPOS_FICHA = ["ID", "Tipo", "Prioridade", "Plano", "Responsável pela spec", "Depende de", "Origem"];

const VAZIOS = new Set(["", "—", "–", "-"]);
const RE_ID_SPEC = /^SPEC-\d{2}$/;
const RE_ID_ETAPA = /^E\d{2}$/;
const RE_DATA = /^\d{4}-\d{2}-\d{2}$/;
const RE_PLANO_APROVADO = /^aprovado (\d{4}-\d{2}-\d{2}) por (\S.*)$/;
const RE_PR = /https:\/\/github\.com\/[\w.-]+\/[\w.-]+\/pull\/\d+/g;
const RE_BRANCH_TRABALHO = /^(feature|fix|refactor|test|ci|chore|docs)-[a-z0-9]+(-[a-z0-9]+)*$/;
const BRANCH_MAX = 50;
const BRANCHES_PROTEGIDAS = new Set(["develop", "master", "main"]);

export const vazio = valor => VAZIOS.has(String(valor ?? "").trim());

/** Tira crases, @ e espaços de uma célula ("`ci-spec-01-e03`" → "ci-spec-01-e03"). */
export const limparCelula = valor => (vazio(valor) ? "" : String(valor).trim().replace(/^`+|`+$/g, "").replace(/^@/, "").trim());

/** Data local AAAA-MM-DD (não UTC: no fim do dia em Brasília o UTC já virou o dia seguinte). */
export function hoje(data = new Date()) {
  const p = n => String(n).padStart(2, "0");
  return `${data.getFullYear()}-${p(data.getMonth() + 1)}-${p(data.getDate())}`;
}

/** Quebra a linha de uma tabela Markdown em células, respeitando `\|`. */
export function celulas(linha) {
  const conteudo = linha.trim().replace(/^\|/, "").replace(/\|$/, "");
  const partes = [];
  let atual = "";
  for (let i = 0; i < conteudo.length; i++) {
    if (conteudo[i] === "\\" && conteudo[i + 1] === "|") { atual += "\\|"; i++; continue; }
    if (conteudo[i] === "|") { partes.push(atual.trim()); atual = ""; continue; }
    atual += conteudo[i];
  }
  partes.push(atual.trim());
  return partes;
}

const separador = cels => cels.length > 0 && cels.every(c => /^:?-{3,}:?$/.test(c));

/** Todas as tabelas do texto: cabeçalho, linhas de dados e o índice (0-based) de cada linha no texto. */
export function tabelas(texto) {
  const linhas = texto.split(/\r?\n/);
  const encontradas = [];
  for (let i = 0; i < linhas.length; i++) {
    if (!linhas[i].trim().startsWith("|") || !linhas[i + 1]?.trim().startsWith("|") || !separador(celulas(linhas[i + 1]))) continue;
    const tabela = { cabecalho: celulas(linhas[i]), linhas: [], inicio: i };
    let j = i + 2;
    for (; j < linhas.length && linhas[j].trim().startsWith("|"); j++) tabela.linhas.push({ celulas: celulas(linhas[j]), indice: j });
    encontradas.push(tabela);
    i = j - 1;
  }
  return encontradas;
}

const mesmoCabecalho = (a, b) => a.length === b.length && a.every((c, i) => c === b[i]);
const pastaDoLink = celula => /\(([^)/]+)\/README\.md\)/.exec(celula)?.[1] ?? null;
export const prsDaCelula = celula => [...String(celula ?? "").matchAll(RE_PR)].map(m => m[0]);

/** Catálogo `specs/README.md` → linhas da tabela de specs. */
export function lerCatalogo(texto) {
  const erros = [];
  const tabela = tabelas(texto).find(t => t.cabecalho[0] === "ID");
  if (!tabela) return { specs: [], erros: ["specs/README.md: tabela de specs não encontrada (cabeçalho começando por \"ID\")."] };
  if (!mesmoCabecalho(tabela.cabecalho, COLUNAS_CATALOGO)) erros.push(`specs/README.md: colunas esperadas: ${COLUNAS_CATALOGO.join(" | ")}.`);
  const specs = tabela.linhas.map(({ celulas: c, indice }) => ({
    id: c[0], titulo: c[1], tipo: c[2], prioridade: c[3], mvp: c[4], status: c[5],
    pasta: vazio(c[6]) ? null : pastaDoLink(c[6]), pastaBruta: c[6], indice, celulas: c,
  }));
  return { specs, erros };
}

/** Ficha `specs/SPEC-NN-<slug>/README.md` → campos, plano e etapas. */
export function lerFicha(texto, caminho = "ficha") {
  const erros = [];
  const titulo = /^# (.+)$/m.exec(texto)?.[1]?.trim() ?? "";
  const todas = tabelas(texto);
  const campos = new Map();
  const tabelaCampos = todas.find(t => mesmoCabecalho(t.cabecalho, ["Campo", "Valor"]));
  if (!tabelaCampos) erros.push(`${caminho}: tabela "Campo | Valor" não encontrada.`);
  else for (const { celulas: c } of tabelaCampos.linhas) campos.set(c[0], c[1] ?? "");
  for (const campo of CAMPOS_FICHA) if (tabelaCampos && !campos.has(campo)) erros.push(`${caminho}: campo "${campo}" ausente.`);

  const tabelaEtapas = todas.find(t => t.cabecalho[0] === "Etapa");
  if (!tabelaEtapas) erros.push(`${caminho}: tabela de etapas não encontrada (cabeçalho começando por "Etapa").`);
  else if (!mesmoCabecalho(tabelaEtapas.cabecalho, COLUNAS_ETAPAS)) erros.push(`${caminho}: colunas de etapas esperadas: ${COLUNAS_ETAPAS.join(" | ")}.`);
  const etapas = (tabelaEtapas?.linhas ?? []).map(({ celulas: c, indice }) => ({
    id: c[0], titulo: c[1], repositorios: c[2], status: c[3],
    responsavel: limparCelula(c[4]), branch: limparCelula(c[5]), prs: prsDaCelula(c[6]), prsBruto: c[6] ?? "",
    desde: limparCelula(c[7]), indice, celulas: c,
  }));

  const planoBruto = campos.get("Plano") ?? "";
  const aprovado = RE_PLANO_APROVADO.exec(planoBruto);
  const plano = { bruto: planoBruto, aprovado: Boolean(aprovado), data: aprovado?.[1] ?? null, por: aprovado?.[2] ?? null };
  return { titulo, id: campos.get("ID") ?? "", tipo: campos.get("Tipo") ?? "", prioridade: campos.get("Prioridade") ?? "", plano, etapas, erros };
}

/** O token que liga uma branch a uma etapa: "spec-01-e03". */
export const tokenEtapa = (idSpec, idEtapa) => `${idSpec.toLowerCase()}-${idEtapa.toLowerCase()}`;
const temToken = (branch, token) => new RegExp(`(^|-)${token}(-|$)`).test(branch);

/** Nome válido para trabalhar numa etapa: prefixo da policy, até 50 caracteres e o token da etapa. */
export function erroBranchEtapa(branch, idSpec, idEtapa) {
  if (!branch) return "branch vazia";
  if (BRANCHES_PROTEGIDAS.has(branch)) return `${branch} não é branch de trabalho`;
  if (branch.length > BRANCH_MAX || !RE_BRANCH_TRABALHO.test(branch)) return `"${branch}" fora do padrão <tipo>-<slug> com até ${BRANCH_MAX} caracteres (policies/features.md)`;
  const token = tokenEtapa(idSpec, idEtapa);
  if (!temToken(branch, token)) return `"${branch}" não contém "${token}" (policies/specs.md, seção 5)`;
  return null;
}

/** Etapas (ou outras branches) que citam uma etapa: "x-spec-01-e03-y" → { spec: "SPEC-01", etapa: "E03" }. */
export function etapaDaBranch(branch) {
  const m = /(?:^|-)spec-(\d{2})-e(\d{2})(?:-|$)/.exec(branch);
  return m ? { spec: `SPEC-${m[1]}`, etapa: `E${m[2]}` } : null;
}

/** Status da spec calculado pelas etapas (policies/specs.md, seção 2). */
export function statusDaSpec(tipo, etapas) {
  if (etapas.length === 0) return "planejada";
  const concluidas = etapas.filter(e => e.status === "concluida").length;
  const finais = etapas.filter(e => e.status === "concluida" || e.status === "descartada").length;
  if (finais === etapas.length) return concluidas === 0 ? "descartada" : tipo === "correcao" ? "corrigida" : "implementada";
  if (concluidas > 0 || etapas.some(e => e.status === "em-andamento")) return "em-andamento";
  return "planejada";
}

/** "implementada" ou "corrigida", para as mensagens sobre uma etapa entregue. */
export const verboEntregue = tipo => (tipo === "correcao" ? "corrigida" : "implementada");

/** Confere uma ficha isolada: campos, plano e cada etapa. `pasta` é o nome da pasta (SPEC-NN-slug). */
export function validarFicha(ficha, pasta) {
  const erros = [...ficha.erros];
  const onde = `specs/${pasta}/README.md`;
  const idPasta = /^(SPEC-\d{2})-[a-z0-9]+(-[a-z0-9]+)*$/.exec(pasta)?.[1];
  if (!idPasta) erros.push(`${onde}: nome da pasta fora do padrão SPEC-NN-<slug>.`);
  if (ficha.id !== idPasta) erros.push(`${onde}: campo ID "${ficha.id}" diferente da pasta (${idPasta ?? "?"}).`);
  if (!ficha.titulo.startsWith(`${ficha.id} — `)) erros.push(`${onde}: o título deve começar com "${ficha.id} — ".`);
  if (!TIPOS.includes(ficha.tipo)) erros.push(`${onde}: Tipo "${ficha.tipo}" inválido (use ${TIPOS.join(" ou ")}).`);
  if (ficha.plano.bruto !== "pendente" && !ficha.plano.aprovado) erros.push(`${onde}: Plano deve ser "pendente" ou "aprovado AAAA-MM-DD por <login>".`);

  const vistos = new Set();
  for (const etapa of ficha.etapas) {
    const ref = `${onde}, ${etapa.id || "etapa sem ID"}`;
    if (!RE_ID_ETAPA.test(etapa.id)) erros.push(`${ref}: ID de etapa deve ser E01, E02…`);
    if (vistos.has(etapa.id)) erros.push(`${ref}: etapa repetida.`);
    vistos.add(etapa.id);
    if (vazio(etapa.titulo)) erros.push(`${ref}: título vazio.`);
    if (!STATUS_ETAPA.includes(etapa.status)) { erros.push(`${ref}: status "${etapa.status}" inválido (use ${STATUS_ETAPA.join(", ")}).`); continue; }
    if (etapa.desde && !RE_DATA.test(etapa.desde)) erros.push(`${ref}: "Desde" deve ser AAAA-MM-DD.`);
    const aberta = etapa.status === "planejada" || etapa.status === "bloqueada";
    if (aberta && (etapa.responsavel || etapa.branch || etapa.prs.length)) erros.push(`${ref}: etapa ${etapa.status} não pode ter responsável, branch nem PRs (ao liberar, limpe as células).`);
    if (etapa.status === "em-andamento" || etapa.status === "concluida") {
      if (!ficha.plano.aprovado) erros.push(`${ref}: o plano da spec ainda não foi aprovado; nenhuma etapa pode estar ${etapa.status}.`);
      if (!etapa.responsavel) erros.push(`${ref}: falta o responsável.`);
      if (!etapa.desde) erros.push(`${ref}: falta a data em "Desde".`);
      const erroBranch = erroBranchEtapa(etapa.branch, ficha.id, etapa.id);
      if (erroBranch) erros.push(`${ref}: ${erroBranch}.`);
    }
    if (etapa.status === "concluida" && etapa.prs.length === 0) erros.push(`${ref}: etapa concluída precisa de ao menos um link de PR (https://github.com/<dono>/<repo>/pull/N).`);
  }
  return erros;
}

/**
 * Confere o catálogo contra as fichas. `fichas` é um Map pasta → ficha lida.
 * Devolve os erros e, por ID, o status calculado (para o comando `catalogo` corrigir a coluna).
 */
export function validarCatalogo(catalogo, fichas) {
  const erros = [...catalogo.erros];
  const calculados = new Map();
  const ids = new Set();
  const pastasCitadas = new Set();
  for (const spec of catalogo.specs) {
    const ref = `specs/README.md, ${spec.id || "linha sem ID"}`;
    if (!RE_ID_SPEC.test(spec.id)) erros.push(`${ref}: ID deve ser SPEC-NN.`);
    if (ids.has(spec.id)) erros.push(`${ref}: ID repetido.`);
    ids.add(spec.id);
    if (!TIPOS.includes(spec.tipo)) erros.push(`${ref}: Tipo "${spec.tipo}" inválido (use ${TIPOS.join(" ou ")}).`);
    if (!STATUS_SPEC.includes(spec.status)) erros.push(`${ref}: Status "${spec.status}" inválido (use ${STATUS_SPEC.join(", ")}).`);
    if (!spec.pasta) {
      if (!vazio(spec.pastaBruta)) erros.push(`${ref}: Pasta deve ser um link [SPEC-NN-slug](SPEC-NN-slug/README.md) ou —.`);
      const esperado = spec.status === "incorporada" ? "incorporada" : "planejada";
      calculados.set(spec.id, esperado);
      if (spec.status !== esperado) erros.push(`${ref}: spec sem pasta só pode estar planejada ou incorporada (está ${spec.status}).`);
      continue;
    }
    pastasCitadas.add(spec.pasta);
    if (spec.status === "incorporada") erros.push(`${ref}: spec incorporada não tem pasta.`);
    if (!spec.pasta.startsWith(`${spec.id}-`)) erros.push(`${ref}: a pasta ${spec.pasta} não é desta spec.`);
    const ficha = fichas.get(spec.pasta);
    if (!ficha) { erros.push(`${ref}: a pasta specs/${spec.pasta}/ não existe ou não tem README.md.`); continue; }
    if (ficha.tipo !== spec.tipo) erros.push(`${ref}: Tipo no catálogo (${spec.tipo}) diferente da ficha (${ficha.tipo}).`);
    if (ficha.prioridade !== spec.prioridade) erros.push(`${ref}: Prioridade no catálogo (${spec.prioridade}) diferente da ficha (${ficha.prioridade}).`);
    const calculado = statusDaSpec(ficha.tipo, ficha.etapas);
    calculados.set(spec.id, calculado);
    if (spec.status !== calculado) erros.push(`${ref}: Status ${spec.status}, mas as etapas dizem ${calculado}. Rode: node scripts/specs/specs.mjs catalogo`);
  }
  for (const pasta of fichas.keys()) if (!pastasCitadas.has(pasta)) erros.push(`specs/${pasta}/: pasta sem linha no catálogo specs/README.md.`);
  return { erros, calculados };
}

const resumoEtapa = e => `${e.responsavel || "sem responsável"} na branch ${e.branch || "?"}${e.desde ? ` desde ${e.desde}` : ""}`;
const mesmosDados = (a, b) => a.status === b.status && a.responsavel === b.responsavel && a.branch === b.branch && a.desde === b.desde && a.prs.join() === b.prs.join();

/**
 * Transições de `develop` (base) para o PR (head), pela tabela de policies/specs.md, seção 6.
 * `base` e `head` são { catalogo, fichas: Map pasta → ficha }.
 */
export function validarTransicoes(base, head, { rotulos = [] } = {}) {
  const erros = [];
  const corrigeRegistro = rotulos.includes(ROTULO_CORRIGE_REGISTRO);
  const idsHead = new Set(head.catalogo.specs.map(s => s.id));
  for (const spec of base.catalogo.specs) if (!idsHead.has(spec.id)) erros.push(`specs/README.md: ${spec.id} saiu do catálogo; o ID de uma spec é permanente.`);

  for (const [pasta, fichaBase] of base.fichas) {
    const fichaHead = head.fichas.get(pasta);
    if (!fichaHead) { erros.push(`specs/${pasta}/: a pasta existe em develop e foi removida.`); continue; }
    const etapasHead = new Map(fichaHead.etapas.map(e => [e.id, e]));
    for (const antes of fichaBase.etapas) {
      const ref = `${fichaBase.id} ${antes.id}`;
      const depois = etapasHead.get(antes.id);
      if (!depois) {
        if (antes.status !== "planejada") erros.push(`${ref}: a etapa (${antes.status}) foi removida da ficha; só etapas planejadas podem sair.`);
        continue;
      }
      if (corrigeRegistro || mesmosDados(antes, depois)) continue;
      if (antes.status === "concluida") erros.push(`${ref}: já está ${verboEntregue(fichaBase.tipo)} (${antes.prs.join(", ") || "sem PR"}); não pode ser alterada. Comportamento novo vira etapa nova.`);
      else if (antes.status === "descartada") erros.push(`${ref}: foi descartada; não pode ser alterada. Trabalho novo vira etapa nova.`);
      else if (antes.status === "em-andamento" && depois.status === "em-andamento" && (antes.responsavel !== depois.responsavel || antes.branch !== depois.branch)) erros.push(`${ref}: em andamento com ${resumoEtapa(antes)}; quem tem a etapa precisa liberá-la antes.`);
    }
  }
  return erros;
}

/** Etapas que um PR reserva ou conclui em relação a `develop`: chaves "SPEC-NN/ENN" com o status novo. */
export function reservasDoPr(fichasBase, fichasHead) {
  const reservas = new Map();
  for (const [pasta, fichaHead] of fichasHead) {
    const antes = new Map((fichasBase.get(pasta)?.etapas ?? []).map(e => [e.id, e]));
    for (const etapa of fichaHead.etapas) {
      if (etapa.status !== "em-andamento" && etapa.status !== "concluida") continue;
      const anterior = antes.get(etapa.id);
      if (anterior && anterior.status === etapa.status && anterior.responsavel === etapa.responsavel && anterior.branch === etapa.branch) continue;
      reservas.set(`${fichaHead.id}/${etapa.id}`, { ...etapa, spec: fichaHead.id });
    }
  }
  return reservas;
}

/** Conflitos entre as reservas deste PR e as de outros PRs abertos ([{ numero, url, autor, reservas }]). */
export function conflitosComOutrosPrs(minhas, outros) {
  const erros = [];
  for (const [chave, etapa] of minhas) {
    for (const outro of outros) {
      const dele = outro.reservas.get(chave);
      if (dele) erros.push(`${chave.replace("/", " ")}: o PR #${outro.numero} (${outro.autor}) também está marcando esta etapa como ${dele.status} (${resumoEtapa(dele)}). ${outro.url}`);
    }
  }
  return erros;
}

/**
 * Por que uma etapa não pode ser pega agora, olhando a ficha de `develop` e a local.
 * Devolve null se estiver livre.
 */
export function motivoParaNaoPegar({ fichaDevelop, fichaLocal, idEtapa, desbloquear = false }) {
  if (!fichaDevelop) return "a spec ainda não tem pasta em develop; o plano precisa ser integrado e aprovado antes.";
  if (!fichaDevelop.plano.aprovado) return `o plano da ${fichaDevelop.id} ainda não foi aprovado (campo Plano: ${fichaDevelop.plano.bruto || "vazio"}).`;
  for (const [onde, ficha] of [["develop", fichaDevelop], ["cópia local", fichaLocal]]) {
    const etapa = ficha?.etapas.find(e => e.id === idEtapa);
    if (!etapa) { if (onde === "develop") return `a etapa ${idEtapa} não existe na ficha da ${fichaDevelop.id}.`; continue; }
    if (etapa.status === "concluida") return `${fichaDevelop.id} ${idEtapa} já está ${verboEntregue(ficha.tipo)} (${etapa.prs.join(", ") || "sem PR"}, ${etapa.desde || "sem data"}). Não refaça; comportamento novo vira etapa nova.`;
    if (etapa.status === "descartada") return `${fichaDevelop.id} ${idEtapa} foi descartada; veja decisoes.md.`;
    if (etapa.status === "em-andamento") return `${fichaDevelop.id} ${idEtapa} já está em andamento com ${resumoEtapa(etapa)} (${onde}).`;
    if (etapa.status === "bloqueada" && !desbloquear) return `${fichaDevelop.id} ${idEtapa} está bloqueada; veja o motivo no plano.md. Se a dependência já foi resolvida, use --desbloquear.`;
  }
  return null;
}

/** Monta a linha de tabela a partir das células. */
export const linhaDeTabela = cels => `| ${cels.join(" | ")} |`;

/** Texto com a linha `indice` trocada, mantendo o fim de linha original. */
export function trocarLinha(texto, indice, novaLinha) {
  const eol = texto.includes("\r\n") ? "\r\n" : "\n";
  const linhas = texto.split(/\r?\n/);
  linhas[indice] = novaLinha;
  return linhas.join(eol);
}

/** Células de uma etapa com outro status e dados. */
export function celulasEtapa(etapa, { status, responsavel = "", branch = "", prs = [], desde = "" }) {
  const c = [...etapa.celulas];
  while (c.length < COLUNAS_ETAPAS.length) c.push("—");
  c[3] = status;
  c[4] = responsavel || "—";
  c[5] = branch ? `\`${branch}\`` : "—";
  c[6] = prs.length ? prs.map(rotuloPr).join(", ") : "—";
  c[7] = desde || "—";
  return c;
}

/** https://github.com/org/nord-tool-backend/pull/12 → [nord-tool-backend#12](url) */
export function rotuloPr(url) {
  const m = /github\.com\/[\w.-]+\/([\w.-]+)\/pull\/(\d+)/.exec(url);
  return m ? `[${m[1]}#${m[2]}](${url})` : url;
}

/** Catálogo com a coluna Status trocada pelos valores calculados. */
export function catalogoAtualizado(texto, catalogo, calculados) {
  let novo = texto;
  for (const spec of catalogo.specs) {
    const status = calculados.get(spec.id);
    if (!status || status === spec.status) continue;
    const c = [...spec.celulas];
    c[5] = status;
    novo = trocarLinha(novo, spec.indice, linhaDeTabela(c));
  }
  return novo;
}
