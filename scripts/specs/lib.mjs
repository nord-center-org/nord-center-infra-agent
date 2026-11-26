// Funções puras do registro de specs (testadas em lib.test.mjs): sem rede, sem disco, sem processo.
// Regras em policies/specs.md.

export const STATUS_ETAPA = ["planejada", "bloqueada", "em-andamento", "concluida", "descartada"];
export const TIPOS = ["implementacao", "correcao"];
export const ROTULO_CORRIGE_REGISTRO = "corrige-registro";

export const ARQUIVO_CATALOGO = "specs/todas-as-specs.md";
export const COLUNAS_CATALOGO = ["ID", "Spec", "Tipo", "Prioridade", "No MVP", "Situação", "Progresso", "Pasta"];
export const COLUNAS_ETAPAS = ["Etapa", "Título", "Repositórios", "Status", "Responsável", "Branch", "PRs", "Desde"];
const CAMPOS_FICHA = ["ID", "Tipo", "Prioridade", "Plano", "Responsável pela spec", "Bloqueada por", "Depende de", "Origem"];
const RESUMO_INICIO = "<!-- resumo:inicio -->";
const RESUMO_FIM = "<!-- resumo:fim -->";
const TAMANHO_BARRA = 10;

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

/** Catálogo `specs/todas-as-specs.md` → linhas da tabela de specs e o bloco de resumo. */
export function lerCatalogo(texto) {
  const erros = [];
  const tabela = tabelas(texto).find(t => t.cabecalho[0] === "ID");
  if (!tabela) return { specs: [], resumo: null, erros: [`${ARQUIVO_CATALOGO}: tabela de specs não encontrada (cabeçalho começando por "ID").`] };
  if (!mesmoCabecalho(tabela.cabecalho, COLUNAS_CATALOGO)) erros.push(`${ARQUIVO_CATALOGO}: colunas esperadas: ${COLUNAS_CATALOGO.join(" | ")}.`);
  const specs = tabela.linhas.map(({ celulas: c, indice }) => ({
    id: c[0], titulo: c[1], tipo: c[2], prioridade: c[3], mvp: c[4], situacao: c[5], progresso: c[6],
    pasta: vazio(c[7]) ? null : pastaDoLink(c[7]), pastaBruta: c[7], indice, celulas: c,
  }));
  const resumo = new RegExp(`${RESUMO_INICIO}\\r?\\n([\\s\\S]*?)\\r?\\n${RESUMO_FIM}`).exec(texto)?.[1] ?? null;
  if (resumo === null) erros.push(`${ARQUIVO_CATALOGO}: bloco de resumo não encontrado (${RESUMO_INICIO} … ${RESUMO_FIM}).`);
  return { specs, resumo, erros };
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
  const bloqueadaBruto = campos.get("Bloqueada por") ?? "";
  const bloqueadaPor = vazio(bloqueadaBruto) ? [] : bloqueadaBruto.split(",").map(s => s.trim());
  return { titulo, id: campos.get("ID") ?? "", tipo: campos.get("Tipo") ?? "", prioridade: campos.get("Prioridade") ?? "", plano, bloqueadaPor, etapas, erros };
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

/** Specs concluídas (todas as etapas entregues): base para saber se um bloqueio já caiu. */
export function specsConcluidas(fichas) {
  const concluidas = new Set();
  for (const ficha of fichas.values()) {
    const status = statusDaSpec(ficha.tipo, ficha.etapas);
    if (status === "implementada" || status === "corrigida") concluidas.add(ficha.id);
  }
  return concluidas;
}

/**
 * Situação mostrada no catálogo (policies/specs.md, seção 2):
 * 🟢 Concluída, 🟡 Em aberto, 🔴 Bloqueada, ⚪ Descartada ou Incorporada.
 */
export function situacaoDaSpec(ficha, concluidas, { incorporada = false } = {}) {
  if (incorporada) return "⚪ Incorporada";
  if (!ficha) return "🟡 Em aberto";
  const status = statusDaSpec(ficha.tipo, ficha.etapas);
  if (status === "implementada" || status === "corrigida") return `🟢 Concluída (${status})`;
  if (status === "descartada") return "⚪ Descartada";
  const pendentes = ficha.bloqueadaPor.filter(id => !concluidas.has(id));
  if (pendentes.length) return `🔴 Bloqueada (${pendentes.join(", ")})`;
  const abertas = ficha.etapas.filter(e => e.status !== "concluida" && e.status !== "descartada");
  if (abertas.length && abertas.every(e => e.status === "bloqueada")) return "🔴 Bloqueada (etapas)";
  return "🟡 Em aberto";
}

/** Barra de progresso das etapas: "▰▰▱▱▱▱▱▱▱▱ 2/10 · 1 em andamento". */
export function progressoDaSpec(ficha) {
  if (!ficha) return "sem pasta";
  const validas = ficha.etapas.filter(e => e.status !== "descartada");
  if (validas.length === 0) return "sem plano";
  const feitas = validas.filter(e => e.status === "concluida").length;
  const cheias = Math.round((TAMANHO_BARRA * feitas) / validas.length);
  const andando = validas.filter(e => e.status === "em-andamento").length;
  return `${"▰".repeat(cheias)}${"▱".repeat(TAMANHO_BARRA - cheias)} ${feitas}/${validas.length}${andando ? ` · ${andando} em andamento` : ""}`;
}

/** Linha de resumo do catálogo, contada pelas situações calculadas. */
export function resumoDoCatalogo(situacoes, fichas) {
  const contar = prefixo => [...situacoes.values()].filter(s => s.startsWith(prefixo)).length;
  const etapas = [...fichas.values()].flatMap(f => f.etapas).filter(e => e.status !== "descartada");
  const feitas = etapas.filter(e => e.status === "concluida").length;
  const andando = etapas.filter(e => e.status === "em-andamento").length;
  return `**Progresso geral:** 🟢 ${contar("🟢")} concluídas · 🟡 ${contar("🟡")} em aberto · 🔴 ${contar("🔴")} bloqueadas · ⚪ ${contar("⚪")} fora do plano. Etapas: ${feitas} de ${etapas.length} concluídas, ${andando} em andamento.`;
}

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
  for (const id of ficha.bloqueadaPor) {
    if (!RE_ID_SPEC.test(id)) erros.push(`${onde}: "Bloqueada por" deve ser — ou uma lista de SPEC-NN separada por vírgula (veio "${id}").`);
    else if (id === ficha.id) erros.push(`${onde}: a spec não pode bloquear a si mesma.`);
  }

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
 * Devolve os erros e, por ID, a situação e o progresso calculados (o comando `catalogo` grava esses valores).
 */
export function validarCatalogo(catalogo, fichas) {
  const erros = [...catalogo.erros];
  const calculados = new Map();
  const ids = new Set(catalogo.specs.map(s => s.id));
  const vistos = new Set();
  const pastasCitadas = new Set();
  const concluidas = specsConcluidas(fichas);
  for (const spec of catalogo.specs) {
    const ref = `${ARQUIVO_CATALOGO}, ${spec.id || "linha sem ID"}`;
    if (!RE_ID_SPEC.test(spec.id)) erros.push(`${ref}: ID deve ser SPEC-NN.`);
    if (vistos.has(spec.id)) erros.push(`${ref}: ID repetido.`);
    vistos.add(spec.id);
    if (!TIPOS.includes(spec.tipo)) erros.push(`${ref}: Tipo "${spec.tipo}" inválido (use ${TIPOS.join(" ou ")}).`);
    const incorporada = spec.situacao.startsWith("⚪ Incorporada");
    let ficha = null;
    if (!spec.pasta) {
      if (!vazio(spec.pastaBruta)) erros.push(`${ref}: Pasta deve ser um link [SPEC-NN-slug](SPEC-NN-slug/README.md) ou —.`);
      if (!incorporada) erros.push(`${ref}: toda spec tem pasta própria, salvo a incorporada a outra.`);
    } else {
      pastasCitadas.add(spec.pasta);
      if (incorporada) erros.push(`${ref}: spec incorporada não tem pasta.`);
      if (!spec.pasta.startsWith(`${spec.id}-`)) erros.push(`${ref}: a pasta ${spec.pasta} não é desta spec.`);
      ficha = fichas.get(spec.pasta) ?? null;
      if (!ficha) erros.push(`${ref}: a pasta specs/${spec.pasta}/ não existe ou não tem README.md.`);
    }
    if (ficha) {
      if (ficha.tipo !== spec.tipo) erros.push(`${ref}: Tipo no catálogo (${spec.tipo}) diferente da ficha (${ficha.tipo}).`);
      if (ficha.prioridade !== spec.prioridade) erros.push(`${ref}: Prioridade no catálogo (${spec.prioridade}) diferente da ficha (${ficha.prioridade}).`);
      for (const id of ficha.bloqueadaPor) if (RE_ID_SPEC.test(id) && !ids.has(id)) erros.push(`${ref}: "Bloqueada por" cita ${id}, que não está no catálogo.`);
    }
    const situacao = situacaoDaSpec(ficha, concluidas, { incorporada });
    const progresso = incorporada ? "—" : progressoDaSpec(ficha);
    calculados.set(spec.id, { situacao, progresso });
    if (spec.situacao !== situacao || spec.progresso !== progresso) {
      erros.push(`${ref}: o catálogo diz "${spec.situacao}" e "${spec.progresso}", mas as etapas dizem "${situacao}" e "${progresso}". Rode: node scripts/specs/specs.mjs catalogo`);
    }
  }
  for (const pasta of fichas.keys()) if (!pastasCitadas.has(pasta)) erros.push(`specs/${pasta}/: pasta sem linha no catálogo ${ARQUIVO_CATALOGO}.`);
  const resumo = resumoDoCatalogo(new Map([...calculados].map(([id, c]) => [id, c.situacao])), fichas);
  if (catalogo.resumo !== null && catalogo.resumo.trim() !== resumo) erros.push(`${ARQUIVO_CATALOGO}: o resumo de progresso está desatualizado. Rode: node scripts/specs/specs.mjs catalogo`);
  return { erros, calculados, resumo };
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
  for (const spec of base.catalogo.specs) if (!idsHead.has(spec.id)) erros.push(`${ARQUIVO_CATALOGO}: ${spec.id} saiu do catálogo; o ID de uma spec é permanente.`);

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

/** Catálogo com Situação, Progresso e o resumo trocados pelos valores calculados. */
export function catalogoAtualizado(texto, catalogo, calculados, resumo) {
  let novo = texto;
  for (const spec of catalogo.specs) {
    const calculado = calculados.get(spec.id);
    if (!calculado || (calculado.situacao === spec.situacao && calculado.progresso === spec.progresso)) continue;
    const c = [...spec.celulas];
    c[5] = calculado.situacao;
    c[6] = calculado.progresso;
    novo = trocarLinha(novo, spec.indice, linhaDeTabela(c));
  }
  if (resumo !== undefined && catalogo.resumo !== null) {
    const eol = novo.includes("\r\n") ? "\r\n" : "\n";
    novo = novo.replace(new RegExp(`${RESUMO_INICIO}\\r?\\n[\\s\\S]*?\\r?\\n${RESUMO_FIM}`), `${RESUMO_INICIO}${eol}${resumo}${eol}${RESUMO_FIM}`);
  }
  return novo;
}
