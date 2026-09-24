import path from "node:path";
import { fileURLToPath } from "node:url";
import { existsSync } from "node:fs";

function findMcpRoot(start: string): string {
  let current = start;
  while (true) {
    if (path.basename(current) === "mcp" && existsSync(path.join(current, "package.json"))) return current;
    const parent = path.dirname(current);
    if (parent === current) throw new Error("Não foi possível localizar o diretório raiz do pacote MCP.");
    current = parent;
  }
}

const mcpRoot = findMcpRoot(path.dirname(fileURLToPath(import.meta.url)));
const infraRoot = path.dirname(mcpRoot);

export const PROJECTS = {
  "nord-tool-backend": {
    owner: "zzNICK",
    repo: "nord-tool-backend",
    localPath: path.resolve(infraRoot, "..", "nord-tool-backend"),
  },
  "nord-tool-frontend": {
    owner: "zzNICK",
    repo: "nord-tool-frontend",
    localPath: path.resolve(infraRoot, "..", "nord-tool-frontend"),
  },
  "nord-tool-scripts-sql": {
    owner: "zzNICK",
    repo: "nord-tool-scripts-sql",
    localPath: path.resolve(infraRoot, "..", "nord-tool-scripts-sql"),
  },
} as const;

export type ProjectName = keyof typeof PROJECTS;
export const PROJECT_NAMES = Object.keys(PROJECTS) as [ProjectName, ...ProjectName[]];

export function getProject(name: ProjectName) {
  return PROJECTS[name];
}
