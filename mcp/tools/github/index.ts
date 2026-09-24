import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { ServerConfig } from "../../server/config.js";
import { getProject, PROJECT_NAMES } from "../../server/projects.js";
import { encodePath, githubJson, githubRequest, repoPath } from "./client.js";

const projectSchema = z.enum(PROJECT_NAMES);
const protectedBranches = new Set(["main", "master", "develop"]);
const isProtectedBranch = (branch: string) => protectedBranches.has(branch) || /^(main|master|develop)\//.test(branch);
const failure = (error: unknown) => ({
  isError: true,
  content: [{ type: "text" as const, text: error instanceof Error ? error.message : "Erro inesperado na API do GitHub." }],
});
const text = (value: unknown) => ({ content: [{ type: "text" as const, text: JSON.stringify(value, null, 2) }] });
const refPath = (ref: string) => `heads/${encodePath(ref)}`;

interface ContentFile { type: string; path: string; sha: string; size: number; content?: string; encoding?: string; }
interface GitRef { object: { sha: string } }
interface SearchResult { total_count: number; incomplete_results: boolean; items: Array<{ name: string; path: string; html_url: string; repository: { full_name: string } }> }
interface PullRequest {
  number: number; title: string; state: string; html_url: string; draft: boolean; merged: boolean; mergeable: boolean | null;
  base: { ref: string }; head: { ref: string; sha: string };
}

interface WorkflowRuns {
  total_count: number;
  workflow_runs: Array<{
    id: number; name: string; event: string; status: string; conclusion: string | null;
    head_sha: string; html_url: string; run_number: number; run_attempt: number;
  }>;
}

export function registerGitHubTools(server: McpServer, config: ServerConfig): void {
  server.registerTool("get_file", {
    description: "Lê um arquivo de um dos projetos configurados no GitHub.",
    inputSchema: { project: projectSchema, path: z.string().min(1), ref: z.string().optional() },
  }, async ({ project, path, ref }) => {
    try {
      const file = await githubRequest<ContentFile>(config, `${repoPath(project, `/contents/${encodePath(path)}`)}${ref ? `?ref=${encodeURIComponent(ref)}` : ""}`);
      if (file.type !== "file" || !file.content || file.encoding !== "base64") throw new Error("O caminho informado não aponta para um arquivo codificado em Base64.");
      return text({ project, path: file.path, sha: file.sha, size: file.size, content: Buffer.from(file.content.replace(/\n/g, ""), "base64").toString("utf8") });
    } catch (error) { return failure(error); }
  });

  server.registerTool("search_code", {
    description: "Pesquisa código no repositório GitHub associado ao projeto escolhido.",
    inputSchema: { project: projectSchema, query: z.string().min(1), limit: z.number().int().min(1).max(30).default(10) },
  }, async ({ project, query, limit }) => {
    try {
      if (/(^|\s)(repo|org|user):/i.test(query)) throw new Error("A consulta não pode substituir o escopo de repositório do projeto selecionado.");
      const { owner, repo } = getProject(project);
      const params = new URLSearchParams({ q: `repo:${owner}/${repo} ${query}`, per_page: String(limit) });
      const result = await githubRequest<SearchResult>(config, `/search/code?${params}`);
      return text({ project, total_count: result.total_count, incomplete_results: result.incomplete_results, items: result.items.map(({ name, path, html_url, repository }) => ({ name, path, url: html_url, repository: repository.full_name })) });
    } catch (error) { return failure(error); }
  });

  server.registerTool("create_branch", {
    description: "Cria uma branch de trabalho no projeto selecionado a partir de develop.",
    inputSchema: { project: projectSchema, branch: z.string().regex(/^[A-Za-z0-9._/-]+$/).min(1).max(200) },
  }, async ({ project, branch }) => {
    try {
      if (isProtectedBranch(branch)) throw new Error("Nome reservado: use uma branch de trabalho, nunca main, master ou develop.");
      const ref = await githubRequest<GitRef>(config, repoPath(project, `/git/ref/${refPath("develop")}`));
      const result = await githubJson<{ ref: string; object: { sha: string } }>(config, repoPath(project, "/git/refs"), "POST", { ref: `refs/heads/${branch}`, sha: ref.object.sha });
      return text({ project, branch: result.ref, sha: result.object.sha, source: "develop" });
    } catch (error) { return failure(error); }
  });

  server.registerTool("update_file", {
    description: "Cria ou atualiza um arquivo em uma branch de trabalho (nunca diretamente em branches protegidas).",
    inputSchema: { project: projectSchema, branch: z.string().min(1), path: z.string().min(1), content: z.string(), message: z.string().min(1).max(200) },
  }, async ({ project, branch, path, content, message }) => {
    try {
      if (isProtectedBranch(branch)) throw new Error("Não é permitido alterar arquivos diretamente em main, master ou develop.");
      let sha: string | undefined;
      try {
        const current = await githubRequest<ContentFile>(config, `${repoPath(project, `/contents/${encodePath(path)}`)}?ref=${encodeURIComponent(branch)}`);
        if (current.type === "file") sha = current.sha;
      } catch (error) {
        if (!(error instanceof Error) || !error.message.startsWith("GitHub API 404:")) throw error;
      }
      const response = await githubJson<{ content: { path: string; sha: string; html_url: string } }>(config, repoPath(project, `/contents/${encodePath(path)}`), "PUT", {
        message, content: Buffer.from(content, "utf8").toString("base64"), branch, ...(sha ? { sha } : {}),
      });
      return text({ project, branch, path: response.content.path, sha: response.content.sha, url: response.content.html_url });
    } catch (error) { return failure(error); }
  });

  server.registerTool("create_pr", {
    description: "Abre um Pull Request para develop; outros destinos são rejeitados.",
    inputSchema: { project: projectSchema, head: z.string().min(1), title: z.string().min(1).max(256), body: z.string().default(""), draft: z.boolean().default(false) },
  }, async ({ project, head, title, body, draft }) => {
    try {
      if (isProtectedBranch(head)) throw new Error("A origem do Pull Request deve ser uma branch de trabalho.");
      const result = await githubJson<{ number: number; html_url: string; base: { ref: string } }>(config, repoPath(project, "/pulls"), "POST", { title, body, head, base: "develop", draft });
      return text({ project, number: result.number, url: result.html_url, base: result.base.ref });
    } catch (error) { return failure(error); }
  });

  server.registerTool("get_pull_request", {
    description: "Obtém detalhes de um Pull Request do projeto escolhido.",
    inputSchema: { project: projectSchema, number: z.number().int().positive() },
  }, async ({ project, number }) => {
    try {
      const pr = await githubRequest<PullRequest>(config, repoPath(project, `/pulls/${number}`));
      return text({ project, number: pr.number, title: pr.title, state: pr.state, draft: pr.draft, merged: pr.merged, mergeable: pr.mergeable, url: pr.html_url, base: pr.base.ref, head: pr.head.ref, headSha: pr.head.sha });
    } catch (error) { return failure(error); }
  });

  server.registerTool("merge_pull_request", {
    description: "Mescla um PR exclusivamente para develop após confirmar que o GitHub reporta o PR mergeable e as execuções relevantes do GitHub Actions passaram.",
    inputSchema: { project: projectSchema, number: z.number().int().positive(), method: z.enum(["squash", "merge", "rebase"]).default("squash") },
  }, async ({ project, number, method }) => {
    try {
      const pr = await githubRequest<PullRequest>(config, repoPath(project, `/pulls/${number}`));
      if (pr.base.ref !== "develop") throw new Error(`Merge bloqueado: o PR aponta para '${pr.base.ref}', mas somente develop é permitido.`);
      if (pr.state !== "open" || pr.merged) throw new Error("Merge bloqueado: o Pull Request não está aberto.");
      if (pr.draft) throw new Error("Merge bloqueado: o Pull Request está em rascunho.");
      if (pr.mergeable !== true) throw new Error(`Merge bloqueado: GitHub informa mergeable=${String(pr.mergeable)}; atualize/reavalie o PR e resolva conflitos.`);

      const runs = await githubRequest<WorkflowRuns>(config, repoPath(project, `/actions/runs?head_sha=${encodeURIComponent(pr.head.sha)}&per_page=100`));
      const matchingRuns = runs.workflow_runs.filter((run) => run.head_sha === pr.head.sha);
      if (runs.total_count > matchingRuns.length) throw new Error("Merge bloqueado: o GitHub retornou execuções paginadas além do limite consultado; não é seguro validar apenas parte do CI.");
      if (!matchingRuns.length) throw new Error("Merge bloqueado: não há execuções do GitHub Actions associadas ao commit do PR.");
      const failingRuns = matchingRuns.filter((run) => run.status !== "completed" || !["success", "neutral", "skipped"].includes(run.conclusion ?? ""));
      if (!matchingRuns.some((run) => run.status === "completed" && run.conclusion === "success")) {
        throw new Error("Merge bloqueado: nenhuma execução do GitHub Actions associada ao commit concluiu com sucesso.");
      }
      if (failingRuns.length) {
        const descriptions = failingRuns.map((run) => `${run.name} (#${run.run_number}, tentativa ${run.run_attempt}): ${run.status}/${run.conclusion ?? "sem conclusão"}`);
        throw new Error(`Merge bloqueado: execuções do GitHub Actions pendentes ou reprovadas: ${descriptions.slice(0, 10).join("; ")}`);
      }

      const merged = await githubJson<{ sha: string; merged: boolean; message: string }>(config, repoPath(project, `/pulls/${number}/merge`), "PUT", { merge_method: method });
      if (!merged.merged) throw new Error(`GitHub não confirmou o merge: ${merged.message}`);
      return text({ project, number, base: "develop", merged: true, sha: merged.sha, method });
    } catch (error) { return failure(error); }
  });

}
