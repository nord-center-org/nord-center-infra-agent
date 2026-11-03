// Funções puras do vigia (testadas em lib.test.mjs): sem rede, sem disco, sem processo.

/** Marca invisível nos comentários do próprio vigia: ele nunca trata a própria resposta como pedido. */
export const MARCA = "<!-- vigia-issue -->";

/** "dono/repo#123" → { dono, repo, numero }. */
export function lerIssue(texto) {
  const m = /^([A-Za-z0-9-]+)\/([A-Za-z0-9._-]+)#(\d+)$/.exec(String(texto ?? "").trim());
  if (!m) throw new Error(`ISSUE inválida: use dono/repositorio#numero (veio "${texto}")`);
  return { dono: m[1], repo: m[2], numero: Number(m[3]) };
}

/** Lista separada por vírgula, sem vazios, em minúsculas (login do GitHub não diferencia). */
export const listaDeLogins = texto => String(texto ?? "").split(",").map(s => s.trim().toLowerCase()).filter(Boolean);

/**
 * Comentários que viram pedido: mais novos que o último tratado, escritos por alguém autorizado
 * e que não sejam respostas do próprio vigia. Em ordem de criação.
 */
export function pedidosNovos(comentarios, ultimoId, autorizados) {
  const permitidos = new Set(autorizados.map(a => a.toLowerCase()));
  return comentarios
    .filter(c => c.id > ultimoId && permitidos.has(String(c.user?.login ?? "").toLowerCase()) && !String(c.body ?? "").includes(MARCA))
    .sort((a, b) => a.id - b.id);
}

/** Maior id visto (para não reprocessar nada, inclusive comentários de quem não está autorizado). */
export const maiorId = (comentarios, atual) => comentarios.reduce((m, c) => Math.max(m, c.id), atual);

/** O pedido que o agente recebe pela entrada padrão (sem aspas na linha de comando: funciona igual no Windows). */
export function montarPrompt({ pedido, autor, issue, historico = [], pastaTrabalho }) {
  const contexto = historico.length
    ? `\n\nConversa anterior nesta issue (mais antiga primeiro, só para contexto):\n${historico.map(h => `- ${h.autor}: ${resumir(h.texto, 600)}`).join("\n")}`
    : "";
  return `Você é um agente de desenvolvimento trabalhando na pasta ${pastaTrabalho}, que contém os clones dos repositórios do NordTool.

Pedido de ${autor} na issue ${issue}:
"""
${pedido}
"""${contexto}

Regras obrigatórias:
1. Antes de alterar qualquer repositório, leia o AGENTS.md dele e as instruções do nord-center-infra-agent que ele manda ler (policies, steering, skills e features). Se faltar algo, pare e explique.
2. Siga o fluxo Git das policies: branch dedicada a partir de develop com o nome da policy de features, validações do projeto, PR só para develop e squash merge quando o CI passar. Nunca escreva em develop, master ou main diretamente.
3. Nunca coloque tokens, senhas ou dados pessoais em arquivos, commits ou comentários.
4. Se o pedido for ambíguo ou arriscado (apagar dados, mexer em produção), não execute: explique o que precisa ser decidido.
5. Termine com um resumo curto em português para quem fez o pedido: o que foi feito, links dos PRs e o que ficou pendente.`;
}

/** Corta texto longo pelo começo ou pelo fim, avisando o corte. */
export function resumir(texto, max, doFim = false) {
  const t = String(texto ?? "").trim();
  if (t.length <= max) return t;
  return doFim ? `…${t.slice(t.length - max + 1)}` : `${t.slice(0, max - 1)}…`;
}

/** Comando de cada agente. O pedido vai pela entrada padrão; os argumentos extras vêm de AGENTE_ARGS. */
export function comandoAgente(agente, argsExtras = "") {
  const extras = String(argsExtras).trim() ? String(argsExtras).trim().split(/\s+/) : null;
  if (agente === "gemini") {
    // Gemini CLI logado com a conta Google (sem chave de API). -p junta o texto ao que vem pela entrada padrão.
    return { cmd: "gemini", args: extras ?? ["--yolo", "-p", "Execute o pedido recebido pela entrada padrão."] };
  }
  if (agente === "claude") {
    // Claude Code logado com a assinatura (sem chave de API). Sem prompt no -p, ele lê da entrada padrão.
    return { cmd: "claude", args: extras ?? ["-p", "--permission-mode", "acceptEdits", "--allowedTools", "Bash,Read,Edit,Write,Glob,Grep,WebFetch"] };
  }
  throw new Error(`AGENTE inválido: use gemini ou claude (veio "${agente}")`);
}

/** Texto da resposta na issue. */
export function respostaFinal({ ok, saida, minutos, agente }) {
  const corpo = resumir(saida || "(o agente não escreveu nada)", 6000, true);
  const titulo = ok ? `✅ Feito pelo ${agente} em ${minutos} min` : `⚠️ O ${agente} terminou com erro em ${minutos} min`;
  return `${MARCA}\n**${titulo}**\n\n${corpo}`;
}
