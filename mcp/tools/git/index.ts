import { execFile } from "node:child_process";
import { promisify } from "node:util";
import path from "node:path";
import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { getProject } from "../../server/projects.js";
import type { ProjectName } from "../../server/projects.js";
import { projectInputSchema, type ServerConfig } from "../../server/config.js";
import { requireContextToken } from "../../server/context-gate.js";

const execFileAsync = promisify(execFile);
const protectedBranches = new Set(["main", "master", "develop"]);
const isProtectedBranch = (branch: string) => protectedBranches.has(branch) || /^(main|master|develop)\//.test(branch);
const fail = (error: unknown) => ({ isError: true, content: [{ type: "text" as const, text: error instanceof Error ? error.message : "Erro inesperado executando Git." }] });
const asText = (value: unknown) => ({ content: [{ type: "text" as const, text: typeof value === "string" ? value : JSON.stringify(value, null, 2) }] });

async function git(project: ProjectName, args: string[]) {
  const cwd = getProject(project).localPath;
  try {
    const result = await execFileAsync("git", args, { cwd, windowsHide: true, maxBuffer: 2 * 1024 * 1024, timeout: 15000 });
    return result.stdout.trimEnd();
  } catch (error) {
    const message = error instanceof Error ? error.message : "Falha ao executar git.";
    throw new Error(`Git em ${project}: ${message.slice(0, 500)}`);
  }
}

function validateRelativeFile(file: string): string {
  if (path.isAbsolute(file) || file.split(/[\\/]/).includes("..")) throw new Error("Informe um caminho de arquivo relativo dentro do projeto.");
  return file;
}

export function registerGitTools(server: McpServer, config: ServerConfig): void {
  const projectSchema = projectInputSchema(config);
  server.registerTool("git_status", {
    description: "Lê o status Git local do projeto configurado.",
    inputSchema: { project: projectSchema },
  }, async ({ project }) => {
    try { return asText(await git(project, ["status", "--short", "--branch"])); }
    catch (error) { return fail(error); }
  });

  server.registerTool("git_diff", {
    description: "Lê o diff local do projeto; sem caminho, mostra alterações staged e unstaged.",
    inputSchema: { project: projectSchema, path: z.string().optional(), staged: z.boolean().default(false) },
  }, async ({ project, path: file, staged }) => {
    try {
      const args = ["--literal-pathspecs", "diff", ...(staged ? ["--cached"] : []), "--", ...(file ? [validateRelativeFile(file)] : [])];
      return asText(await git(project, args));
    } catch (error) { return fail(error); }
  });

  server.registerTool("git_commit", {
    description: "Cria commit local dos arquivos explicitamente informados; exige context_token de get_project_context e bloqueia main, master e develop.",
    inputSchema: { project: projectSchema, context_token: z.string().min(32), message: z.string().min(1).max(200), files: z.array(z.string().min(1)).min(1).max(50) },
  }, async ({ project, context_token, message, files }) => {
    try {
      requireContextToken(project, context_token);
      const branch = (await git(project, ["branch", "--show-current"])).trim();
      if (!branch || isProtectedBranch(branch)) throw new Error(`Commit bloqueado na branch protegida '${branch || "(detached HEAD)"}'. Use uma branch de trabalho derivada de develop.`);
      const safeFiles = [...new Set(files.map(validateRelativeFile))];
      await git(project, ["--literal-pathspecs", "add", "--", ...safeFiles]);
      await git(project, ["commit", "--only", "-m", message, "--", ...safeFiles]);
      const sha = await git(project, ["rev-parse", "--short", "HEAD"]);
      return asText({ project, branch, sha, message, files: safeFiles });
    } catch (error) { return fail(error); }
  });
}
