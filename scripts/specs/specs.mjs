#!/usr/bin/env node
// Registro de specs: status, reserva, conclusão e validação. Regras em policies/specs.md.
// Uso: node scripts/specs/specs.mjs <status|pegar|concluir|catalogo|validar> [...]
import { execFileSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import * as lib from "./lib.mjs";

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const DONO = process.env.SPECS_GITHUB_DONO || "nord-center-org";
const INFRA = process.env.SPECS_REPOSITORIO_INFRA || "nord-center-infra-agent";
const REPOSITORIOS = (process.env.SPECS_REPOSITORIOS || `${INFRA},nord-tool-backend,nord-tool-frontend,nord-tool-scripts-sql`)
  .split(",").map(s => s.trim()).filter(Boolean);
const DEVELOP = "origin/develop";

const AJUDA = `Registro de specs (policies/specs.md)

  status [SPEC-NN]                  status das specs e etapas em ${DEVELOP}; com GITHUB_TOKEN, também branches e PRs abertos
  planejar SPEC-NN [--sem-branch]    começa o plano de uma spec em aberto: cria a branch docs-spec-NN-plano, copia os modelos e imprime o roteiro
  pegar SPEC-NN ENN --responsavel <login> --branch <branch> [--desbloquear]
                                    reserva uma etapa livre na cópia local (recusa se já implementada, corrigida ou em andamento)
  concluir SPEC-NN ENN --pr <url> [--pr <url>…]
                                    marca a etapa em andamento como concluída, com os PRs
  catalogo                          recalcula situação (🟢 🟡 🔴), progresso e resumo em todas-as-specs.md
  validar [--base <ref>]            confere formato, catálogo e, com --base, as transições e os outros PRs abertos`;

class ErroDeUso extends Error {}

const git = args => execFileSync("git", args, { cwd: RAIZ, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
const refExiste = ref => { try { git(["rev-parse", "--verify", "--quiet", `${ref}^{commit}`]); return true; } catch { return false; } };

// textos: Map pasta → { ficha, plano, decisoes } (texto de cada arquivo ou null).
function montarEstado(catalogoTexto, textos) {
  const catalogo = catalogoTexto === null ? { specs: [], resumo: null, erros: [] } : lib.lerCatalogo(catalogoTexto);
  const fichas = new Map();
  const perguntas = new Map();
  const errosFicha = [];
  for (const [pasta, arquivos] of textos) {
    if (arquivos.ficha === null) { errosFicha.push(`specs/${pasta}/: falta o README.md (ficha).`); continue; }
    const ficha = lib.lerFicha(arquivos.ficha, `specs/${pasta}/README.md`);
    fichas.set(pasta, ficha);
    perguntas.set(pasta, lib.lerPerguntas(arquivos.decisoes));
    errosFicha.push(...lib.validarFicha(ficha, pasta), ...lib.validarPlanejamento(ficha, pasta, arquivos));
  }
  return { catalogoTexto, catalogo, fichas, perguntas, textos, errosFicha };
}

const ARQUIVOS_DA_PASTA = { ficha: "README.md", plano: "plano.md", decisoes: "decisoes.md" };

function lerEstadoLocal() {
  const dir = path.join(RAIZ, "specs");
  const catalogo = path.join(RAIZ, lib.ARQUIVO_CATALOGO);
  if (!existsSync(catalogo)) throw new ErroDeUso(`${lib.ARQUIVO_CATALOGO} não encontrado.`);
  const textos = new Map();
  for (const entrada of readdirSync(dir, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
    if (!entrada.isDirectory() || !entrada.name.startsWith("SPEC-")) continue;
    const ler = nome => { const f = path.join(dir, entrada.name, nome); return existsSync(f) ? readFileSync(f, "utf8") : null; };
    textos.set(entrada.name, Object.fromEntries(Object.entries(ARQUIVOS_DA_PASTA).map(([chave, nome]) => [chave, ler(nome)])));
  }
  return montarEstado(readFileSync(catalogo, "utf8"), textos);
}

function lerEstadoRef(ref) {
  if (!refExiste(ref)) throw new ErroDeUso(`Referência ${ref} não encontrada. Rode: git fetch origin develop`);
  let catalogoTexto;
  try { catalogoTexto = git(["show", `${ref}:${lib.ARQUIVO_CATALOGO}`]); } catch { return montarEstado(null, new Map()); }
  const pastas = git(["ls-tree", "-d", "--name-only", `${ref}:specs`]).split(/\r?\n/).map(s => s.trim()).filter(n => n.startsWith("SPEC-"));
  const ler = (pasta, nome) => { try { return git(["show", `${ref}:specs/${pasta}/${nome}`]); } catch { return null; } };
  const textos = new Map(pastas.map(p => [p, Object.fromEntries(Object.entries(ARQUIVOS_DA_PASTA).map(([chave, nome]) => [chave, ler(p, nome)]))]));
  return montarEstado(catalogoTexto, textos);
}
// ---------- GitHub (opcional: só com GITHUB_TOKEN) ----------

async function github(caminhoOuUrl) {
  const url = caminhoOuUrl.startsWith("https://") ? caminhoOuUrl : `https://api.github.com${caminhoOuUrl}`;
  const resposta = await fetch(url, {
    headers: { Authorization: `Bearer ${process.env.GITHUB_TOKEN}`, Accept: "application/vnd.github+json", "X-GitHub-Api-Version": "2022-11-28", "User-Agent": "nord-specs-script" },
  });
  if (!resposta.ok) throw new Error(`GitHub respondeu ${resposta.status} em ${new URL(url).pathname}`);
  const proxima = /<([^>]+)>;\s*rel="next"/.exec(resposta.headers.get("link") ?? "")?.[1] ?? null;
  return { dados: await resposta.json(), proxima };
}

async function githubTodas(caminho) {
  const todos = [];
  for (let url = caminho; url;) {
    const { dados, proxima } = await github(url);
    todos.push(...dados);
    url = proxima;
  }
  return todos;
}

/** Branches de todos os repositórios que citam uma etapa (spec-NN-eNN). */
async function branchesDeEtapas(avisos) {
  const encontradas = [];
  for (const repo of REPOSITORIOS) {
    try {
      for (const { name } of await githubTodas(`/repos/${DONO}/${repo}/branches?per_page=100`)) {
        const etapa = lib.etapaDaBranch(name);
        if (etapa) encontradas.push({ repo, branch: name, ...etapa });
      }
    } catch (erro) { avisos.push(`Não consegui listar as branches de ${repo}: ${erro.message}`); }
  }
  return encontradas;
}

/** Reservas feitas por cada PR aberto da infra, em relação ao estado `base`. */
async function reservasDeOutrosPrs(base, { excluirPr = 0, repo = process.env.GITHUB_REPOSITORY || `${DONO}/${INFRA}` } = {}) {
  const resultado = [];
  for (const pr of await githubTodas(`/repos/${repo}/pulls?state=open&per_page=100`)) {
    if (pr.number === excluirPr) continue;
    const arquivos = await githubTodas(`/repos/${repo}/pulls/${pr.number}/files?per_page=100`);
    const caminhos = arquivos.filter(a => a.status !== "removed" && /^specs\/SPEC-[^/]+\/README\.md$/.test(a.filename)).map(a => a.filename);
    if (caminhos.length === 0) continue;
    const fichasHead = new Map();
    for (const caminho of caminhos) {
      const { dados } = await github(`/repos/${repo}/contents/${caminho.split("/").map(encodeURIComponent).join("/")}?ref=${pr.head.sha}`);
      fichasHead.set(caminho.split("/")[1], lib.lerFicha(Buffer.from(dados.content, "base64").toString("utf8"), caminho));
    }
    resultado.push({ numero: pr.number, url: pr.html_url, autor: pr.user?.login ?? "?", branch: pr.head.ref, reservas: lib.reservasDoPr(base.fichas, fichasHead) });
  }
  return resultado;
}

// ---------- Comandos ----------

function normalizarIds(spec, etapa) {
  // Aceita "SPEC-03", "spec-3", "spec03", "03" ou "3"; e "E03", "e3" ou "3".
  const numSpec = /^(?:spec-?)?(\d{1,2})$/i.exec(String(spec ?? "").trim())?.[1];
  const numEtapa = /^e?(\d{1,2})$/i.exec(String(etapa ?? "").trim())?.[1];
  const idSpec = numSpec ? `SPEC-${numSpec.padStart(2, "0")}` : String(spec ?? "").toUpperCase();
  const idEtapa = numEtapa ? `E${numEtapa.padStart(2, "0")}` : String(etapa ?? "").toUpperCase();
  if (!/^SPEC-\d{2}$/.test(idSpec)) throw new ErroDeUso(`ID de spec inválido: "${spec ?? ""}" (ex.: SPEC-01).`);
  if (etapa !== undefined && !/^E\d{2}$/.test(idEtapa)) throw new ErroDeUso(`ID de etapa inválido: "${etapa}" (ex.: E03).`);
  return { idSpec, idEtapa };
}

const pastaDaSpec = (estado, idSpec) => estado.catalogo.specs.find(s => s.id === idSpec)?.pasta ?? null;

function atualizarDevelop(avisos) {
  try { git(["fetch", "origin", "develop", "--quiet"]); } catch { avisos.push(`Não consegui atualizar ${DEVELOP}; usei a referência que já estava na máquina.`); }
}

function gravarEtapa(pasta, etapa, dados) {
  const arquivo = path.join(RAIZ, "specs", pasta, "README.md");
  const texto = readFileSync(arquivo, "utf8");
  writeFileSync(arquivo, lib.trocarLinha(texto, etapa.indice, lib.linhaDeTabela(lib.celulasEtapa(etapa, dados))));
  return gravarCatalogo();
}

function gravarCatalogo() {
  const local = lerEstadoLocal();
  const { calculados, resumo } = lib.validarCatalogo(local.catalogo, local.fichas);
  const novo = lib.catalogoAtualizado(local.catalogoTexto, local.catalogo, calculados, resumo);
  if (novo === local.catalogoTexto) return false;
  writeFileSync(path.join(RAIZ, lib.ARQUIVO_CATALOGO), novo);
  return true;
}

function linhaEtapa(etapa, tipo) {
  const dono = etapa.responsavel ? ` — ${etapa.responsavel}${etapa.branch ? `, ${etapa.branch}` : ""}${etapa.desde ? `, desde ${etapa.desde}` : ""}` : "";
  const prs = etapa.status === "concluida" ? ` — ${lib.verboEntregue(tipo)}: ${etapa.prs.join(", ")}` : "";
  return `  ${etapa.id} ${etapa.status.padEnd(12)} ${etapa.titulo}${etapa.status === "concluida" ? prs : dono}`;
}

async function status(filtro) {
  const avisos = [];
  const { idSpec } = filtro ? normalizarIds(filtro) : { idSpec: null };
  atualizarDevelop(avisos);
  const doDevelop = refExiste(DEVELOP) ? lerEstadoRef(DEVELOP) : null;
  const usarDevelop = Boolean(doDevelop?.catalogo.specs.length);
  if (!usarDevelop) avisos.push(`${DEVELOP} ainda não tem o catálogo de specs; mostrei a cópia local.`);
  const estado = usarDevelop ? doDevelop : lerEstadoLocal();
  if (estado.catalogo.specs.length === 0) throw new ErroDeUso(`Sem catálogo de specs em ${lib.ARQUIVO_CATALOGO}.`);
  console.log(`Fonte: ${usarDevelop ? DEVELOP : "cópia local"}\n`);

  const specs = estado.catalogo.specs.filter(s => !idSpec || s.id === idSpec);
  if (idSpec && specs.length === 0) throw new ErroDeUso(`${idSpec} não está no catálogo.`);
  const semPasta = [];
  for (const spec of specs) {
    const ficha = spec.pasta ? estado.fichas.get(spec.pasta) : null;
    if (!ficha) { semPasta.push(spec); continue; }
    console.log(`${spec.id} — ${spec.titulo} [${spec.tipo}, ${spec.prioridade}] ${spec.situacao} · ${spec.progresso} · plano: ${ficha.plano.bruto}`);
    for (const etapa of ficha.etapas) console.log(linhaEtapa(etapa, ficha.tipo));
    console.log("");
  }
  for (const spec of semPasta) {
    const texto = spec.situacao.startsWith("⚪ Incorporada") ? "incorporada a outra spec; não tem pasta" : "ainda sem pasta (crie pelos modelos de templates/spec/, policies/specs.md seção 3)";
    console.log(`${spec.id} — ${spec.titulo}: ${texto}`);
  }

  if (!process.env.GITHUB_TOKEN) {
    avisos.push("Sem GITHUB_TOKEN: não conferi branches nem PRs abertos nos repositórios.");
  } else {
    const etapas = new Map();
    for (const ficha of estado.fichas.values()) for (const e of ficha.etapas) etapas.set(`${ficha.id}/${e.id}`, { ...e, tipo: ficha.tipo });
    const branches = (await branchesDeEtapas(avisos)).filter(b => !idSpec || b.spec === idSpec);
    if (branches.length) console.log("\nBranches que citam etapas:");
    for (const b of branches) {
      const etapa = etapas.get(`${b.spec}/${b.etapa}`);
      let nota = "etapa não existe na ficha";
      if (etapa?.status === "concluida") nota = `etapa já ${lib.verboEntregue(etapa.tipo)}; a branch pode ser apagada`;
      else if (etapa?.status === "em-andamento") nota = etapa.branch === b.branch || b.branch.endsWith("-reserva") ? `reservada por ${etapa.responsavel}` : `ATENÇÃO: a etapa está reservada na branch ${etapa.branch}`;
      else if (etapa) nota = b.branch.endsWith("-reserva") ? "reserva em andamento (PR ainda não integrado)" : `ATENÇÃO: etapa ${etapa.status}, sem reserva em develop`;
      console.log(`  ${b.repo}: ${b.branch} — ${b.spec} ${b.etapa}: ${nota}`);
    }
    const prs = await reservasDeOutrosPrs(estado);
    for (const pr of prs) for (const [chave, etapa] of pr.reservas) {
      if (!idSpec || chave.startsWith(`${idSpec}/`)) console.log(`  PR #${pr.numero} (${pr.autor}) marca ${chave.replace("/", " ")} como ${etapa.status}: ${pr.url}`);
    }
  }
  for (const aviso of avisos) console.warn(`Aviso: ${aviso}`);
}

async function pegar([spec, etapaArg], opcoes) {
  const { idSpec, idEtapa } = normalizarIds(spec, etapaArg);
  const responsavel = lib.limparCelula(opcoes.responsavel);
  const branch = lib.limparCelula(opcoes.branch);
  if (!responsavel) throw new ErroDeUso("Informe --responsavel <login do GitHub>.");
  const erroBranch = lib.erroBranchEtapa(branch, idSpec, idEtapa);
  if (erroBranch) throw new ErroDeUso(`--branch: ${erroBranch}. Ex.: ci-${lib.tokenEtapa(idSpec, idEtapa)}-<resumo>`);
  const atual = git(["branch", "--show-current"]).trim();
  if (!atual || ["develop", "master", "main"].includes(atual)) {
    throw new ErroDeUso(`Você está em "${atual || "HEAD solto"}". Crie a branch de reserva: git switch -c docs-${lib.tokenEtapa(idSpec, idEtapa)}-reserva ${DEVELOP}`);
  }

  const avisos = [];
  atualizarDevelop(avisos);
  const develop = lerEstadoRef(DEVELOP);
  const local = lerEstadoLocal();
  const pasta = pastaDaSpec(develop, idSpec) ?? pastaDaSpec(local, idSpec);
  const motivo = lib.motivoParaNaoPegar({
    fichaDevelop: pasta ? develop.fichas.get(pasta) : null,
    fichaLocal: pasta ? local.fichas.get(pasta) : null,
    idEtapa, desbloquear: Boolean(opcoes.desbloquear),
    perguntas: pasta ? develop.perguntas.get(pasta) : null,
  });
  if (motivo) return falhar(`Não dá para pegar: ${motivo}`, avisos);

  if (process.env.GITHUB_TOKEN) {
    const outras = (await branchesDeEtapas(avisos)).filter(b => b.spec === idSpec && b.etapa === idEtapa && b.branch !== branch && b.branch !== atual);
    if (outras.length) return falhar(`Não dá para pegar: já existe trabalho nesta etapa em ${outras.map(b => `${b.repo}/${b.branch}`).join(", ")}. Fale com quem criou antes.`, avisos);
    const chave = `${idSpec}/${idEtapa}`;
    const prs = (await reservasDeOutrosPrs(develop)).filter(pr => pr.reservas.has(chave) && pr.branch !== atual);
    if (prs.length) return falhar(`Não dá para pegar: o PR ${prs.map(pr => `#${pr.numero} (${pr.autor})`).join(", ")} já está reservando ${idSpec} ${idEtapa}.`, avisos);
  } else {
    avisos.push("Sem GITHUB_TOKEN: não conferi branches nem PRs abertos de outras pessoas. O CI confere ao abrir o PR.");
  }

  const etapa = local.fichas.get(pasta)?.etapas.find(e => e.id === idEtapa);
  if (!etapa) throw new ErroDeUso(`${idSpec} ${idEtapa} não existe na cópia local. Atualize a branch com ${DEVELOP} e tente de novo.`);
  gravarEtapa(pasta, etapa, { status: "em-andamento", responsavel, branch, desde: lib.hoje() });
  console.log(`${idSpec} ${idEtapa} reservada para ${responsavel} na branch ${branch}.

Próximos passos:
  git add ${lib.ARQUIVO_CATALOGO} specs/${pasta}/README.md
  git commit -m "docs(specs): reserva da ${idSpec} ${idEtapa}"
  git push -u origin ${atual}
  Abra o PR para develop e só comece o código depois que ele for integrado.`);
  for (const aviso of avisos) console.warn(`Aviso: ${aviso}`);
}

async function planejar([spec], opcoes) {
  const { idSpec } = normalizarIds(spec);
  const branch = lib.branchDoPlano(idSpec);
  const avisos = [];
  if (git(["status", "--porcelain"]).trim()) throw new ErroDeUso("Há mudanças não commitadas na infra. Faça commit ou stash antes de começar o plano.");
  atualizarDevelop(avisos);
  const develop = lerEstadoRef(DEVELOP);
  const linha = develop.catalogo.specs.find(s => s.id === idSpec);
  const pasta = linha?.pasta ?? null;
  const motivo = lib.motivoParaNaoPlanejar({
    idSpec, spec: linha,
    fichaDevelop: pasta ? develop.fichas.get(pasta) : null,
    temPlano: Boolean(pasta && develop.textos.get(pasta)?.plano),
  });
  if (motivo) return falhar(`Não dá para planejar: ${motivo}`, avisos);
  if (linha.situacao.startsWith("🔴")) avisos.push(`${idSpec} está ${linha.situacao}: o plano pode ser feito agora, mas nenhuma etapa começa antes de as dependências terminarem.`);

  if (process.env.GITHUB_TOKEN) {
    const repo = process.env.GITHUB_REPOSITORY || `${DONO}/${INFRA}`;
    const atual = git(["branch", "--show-current"]).trim();
    const outras = (await githubTodas(`/repos/${repo}/branches?per_page=100`)).map(b => b.name)
      .filter(nome => nome !== atual && new RegExp(`(^|-)${idSpec.toLowerCase()}-plano(-|$)`).test(nome));
    if (outras.length) return falhar(`Não dá para planejar: alguém já está montando o plano da ${idSpec} na branch ${outras.join(", ")}.`, avisos);
    for (const pr of await githubTodas(`/repos/${repo}/pulls?state=open&per_page=100`)) {
      const arquivos = await githubTodas(`/repos/${repo}/pulls/${pr.number}/files?per_page=100`);
      if (arquivos.some(a => a.filename === `specs/${pasta}/plano.md`)) return falhar(`Não dá para planejar: o PR #${pr.number} (${pr.user?.login ?? "?"}) já traz um plano da ${idSpec}: ${pr.html_url}`, avisos);
    }
  } else {
    avisos.push("Sem GITHUB_TOKEN: não conferi se outra pessoa já está montando este plano.");
  }

  if (!opcoes["sem-branch"]) {
    const atual = git(["branch", "--show-current"]).trim();
    if (atual !== branch) {
      try { git(["switch", "-c", branch, DEVELOP]); } catch (erro) { throw new ErroDeUso(`Não consegui criar a branch ${branch} (${String(erro.stderr || erro.message).trim()}). Se ela já existe, continue nela ou use --sem-branch.`); }
    }
  }
  const destino = path.join(RAIZ, "specs", pasta);
  for (const nome of ["plano.md", "decisoes.md"]) {
    const arquivo = path.join(destino, nome);
    if (existsSync(arquivo)) continue;
    const modelo = readFileSync(path.join(RAIZ, "templates", "spec", nome), "utf8");
    writeFileSync(arquivo, modelo.replace(/SPEC-NN/g, idSpec));
  }
  console.log(`Branch ${opcoes["sem-branch"] ? "atual" : branch} pronta; plano.md e decisoes.md copiados dos modelos para specs/${pasta}/.\n`);
  console.log(lib.roteiroDoPlano({ idSpec, pasta, branch }));
  for (const aviso of avisos) console.warn(`\nAviso: ${aviso}`);
}

function concluir([spec, etapaArg], opcoes) {
  const { idSpec, idEtapa } = normalizarIds(spec, etapaArg);
  const novos = [opcoes.pr ?? []].flat().flatMap(lib.prsDaCelula);
  if (novos.length === 0) throw new ErroDeUso("Informe ao menos um --pr https://github.com/<dono>/<repo>/pull/N.");
  const local = lerEstadoLocal();
  const pasta = pastaDaSpec(local, idSpec);
  const ficha = pasta ? local.fichas.get(pasta) : null;
  const etapa = ficha?.etapas.find(e => e.id === idEtapa);
  if (!etapa) throw new ErroDeUso(`${idSpec} ${idEtapa} não existe na cópia local.`);
  if (etapa.status !== "em-andamento") return falhar(`Só uma etapa em andamento pode ser concluída; ${idSpec} ${idEtapa} está ${etapa.status}.`);
  const prs = [...new Set([...etapa.prs, ...novos])];
  gravarEtapa(pasta, etapa, { status: "concluida", responsavel: etapa.responsavel, branch: etapa.branch, prs, desde: lib.hoje() });
  console.log(`${idSpec} ${idEtapa} marcada como concluída (${lib.verboEntregue(ficha.tipo)}) com ${prs.length} PR(s). Inclua ${lib.ARQUIVO_CATALOGO} e specs/${pasta}/README.md no PR da infra da etapa.`);
}

function catalogo() {
  console.log(gravarCatalogo() ? `${lib.ARQUIVO_CATALOGO}: situação, progresso e resumo atualizados.` : `${lib.ARQUIVO_CATALOGO}: já está em dia.`);
}

async function validar(opcoes) {
  const local = lerEstadoLocal();
  const erros = [...local.errosFicha, ...lib.validarCatalogo(local.catalogo, local.fichas).erros];
  const avisos = [];
  if (opcoes.base) {
    const base = lerEstadoRef(opcoes.base);
    const rotulos = String(process.env.PR_LABELS ?? "").split(",").map(s => s.trim()).filter(Boolean);
    erros.push(...lib.validarTransicoes(base, local, { rotulos }));
    const numero = Number(process.env.PR_NUMBER || 0);
    const minhas = lib.reservasDoPr(base.fichas, local.fichas);
    if (minhas.size && process.env.GITHUB_TOKEN && numero) {
      erros.push(...lib.conflitosComOutrosPrs(minhas, await reservasDeOutrosPrs(base, { excluirPr: numero })));
    } else if (minhas.size) {
      avisos.push("Sem GITHUB_TOKEN e PR_NUMBER: não conferi se outro PR aberto reserva as mesmas etapas.");
    }
  }
  for (const aviso of avisos) console.warn(`Aviso: ${aviso}`);
  if (erros.length) return falhar(`Registro de specs com ${erros.length} problema(s):\n${erros.map(e => `  - ${e}`).join("\n")}`);
  const etapas = [...local.fichas.values()].reduce((n, f) => n + f.etapas.length, 0);
  console.log(`Registro de specs válido: ${local.catalogo.specs.length} specs no catálogo, ${local.fichas.size} pastas, ${etapas} etapas${opcoes.base ? `, transições conferidas contra ${opcoes.base}` : ""}.`);
}

function falhar(mensagem, avisos = []) {
  for (const aviso of avisos) console.warn(`Aviso: ${aviso}`);
  console.error(mensagem);
  process.exitCode = 1;
}

function lerArgumentos(argv) {
  const posicionais = [];
  const opcoes = {};
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (!arg.startsWith("--")) { posicionais.push(arg); continue; }
    const nome = arg.slice(2);
    if (nome === "desbloquear" || nome === "ajuda" || nome === "sem-branch") { opcoes[nome] = true; continue; }
    const valor = argv[++i];
    if (valor === undefined) throw new ErroDeUso(`--${nome} precisa de um valor.`);
    opcoes[nome] = nome === "pr" ? [...(opcoes.pr ?? []), valor] : valor;
  }
  return { comando: posicionais.shift(), posicionais, opcoes };
}

async function main() {
  const { comando, posicionais, opcoes } = lerArgumentos(process.argv.slice(2));
  if (!comando || opcoes.ajuda) return console.log(AJUDA);
  if (comando === "status") return status(posicionais[0]);
  if (comando === "planejar") return planejar(posicionais, opcoes);
  if (comando === "pegar") return pegar(posicionais, opcoes);
  if (comando === "concluir") return concluir(posicionais, opcoes);
  if (comando === "catalogo") return catalogo();
  if (comando === "validar") return validar(opcoes);
  throw new ErroDeUso(`Comando desconhecido: ${comando}\n\n${AJUDA}`);
}

main().catch(erro => {
  console.error(erro instanceof ErroDeUso ? erro.message : `Erro: ${erro.message}`);
  process.exitCode = erro instanceof ErroDeUso ? 2 : 1;
});
