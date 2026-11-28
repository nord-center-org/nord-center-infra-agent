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

export const SECAO_PERGUNTAS = "## Perguntas ao responsável";
export const ANTES_DA_APROVACAO = "antes da aprovação";
const campoPergunta = (bloco, nome) => new RegExp(`^- \\*\\*${nome}:\\*\\*\\s*(.*)$`, "m").exec(bloco)?.[1]?.trim() ?? null;

/** `decisoes.md` → perguntas da seção "Perguntas ao responsável" (null se a seção não existe). */
export function lerPerguntas(texto) {
  if (texto === null || texto === undefined) return null;
  const normal = texto.replace(/\r\n/g, "\n");
  const inicio = normal.indexOf(`\n${SECAO_PERGUNTAS}\n`);
  if (inicio < 0) return null;
  const resto = normal.slice(inicio + SECAO_PERGUNTAS.length + 2);
  const fim = resto.search(/^## /m);
  const secao = fim < 0 ? resto : resto.slice(0, fim);
  return secao.split(/^### /m).slice(1).map(bloco => ({
    id: /^(P\d+)\b/.exec(bloco)?.[1] ?? "",
    titulo: bloco.split("\n")[0].trim(),
    recomendacao: campoPergunta(bloco, "Recomendação"),
    decidirEm: campoPergunta(bloco, "Decidir em"),
    resposta: campoPergunta(bloco, "Resposta"),
  }));
}

const pendente = pergunta => !pergunta.resposta || pergunta.resposta.toLowerCase() === "pendente";

/** Perguntas que precisam de resposta antes de a etapa começar. */
export const perguntasDaEtapa = (perguntas, idEtapa) => (perguntas ?? []).filter(p => p.decidirEm === idEtapa && pendente(p));

/**
 * Plano obrigatório com perguntas ao responsável (policies/specs.md, seção 3).
 * `arquivos` = { plano: texto|null, decisoes: texto|null } da pasta da spec.
 */
export function validarPlanejamento(ficha, pasta, arquivos) {
  const erros = [];
  const onde = `specs/${pasta}`;
  const planejando = ficha.plano.aprovado || ficha.etapas.length > 0;
  if (!planejando) return erros;
  if (!arquivos.plano) erros.push(`${onde}/plano.md: obrigatório quando a spec tem etapas ou plano aprovado (modelo em templates/spec/plano.md).`);
  const perguntas = lerPerguntas(arquivos.decisoes);
  if (!arquivos.decisoes) erros.push(`${onde}/decisoes.md: obrigatório, com a seção "${SECAO_PERGUNTAS.slice(3)}".`);
  else if (perguntas === null) erros.push(`${onde}/decisoes.md: falta a seção "${SECAO_PERGUNTAS.slice(3)}".`);
  else if (perguntas.length === 0) erros.push(`${onde}/decisoes.md: o plano precisa levantar ao menos uma pergunta ao responsável sobre as decisões e dúvidas.`);
  for (const [nome, texto] of [["plano.md", arquivos.plano], ["decisoes.md", arquivos.decisoes]]) {
    const sobras = marcasRestantes(texto);
    if (sobras.length) erros.push(`${onde}/${nome}: ainda tem trechos do modelo para preencher: ${sobras.join(", ")}.`);
  }
  if (arquivos.plano) erros.push(...validarExecucao(arquivos.plano, ficha.etapas.map(e => e.id)).map(e => `${onde}/plano.md, ${e}`));
  if (ficha.plano.aprovado && ficha.etapas.length === 0) erros.push(`${onde}/README.md: plano aprovado sem nenhuma etapa na ficha.`);
  const etapas = new Set(ficha.etapas.map(e => e.id));
  for (const p of perguntas ?? []) {
    const ref = `${onde}/decisoes.md, ${p.id || p.titulo}`;
    if (!/^P\d+$/.test(p.id)) erros.push(`${ref}: a pergunta deve começar por "### P1 — …".`);
    if (!p.recomendacao) erros.push(`${ref}: falta "- **Recomendação:**".`);
    if (!p.resposta) erros.push(`${ref}: falta "- **Resposta:**" (use "pendente" até a resposta).`);
    if (p.decidirEm !== ANTES_DA_APROVACAO && !etapas.has(p.decidirEm)) erros.push(`${ref}: "- **Decidir em:**" deve ser "${ANTES_DA_APROVACAO}" ou uma etapa da ficha (veio "${p.decidirEm ?? ""}").`);
    if (ficha.plano.aprovado && p.decidirEm === ANTES_DA_APROVACAO && pendente(p)) erros.push(`${ref}: o plano foi aprovado, mas esta pergunta para "${ANTES_DA_APROVACAO}" não tem resposta.`);
  }
  for (const etapa of ficha.etapas.filter(e => e.status === "em-andamento" || e.status === "concluida")) {
    for (const p of perguntasDaEtapa(perguntas, etapa.id)) erros.push(`${onde}, ${etapa.id}: a etapa está ${etapa.status}, mas a pergunta ${p.id} (${p.titulo}) ainda não tem resposta.`);
  }
  return erros;
}

export const MARCA_EXECUCAO = "**Execução:**";
export const ATOR_IA = "🤖";
export const ATOR_HUMANO = "👤";
const RE_CONFIRMADO = /\*\*Confirmado:\*\*\s*(.*?)\s*$/;

/** Seções "## ENN — …" do plano: Map ENN → linhas da seção. */
function secoesDoPlano(plano) {
  const secoes = new Map();
  let atual = null;
  for (const linha of String(plano ?? "").split(/\r?\n/)) {
    const m = /^## (E\d+)\b/.exec(linha);
    if (m) { atual = m[1]; secoes.set(atual, []); continue; }
    if (/^## /.test(linha)) { atual = null; continue; }
    if (atual) secoes.get(atual).push(linha);
  }
  return secoes;
}

/**
 * Passos de "**Execução:**" de uma etapa, na ordem: { numero, ator: "ia" | "humano" | null, texto, confirmado }.
 * Cada passo é um item "1. 🤖 …" ou "2. 👤 … **Confirmado:** pendente"; linhas recuadas continuam o passo.
 * Devolve null quando a seção não tem "**Execução:**".
 */
export function lerExecucao(linhas) {
  const i = linhas.findIndex(l => l.trim().startsWith(MARCA_EXECUCAO));
  if (i < 0) return null;
  const passos = [];
  for (const linha of linhas.slice(i + 1)) {
    const item = /^(\d+)\.\s+(.*)$/.exec(linha);
    if (item) {
      const texto = item[2].trim();
      const ator = texto.startsWith(ATOR_IA) ? "ia" : texto.startsWith(ATOR_HUMANO) ? "humano" : null;
      passos.push({ numero: Number(item[1]), ator, texto, confirmado: null });
    } else if (/^\s+\S/.test(linha) && passos.length) {
      passos.at(-1).texto += ` ${linha.trim()}`;
    } else if (/^\*\*[^*]+:\*\*/.test(linha.trim()) && passos.length) {
      break;
    }
  }
  for (const p of passos) { const m = RE_CONFIRMADO.exec(p.texto); if (m) p.confirmado = m[1]; }
  return passos;
}

/** Execução de todas as etapas do plano: Map ENN → passos (ou null sem a seção). */
export function execucaoDoPlano(plano) {
  return new Map([...secoesDoPlano(plano)].map(([id, linhas]) => [id, lerExecucao(linhas)]));
}

export const passoPendente = p => p.ator === "humano" && (!p.confirmado || /^pendente\b/i.test(p.confirmado));

/**
 * Cada etapa do plano tem "**Execução:**": os passos na ordem em que acontecem, cada um com 🤖 (feito pela IA)
 * ou 👤 (ação humana: token, variável, secret, acesso, configuração do GitHub ou do provedor, aprovação).
 * Todo passo 👤 termina com "**Confirmado:** pendente" até a pessoa confirmar. Ver policies/specs.md, seção 3.
 */
export function validarExecucao(plano, idsEtapas) {
  const erros = [];
  const execucao = execucaoDoPlano(plano);
  for (const id of idsEtapas) if (!execucao.has(id)) erros.push(`${id}: falta a seção "## ${id} — <título>".`);
  for (const [id, passos] of execucao) {
    if (passos === null) { erros.push(`${id}: falta "${MARCA_EXECUCAO}" com os passos em ordem (${ATOR_IA} IA, ${ATOR_HUMANO} ação humana).`); continue; }
    if (passos.length === 0) { erros.push(`${id}: "${MARCA_EXECUCAO}" sem passos numerados.`); continue; }
    passos.forEach((p, i) => {
      if (p.numero !== i + 1) erros.push(`${id}, passo ${p.numero}: a numeração deve seguir 1, 2, 3… (esperado ${i + 1}).`);
      if (!p.ator) erros.push(`${id}, passo ${p.numero}: comece com ${ATOR_IA} (IA) ou ${ATOR_HUMANO} (ação humana).`);
      if (p.ator === "humano" && p.confirmado === null) erros.push(`${id}, passo ${p.numero}: passo ${ATOR_HUMANO} termina com "**Confirmado:** pendente".`);
      if (p.ator === "ia" && p.confirmado !== null) erros.push(`${id}, passo ${p.numero}: "**Confirmado:**" é só para passo ${ATOR_HUMANO}.`);
    });
  }
  return erros;
}

/** Até onde a etapa pode andar: os passos 🤖 liberados e o primeiro 👤 pendente, que para a execução. */
export function proximoDaEtapa(passos) {
  const parada = passos.findIndex(passoPendente);
  return { liberados: (parada < 0 ? passos : passos.slice(0, parada)), parada: parada < 0 ? null : passos[parada] };
}

/** Marca o passo 👤 como confirmado no plano: "**Confirmado:** sim (AAAA-MM-DD, login)". */
export function confirmarPasso(plano, idEtapa, numero, valor) {
  const linhas = String(plano).split(/(?<=\n)/);
  let naEtapa = false, naExecucao = false, noPasso = false;
  for (let i = 0; i < linhas.length; i++) {
    const l = linhas[i];
    if (/^## /.test(l)) { naEtapa = new RegExp(`^## ${idEtapa}\\b`).test(l); naExecucao = false; noPasso = false; continue; }
    if (!naEtapa) continue;
    if (l.trim().startsWith(MARCA_EXECUCAO)) { naExecucao = true; continue; }
    if (!naExecucao) continue;
    const item = /^(\d+)\.\s/.exec(l);
    if (item) noPasso = Number(item[1]) === numero;
    else if (l.trim() && !/^\s+\S/.test(l)) noPasso = false;
    if (noPasso && RE_CONFIRMADO.test(l.replace(/\r?\n$/, ""))) {
      linhas[i] = l.replace(/(\*\*Confirmado:\*\*\s*).*?(\r?\n)?$/, (_, a, fim) => `${a}${valor}${fim ?? ""}`);
      return linhas.join("");
    }
  }
  return null;
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
export function motivoParaNaoPegar({ fichaDevelop, fichaLocal, idEtapa, desbloquear = false, perguntas = null }) {
  if (!fichaDevelop) return "a spec ainda não tem pasta em develop; o plano precisa ser integrado e aprovado antes.";
  if (!fichaDevelop.plano.aprovado) {
    const semPlano = fichaDevelop.etapas.length === 0 ? ` Ela ainda não tem plano de implementação: monte o plano.md, as etapas e as perguntas ao responsável em decisoes.md, e peça a aprovação. Comece com: node scripts/specs/specs.mjs planejar ${fichaDevelop.id}` : "";
    return `o plano da ${fichaDevelop.id} ainda não foi aprovado (campo Plano: ${fichaDevelop.plano.bruto || "vazio"}).${semPlano}`;
  }
  for (const [onde, ficha] of [["develop", fichaDevelop], ["cópia local", fichaLocal]]) {
    const etapa = ficha?.etapas.find(e => e.id === idEtapa);
    if (!etapa) { if (onde === "develop") return `a etapa ${idEtapa} não existe na ficha da ${fichaDevelop.id}.`; continue; }
    if (etapa.status === "concluida") return `${fichaDevelop.id} ${idEtapa} já está ${verboEntregue(ficha.tipo)} (${etapa.prs.join(", ") || "sem PR"}, ${etapa.desde || "sem data"}). Não refaça; comportamento novo vira etapa nova.`;
    if (etapa.status === "descartada") return `${fichaDevelop.id} ${idEtapa} foi descartada; veja decisoes.md.`;
    if (etapa.status === "em-andamento") return `${fichaDevelop.id} ${idEtapa} já está em andamento com ${resumoEtapa(etapa)} (${onde}).`;
    if (etapa.status === "bloqueada" && !desbloquear) return `${fichaDevelop.id} ${idEtapa} está bloqueada; veja o motivo no plano.md. Se a dependência já foi resolvida, use --desbloquear.`;
  }
  const semResposta = perguntasDaEtapa(perguntas, idEtapa);
  if (semResposta.length) return `antes da ${idEtapa}, o responsável precisa responder ${semResposta.map(p => `${p.id} (${p.titulo})`).join(", ")} em decisoes.md.`;
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

// ---------- Planejamento de uma spec em aberto (comando `planejar`) ----------

/** Branch do PR do plano: "docs-spec-03-plano". */
export const branchDoPlano = idSpec => `docs-${idSpec.toLowerCase()}-plano`;

/** Trechos dos modelos de templates/spec/ que não podem sobrar num plano entregue. */
export const MARCAS_DE_MODELO = ["<pergunta>", "<opção e porquê>", "<título curto>", "<o que foi escolhido>", "<o motivo>", "<risco e como reduzir>", "<título>", "<itens>", "<horas>", "<repositórios>"];
export const marcasRestantes = texto => MARCAS_DE_MODELO.filter(m => String(texto ?? "").includes(m));

/**
 * Por que não dá para começar o plano da spec agora (null = pode).
 * `spec` é a linha do painel em develop; `temPlano` diz se develop já tem plano.md da spec.
 */
export function motivoParaNaoPlanejar({ idSpec, spec, fichaDevelop, temPlano }) {
  if (!spec) return `${idSpec} não está no painel specs/todas-as-specs.md.`;
  if (spec.situacao.startsWith("⚪")) return `${idSpec} está "${spec.situacao}"; não há o que planejar.`;
  if (!fichaDevelop) return `${idSpec} ainda não tem pasta em develop.`;
  const status = statusDaSpec(fichaDevelop.tipo, fichaDevelop.etapas);
  if (status === "implementada" || status === "corrigida") return `${idSpec} já está concluída (${status}). Comportamento novo vira etapa nova; fale com o responsável.`;
  if (temPlano || fichaDevelop.etapas.length) {
    return fichaDevelop.plano.aprovado
      ? `${idSpec} já tem plano aprovado. Veja as etapas livres com "node scripts/specs/specs.mjs status ${idSpec}" e reserve uma com "pegar".`
      : `${idSpec} já tem plano esperando a aprovação do responsável (Plano: ${fichaDevelop.plano.bruto}).`;
  }
  return null;
}

/** O roteiro que o agente (ou a pessoa) segue depois do `planejar`. */
export function roteiroDoPlano({ idSpec, pasta, branch }) {
  return `Plano de implementação da ${idSpec} (policies/specs.md, seção 3). Branch: ${branch}. Pasta: specs/${pasta}/.
1. Leia specs/${pasta}/README.md e spec.md. Confira no código de cada repositório citado cada ponto de "Situação atual" e registre no spec.md, numa tabela "Ponto do plano | Conferido | Observação", o que foi confirmado, o que é diferente e o que não foi encontrado.
2. Preencha specs/${pasta}/plano.md (já copiado do modelo): etapas E01, E02…, ordem, arquivos por repositório, divisão em partes de até 500 linhas de código, riscos e como provar cada critério de aceite. Em cada etapa, escreva "**Execução:**" com os passos numerados na ordem em que acontecem: "🤖" para o que a IA entrega por PR (código, testes, configuração versionada, documentação) e "👤" para a ação humana (variável de ambiente, secret, token, acesso, conta, configuração no GitHub ou no provedor, custo, aprovação), com quem faz, onde e como conferir, terminando em "**Confirmado:** pendente". A execução para no primeiro 👤 pendente.
3. Crie specs/${pasta}/contexto/<repositório>.md para cada repositório tocado, pelo modelo templates/spec/contexto/repositorio.md.
4. Preencha a tabela de etapas de specs/${pasta}/README.md, todas como planejada (ou bloqueada, com o motivo no plano).
5. Em specs/${pasta}/decisoes.md, seção "Perguntas ao responsável", levante toda decisão e dúvida que não cabe a quem planeja: cada pergunta com contexto, recomendação, "Decidir em" (antes da aprovação ou a etapa) e "Resposta: pendente". Pelo menos uma pergunta.
6. Rode "node scripts/specs/specs.mjs catalogo" e "node scripts/specs/specs.mjs validar --base origin/develop". Deixe "Plano: pendente".
7. Faça commit só da pasta da spec e do painel, abra um PR para develop com o título "docs(specs): plano da ${idSpec}" e pare. Não escreva código: a implementação começa só depois de o responsável responder as perguntas e aprovar o plano.`;
}