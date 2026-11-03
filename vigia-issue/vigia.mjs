#!/usr/bin/env node
// Vigia de issue: olha uma issue do GitHub a cada INTERVALO_S segundos (sem IA, de graça) e, quando chega um
// comentário de quem está autorizado, entrega o pedido ao Gemini CLI ou ao Claude Code rodando nesta máquina.
// Uso: configure o .env (veja .env.exemplo) e rode `node vigia.mjs`. Node 18 ou mais novo.

import { spawn } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { MARCA, comandoAgente, lerIssue, listaDeLogins, maiorId, montarPrompt, pedidosNovos, respostaFinal, resumir } from "./lib.mjs";

const AQUI = dirname(fileURLToPath(import.meta.url));

// ---------------------------------------------------------------- configuração

/** Lê o .env desta pasta (CHAVE=valor por linha); variáveis já definidas no sistema têm prioridade. */
function carregarEnv() {
  const arquivo = join(AQUI, ".env");
  if (!existsSync(arquivo)) return;
  for (const linha of readFileSync(arquivo, "utf8").split(/\r?\n/)) {
    const m = /^\s*([A-Z_][A-Z0-9_]*)\s*=\s*(.*?)\s*$/.exec(linha);
    if (!m || linha.trim().startsWith("#")) continue;
    const valor = m[2].replace(/^["']|["']$/g, "");
    if (process.env[m[1]] === undefined) process.env[m[1]] = valor;
  }
}
carregarEnv();

function obrigatoria(nome) {
  const v = process.env[nome]?.trim();
  if (!v) {
    console.error(`Falta ${nome} no .env (veja .env.exemplo).`);
    process.exit(1);
  }
  return v;
}

const TOKEN = obrigatoria("GITHUB_TOKEN");
const ISSUE = lerIssue(obrigatoria("ISSUE"));
const AUTORIZADOS = listaDeLogins(obrigatoria("AUTORIZADOS"));
const AGENTE = (process.env.AGENTE ?? "gemini").trim().toLowerCase();
const COMANDO = { ...comandoAgente(AGENTE, process.env.AGENTE_ARGS), ...(process.env.AGENTE_CMD?.trim() ? { cmd: process.env.AGENTE_CMD.trim() } : {}) };
const PASTA = resolve(obrigatoria("PASTA_TRABALHO"));
const INTERVALO_MS = Math.max(15, Number(process.env.INTERVALO_S ?? 30)) * 1000;
const LIMITE_MS = Math.max(5, Number(process.env.TEMPO_MAX_MIN ?? 60)) * 60_000;
const ARQ_ESTADO = join(AQUI, ".vigia-estado.json");
const NOME_ISSUE = `${ISSUE.dono}/${ISSUE.repo}#${ISSUE.numero}`;

if (!existsSync(PASTA)) {
  console.error(`PASTA_TRABALHO não existe: ${PASTA}`);
  process.exit(1);
}

// ---------------------------------------------------------------- GitHub

const API = `${(process.env.GITHUB_API ?? "https://api.github.com").replace(/\/$/, "")}/repos/${ISSUE.dono}/${ISSUE.repo}`;

async function github(caminho, opcoes = {}) {
  const r = await fetch(caminho.startsWith("http") ? caminho : `${API}${caminho}`, {
    ...opcoes,
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${TOKEN}`,
      "X-GitHub-Api-Version": "2022-11-28",
      "User-Agent": "nord-vigia-issue",
      ...(opcoes.body ? { "Content-Type": "application/json" } : {}),
    },
  });
  if (!r.ok) throw new Error(`GitHub ${r.status} em ${caminho}: ${resumir(await r.text(), 200)}`);
  return r.status === 204 ? null : r.json();
}

/** Todos os comentários da issue (paginado; issues de conversa costumam ter poucos). */
async function comentarios() {
  const todos = [];
  for (let pagina = 1; pagina <= 20; pagina++) {
    const lote = await github(`/issues/${ISSUE.numero}/comments?per_page=100&page=${pagina}`);
    todos.push(...lote);
    if (lote.length < 100) break;
  }
  return todos;
}

const comentar = corpo => github(`/issues/${ISSUE.numero}/comments`, { method: "POST", body: JSON.stringify({ body: corpo }) });
const reagir = (idComentario, reacao) =>
  github(`/issues/comments/${idComentario}/reactions`, { method: "POST", body: JSON.stringify({ content: reacao }) }).catch(() => {});

// ---------------------------------------------------------------- estado

function lerEstado() {
  try { return JSON.parse(readFileSync(ARQ_ESTADO, "utf8")); } catch { return null; }
}
const salvarEstado = estado => writeFileSync(ARQ_ESTADO, JSON.stringify(estado, null, 2));

// ---------------------------------------------------------------- agente

/** Roda o agente com o pedido na entrada padrão; devolve a saída e se terminou bem. */
function rodarAgente(prompt) {
  return new Promise(ok => {
    const filho = spawn(COMANDO.cmd, COMANDO.args, {
      cwd: PASTA,
      // No Windows, gemini/claude são atalhos .cmd: precisam do shell. Os argumentos não têm o pedido, então não há aspas a escapar.
      shell: process.platform === "win32",
      stdio: ["pipe", "pipe", "pipe"],
      env: process.env,
    });
    let saida = "";
    const juntar = d => { saida += d.toString(); if (saida.length > 200_000) saida = saida.slice(-100_000); process.stdout.write(d); };
    filho.stdout.on("data", juntar);
    filho.stderr.on("data", juntar);
    const relogio = setTimeout(() => { saida += `\n(passou de ${LIMITE_MS / 60_000} min: interrompido)`; filho.kill(); }, LIMITE_MS);
    filho.on("error", e => { clearTimeout(relogio); ok({ ok: false, saida: `Não consegui iniciar "${COMANDO.cmd}": ${e.message}. Ele está instalado e no PATH?` }); });
    filho.on("close", codigo => { clearTimeout(relogio); ok({ ok: codigo === 0, saida }); });
    filho.stdin.end(prompt);
  });
}

// ---------------------------------------------------------------- laço

let ocupado = false;

async function rodada(estado) {
  if (ocupado) return;
  const lista = await comentarios();
  const novos = pedidosNovos(lista, estado.ultimoId, AUTORIZADOS);
  // Avança sempre: comentário de quem não é autorizado também não é reprocessado.
  const ultimoVisto = maiorId(lista, estado.ultimoId);
  if (!novos.length) {
    if (ultimoVisto !== estado.ultimoId) salvarEstado({ ...estado, ultimoId: ultimoVisto });
    estado.ultimoId = ultimoVisto;
    return;
  }
  ocupado = true;
  try {
    for (const pedido of novos) {
      const autor = pedido.user.login;
      console.log(`\n[${new Date().toLocaleString("pt-BR")}] Pedido de ${autor} (${pedido.html_url})`);
      await reagir(pedido.id, "eyes");
      await comentar(`${MARCA}\n👀 Recebi. O **${AGENTE}** está trabalhando nisso nesta máquina; respondo aqui quando terminar.`);
      const historico = lista
        .filter(c => c.id < pedido.id)
        .slice(-6)
        .map(c => ({ autor: String(c.body ?? "").includes(MARCA) ? "vigia" : c.user.login, texto: String(c.body ?? "").replace(MARCA, "").trim() }));
      const inicio = Date.now();
      const r = await rodarAgente(montarPrompt({ pedido: pedido.body, autor, issue: NOME_ISSUE, historico, pastaTrabalho: PASTA }));
      const minutos = Math.max(1, Math.round((Date.now() - inicio) / 60_000));
      await comentar(respostaFinal({ ...r, minutos, agente: AGENTE }));
      await reagir(pedido.id, r.ok ? "+1" : "confused");
      // Grava a cada pedido: se a máquina desligar no meio, o próximo não repete o que já foi feito.
      estado.ultimoId = Math.max(estado.ultimoId, pedido.id);
      salvarEstado(estado);
    }
    estado.ultimoId = Math.max(estado.ultimoId, ultimoVisto);
    salvarEstado(estado);
  } finally {
    ocupado = false;
  }
}

async function iniciar() {
  let estado = lerEstado();
  if (!estado || estado.issue !== NOME_ISSUE) {
    // Primeira vez nesta issue: começa a partir de agora (não executa o histórico antigo).
    const lista = await comentarios();
    estado = { issue: NOME_ISSUE, ultimoId: maiorId(lista, 0) };
    salvarEstado(estado);
  }
  console.log(`Vigiando ${NOME_ISSUE} a cada ${INTERVALO_MS / 1000} s · agente: ${AGENTE} · autorizados: ${AUTORIZADOS.join(", ")} · pasta: ${PASTA}`);
  console.log("Deixe esta janela aberta. Ctrl+C para parar.");
  let espera = INTERVALO_MS;
  for (;;) {
    try {
      await rodada(estado);
      espera = INTERVALO_MS;
    } catch (e) {
      // Sem internet ou GitHub fora: tenta de novo, esperando cada vez mais (até 5 min).
      espera = Math.min(espera * 2, 5 * 60_000);
      console.error(`[${new Date().toLocaleTimeString("pt-BR")}] ${e.message} · nova tentativa em ${Math.round(espera / 1000)} s`);
    }
    await new Promise(r => setTimeout(r, espera));
  }
}

iniciar().catch(e => {
  console.error(e.message);
  process.exit(1);
});
