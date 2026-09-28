import { unzipSync } from "fflate";
import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { ServerConfig } from "../../server/config.js";
import { getProject } from "../../server/projects.js";
import { projectInputSchema } from "../../server/config.js";
import { githubRequest, repoPath } from "../github/client.js";

const fail = (error: unknown) => ({ isError: true, content: [{ type: "text" as const, text: error instanceof Error ? error.message : "Erro inesperado consultando GitHub Actions." }] });
const asText = (value: unknown) => ({ content: [{ type: "text" as const, text: JSON.stringify(value, null, 2) }] });

interface WorkflowRuns {
  total_count: number;
  workflow_runs: Array<{
    id: number; name: string; path: string; event: string; status: string; conclusion: string | null;
    head_branch: string; head_sha: string; run_number: number; run_attempt: number;
    created_at: string; updated_at: string; html_url: string;
  }>;
}

export function registerCiTools(server: McpServer, config: ServerConfig): void {
  const projectSchema = projectInputSchema(config);
  server.registerTool("get_workflow", {
    description: "Lista execuções recentes do GitHub Actions no projeto selecionado.",
    inputSchema: {
      project: projectSchema,
      workflow: z.string().optional(),
      branch: z.string().optional(),
      status: z.enum(["completed", "in_progress", "queued", "success", "failure", "cancelled", "action_required"]).optional(),
      limit: z.number().int().min(1).max(30).default(10),
    },
  }, async ({ project, workflow, branch, status, limit }) => {
    try {
      const params = new URLSearchParams({ per_page: String(limit) });
      if (branch) params.set("branch", branch);
      if (status) params.set("status", status);
      const workflowPath = workflow ? `/actions/workflows/${encodeURIComponent(workflow)}/runs` : "/actions/runs";
      const result = await githubRequest<WorkflowRuns>(config, `${repoPath(project, workflowPath)}?${params}`);
      return asText({
        project, total_count: result.total_count,
        runs: result.workflow_runs.map((run) => ({ id: run.id, name: run.name, workflow: run.path, event: run.event, status: run.status, conclusion: run.conclusion, branch: run.head_branch, sha: run.head_sha, run_number: run.run_number, attempt: run.run_attempt, created_at: run.created_at, updated_at: run.updated_at, url: run.html_url })),
      });
    } catch (error) { return fail(error); }
  });

  server.registerTool("get_logs", {
    description: "Baixa e extrai os logs de uma execução do GitHub Actions, limitando o tamanho retornado.",
    inputSchema: { project: projectSchema, run_id: z.number().int().positive(), attempt: z.number().int().positive().optional(), max_chars: z.number().int().min(1000).max(200000).default(30000) },
  }, async ({ project, run_id, attempt, max_chars }) => {
    try {
      const { owner, repo } = getProject(project);
      const suffix = attempt ? `/actions/runs/${run_id}/attempts/${attempt}/logs` : `/actions/runs/${run_id}/logs`;
      const headers = new Headers({ Accept: "application/vnd.github+json", "X-GitHub-Api-Version": "2026-03-10", "User-Agent": "nord-center-infra-agent-mcp" });
      if (config.githubToken) headers.set("Authorization", `Bearer ${config.githubToken}`);
      const apiResponse = await fetch(`https://api.github.com${repoPath(project, suffix)}`, { headers, redirect: "manual" });
      if (![302, 301, 303].includes(apiResponse.status)) {
        const detail = (await apiResponse.text()).slice(0, 500);
        throw new Error(`GitHub API ${apiResponse.status} ao solicitar logs: ${detail}`);
      }
      const downloadUrl = apiResponse.headers.get("location");
      if (!downloadUrl) throw new Error("GitHub não retornou a URL temporária dos logs.");
      // The signed archive URL is fetched without forwarding the GitHub token.
      const archiveResponse = await fetch(downloadUrl);
      if (!archiveResponse.ok) throw new Error(`Falha ao baixar arquivo de logs (HTTP ${archiveResponse.status}).`);
      const archiveBuffer = await archiveResponse.arrayBuffer();
      if (archiveBuffer.byteLength > 20 * 1024 * 1024) throw new Error("O arquivo de logs excede o limite de 20 MiB.");
      const files = unzipSync(new Uint8Array(archiveBuffer));
      let remaining = max_chars;
      const logs = Object.entries(files).filter(([name]) => !name.endsWith("/")).map(([name, bytes]) => {
        const content = new TextDecoder().decode(bytes);
        const excerpt = content.slice(0, remaining);
        remaining -= excerpt.length;
        return { file: name, truncated: excerpt.length < content.length, content: excerpt };
      });
      return asText({ project, run_id, attempt: attempt ?? "latest", logs });
    } catch (error) { return fail(error); }
  });
}
