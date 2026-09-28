import { setTimeout as delay } from "node:timers/promises";
import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { ServerConfig } from "../../server/config.js";
import { getProject, PROJECT_NAMES, type ProjectName } from "../../server/projects.js";
import { GitHubApiError, encodePath, githubJson, githubRequest, repoPath } from "./client.js";

const projectSchema = z.enum(PROJECT_NAMES);
const branchSchema = z.string().regex(/^(feature|fix|chore|refactor|docs)\/[A-Za-z0-9][A-Za-z0-9._/-]*$/).min(8).max(200)
  .refine((branch) => !branch.includes("..") && !branch.endsWith("/") && !branch.endsWith(".") && !branch.includes("//"), "Nome de branch inválido.");
const inputSchema = {
  project: projectSchema,
  branch: branchSchema,
  changes: z.array(z.object({ path: z.string().min(1).max(500), content: z.string() })).min(1).max(100),
  message: z.string().min(1).max(200),
  title: z.string().min(1).max(256),
  body: z.string().max(65_000).default(""),
  timeout_seconds: z.number().int().min(30).max(1800).default(900),
};

interface GitRef { object: { sha: string } }
interface GitCommit { tree: { sha: string } }
interface GitTree { tree: Array<{ path: string; type: string; sha: string }> }
interface PullRequest {
  number: number; title: string; state: string; html_url: string; draft: boolean; merged: boolean; mergeable: boolean | null;
  base: { ref: string }; head: { ref: string; sha: string };
}
interface PullSummary { number: number; html_url: string; state: string; merged_at: string | null; head: { sha: string }; base: { ref: string } }
interface WorkflowRuns {
  total_count: number;
  workflow_runs: Array<{ id: number; name: string; status: string; conclusion: string | null; head_sha: string; html_url: string }>;
}
interface ContentFile { type: string; content?: string; encoding?: string }

const toolText = (value: unknown) => ({ content: [{ type: "text" as const, text: JSON.stringify(value, null, 2) }] });
const toolError = (error: unknown) => ({ isError: true, content: [{ type: "text" as const, text: error instanceof Error ? error.message : "Falha no fluxo automatizado." }] });

function validateChanges(changes: Array<{ path: string; content: string }>): void {
  const seen = new Set<string>();
  let totalBytes = 0;
  for (const change of changes) {
    const filePath = change.path;
    if (filePath.startsWith("/") || filePath.includes("\\") || filePath.split("/").some((segment) => !segment || segment === "." || segment === "..")) {
      throw new Error(`Caminho inválido: ${filePath}`);
    }
    if (filePath.split("/").some((segment) => segment.toLowerCase() === ".git")) throw new Error("Não é permitido alterar metadados Git pelo MCP.");
    if (/(^|\/)\.env(?:\.|$)/i.test(filePath) || /\.(?:pem|key|p12|pfx)$/i.test(filePath) || /(^|\/)(?:id_rsa|id_ed25519|credentials\.json)$/i.test(filePath)) {
      throw new Error(`Caminho de credencial bloqueado: ${filePath}`);
    }
    if (seen.has(filePath)) throw new Error(`Arquivo repetido no conjunto de alterações: ${filePath}`);
    seen.add(filePath);
    totalBytes += Buffer.byteLength(change.content, "utf8");
    if (Buffer.byteLength(change.content, "utf8") > 1_000_000) throw new Error(`Arquivo excede 1 MiB: ${filePath}`);
  }
  if (totalBytes > 5_000_000) throw new Error("O conjunto de alterações excede 5 MB.");
}

async function readBranch(config: ServerConfig, project: ProjectName, branch: string): Promise<string | undefined> {
  try {
    const ref = await githubRequest<GitRef>(config, repoPath(project, `/git/ref/heads/${encodePath(branch)}`));
    return ref.object.sha;
  } catch (error) {
    if (error instanceof GitHubApiError && error.status === 404) return undefined;
    throw error;
  }
}

async function requestedFilesMatch(config: ServerConfig, project: ProjectName, branch: string, changes: Array<{ path: string; content: string }>): Promise<boolean> {
  for (const change of changes) {
    try {
      const file = await githubRequest<ContentFile>(config, `${repoPath(project, `/contents/${encodePath(change.path)}`)}?ref=${encodeURIComponent(branch)}`);
      if (file.type !== "file" || file.encoding !== "base64" || !file.content) return false;
      if (Buffer.from(file.content.replace(/\n/g, ""), "base64").toString("utf8") !== change.content) return false;
    } catch (error) {
      if (error instanceof GitHubApiError && error.status === 404) return false;
      throw error;
    }
  }
  return true;
}

async function createSingleCommit(config: ServerConfig, project: ProjectName, branch: string, message: string, changes: Array<{ path: string; content: string }>): Promise<string> {
  const base = await githubRequest<GitRef>(config, repoPath(project, "/git/ref/heads/develop"));
  const baseCommit = await githubRequest<GitCommit>(config, repoPath(project, `/git/commits/${base.object.sha}`));
  const tree = await githubJson<{ sha: string }>(config, repoPath(project, "/git/trees"), "POST", {
    base_tree: baseCommit.tree.sha,
    tree: changes.map(({ path, content }) => ({ path, mode: "100644", type: "blob", content })),
  });
  const commit = await githubJson<{ sha: string }>(config, repoPath(project, "/git/commits"), "POST", {
    message, tree: tree.sha, parents: [base.object.sha],
  });

  try {
    await githubJson(config, repoPath(project, "/git/refs"), "POST", { ref: `refs/heads/${branch}`, sha: commit.sha });
  } catch (error) {
    if (!(error instanceof GitHubApiError) || error.status !== 422) throw error;
    const existing = await readBranch(config, project, branch);
    if (!existing || !(await requestedFilesMatch(config, project, branch, changes))) {
      throw new Error(`A branch ${branch} já existe com conteúdo diferente; escolha outro nome para evitar sobrescrever alterações.`);
    }
    return existing;
  }

  return commit.sha;
}

async function findExistingPull(config: ServerConfig, project: ProjectName, branch: string, expectedSha: string): Promise<PullSummary | undefined> {
  const { owner } = getProject(project);
  const params = new URLSearchParams({ state: "all", head: `${owner}:${branch}`, base: "develop", per_page: "100" });
  const pulls = await githubRequest<PullSummary[]>(config, `${repoPath(project, "/pulls")}?${params}`);
  const openPull = pulls.find((pull) => pull.state === "open");
  if (openPull) {
    if (openPull.head.sha !== expectedSha) throw new Error(`A branch ${branch} foi atualizada enquanto a solicitação era processada. Nenhum merge foi feito.`);
    return openPull;
  }
  return pulls.find((pull) => pull.merged_at !== null && pull.head.sha === expectedSha);
}

async function ensurePull(config: ServerConfig, project: ProjectName, branch: string, expectedSha: string, title: string, body: string): Promise<PullSummary> {
  const existing = await findExistingPull(config, project, branch, expectedSha);
  if (existing) return existing;
  try {
    return await githubJson<PullSummary>(config, repoPath(project, "/pulls"), "POST", { title, body, head: branch, base: "develop", draft: false });
  } catch (error) {
    if (!(error instanceof GitHubApiError) || error.status !== 422) throw error;
    const racedPull = await findExistingPull(config, project, branch, expectedSha);
    if (racedPull) return racedPull;
    throw error;
  }
}

async function waitAndMerge(config: ServerConfig, project: ProjectName, number: number, timeoutSeconds: number) {
  const deadline = Date.now() + timeoutSeconds * 1000;
  let observedSha: string | undefined;
  let noRunsSince: number | undefined;
  while (Date.now() < deadline) {
    const pr = await githubRequest<PullRequest>(config, repoPath(project, `/pulls/${number}`));
    if (pr.base.ref !== "develop") throw new Error(`Merge bloqueado: PR #${number} não aponta para develop.`);
    if (pr.merged) return { merged: true, sha: pr.head.sha, alreadyMerged: true };
    if (pr.state !== "open" || pr.draft) throw new Error(`PR #${number} foi fechado ou está em rascunho; nenhum merge foi feito.`);

    const headSha = pr.head.sha;
    observedSha = headSha;
    const runs = await githubRequest<WorkflowRuns>(config, repoPath(project, `/actions/runs?head_sha=${encodeURIComponent(headSha)}&per_page=100`));
    const matching = runs.workflow_runs.filter((run) => run.head_sha === headSha);
    if (runs.total_count > matching.length) throw new Error(`Há mais de 100 execuções Actions para o SHA ${headSha}; não é seguro aprovar uma lista parcial.`);
    if (matching.length === 0) {
      noRunsSince ??= Date.now();
      if (Date.now() - noRunsSince >= 45_000) throw new Error(`Nenhuma execução de GitHub Actions foi encontrada para o SHA ${headSha}. Confirme se há workflow de validação para PRs neste projeto. O PR #${number} permanece aberto.`);
    } else {
      noRunsSince = undefined;
    }

    const failed = matching.filter((run) => run.status === "completed" && !["success", "neutral", "skipped"].includes(run.conclusion ?? ""));
    if (failed.length) throw new Error(`CI reprovado para ${headSha}: ${failed.map((run) => `${run.name} (${run.conclusion ?? "sem conclusão"})`).join(", ")}. PR #${number} permanece aberto.`);
    const pending = matching.some((run) => run.status !== "completed");
    const hasSuccess = matching.some((run) => run.status === "completed" && run.conclusion === "success");

    if (matching.length > 0 && !pending && hasSuccess) {
      const refreshed = await githubRequest<PullRequest>(config, repoPath(project, `/pulls/${number}`));
      if (refreshed.head.sha !== headSha) continue;
      if (refreshed.mergeable !== true) throw new Error(`CI passou, mas o GitHub ainda não confirma mergeable=true para o PR #${number}. Nenhum merge foi feito.`);
      const result = await githubJson<{ sha: string; merged: boolean; message: string }>(config, repoPath(project, `/pulls/${number}/merge`), "PUT", { merge_method: "squash", sha: headSha });
      if (!result.merged) throw new Error(`GitHub não confirmou o merge do PR #${number}: ${result.message}`);
      return { merged: true, sha: result.sha, alreadyMerged: false };
    }

    const remainingMs = deadline - Date.now();
    if (remainingMs > 0) await delay(Math.min(10_000, remainingMs));
  }
  throw new Error(`Timeout aguardando Actions aprovadas para o PR #${number}${observedSha ? ` (SHA ${observedSha})` : ""}. O PR permanece aberto para retomada manual.`);
}

export function registerApplyAndMergeTool(server: McpServer, config: ServerConfig): void {
  server.registerTool("apply_changes_and_merge", {
    title: "Aplicar alterações e integrar em develop",
    description: "Cria um único commit multi-arquivo numa branch de trabalho, abre/reutiliza PR para develop, aguarda GitHub Actions para o SHA atual e faz squash merge somente após sucesso. Em falha ou timeout, mantém o PR aberto e informa o motivo.",
    inputSchema,
  }, async ({ project, branch, changes, message, title, body, timeout_seconds }) => {
    try {
      validateChanges(changes);
      const existingBranchSha = await readBranch(config, project, branch);
      let commitSha: string;
      if (existingBranchSha) {
        if (!(await requestedFilesMatch(config, project, branch, changes))) {
          throw new Error(`A branch ${branch} já existe com conteúdo diferente; escolha outro nome para evitar sobrescrever alterações.`);
        }
        commitSha = existingBranchSha;
      } else {
        commitSha = await createSingleCommit(config, project, branch, message, changes);
      }

      const pull = await ensurePull(config, project, branch, commitSha, title, body);
      if (pull.merged_at) return toolText({ project, branch, commitSha, pullRequest: pull.number, url: pull.html_url, base: "develop", merged: true, alreadyMerged: true });
      const result = await waitAndMerge(config, project, pull.number, timeout_seconds);
      return toolText({ project, branch, commitSha, pullRequest: pull.number, url: pull.html_url, base: "develop", ...result });
    } catch (error) {
      return toolError(error);
    }
  });
}
