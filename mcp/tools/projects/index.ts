import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { INFRA_ROOT, type ProjectName } from "../../server/projects.js";
import { projectInputSchema, type ServerConfig } from "../../server/config.js";

const MAX_CONTEXT_CHARS = 100_000;

async function markdownFiles(directory: string): Promise<string[]> {
  let entries;
  try {
    entries = await readdir(directory, { withFileTypes: true });
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw error;
  }

  const files: string[] = [];
  for (const entry of entries.sort((a, b) => a.name.localeCompare(b.name))) {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await markdownFiles(entryPath));
    else if (entry.isFile() && entry.name.toLowerCase().endsWith(".md")) files.push(entryPath);
  }
  return files;
}

async function loadProjectContext(project: ProjectName) {
  const profilePath = path.join(INFRA_ROOT, "projects", `${project}.md`);
  const steeringDir = path.join(INFRA_ROOT, "steering", project);
  const skillsDir = path.join(INFRA_ROOT, "skills", project);
  const paths = [profilePath, ...await markdownFiles(steeringDir), ...await markdownFiles(skillsDir)];
  const documents: Array<{ path: string; content: string }> = [];
  let totalChars = 0;

  for (const filePath of paths) {
    const content = await readFile(filePath, "utf8");
    const relativePath = path.relative(INFRA_ROOT, filePath).split(path.sep).join("/");
    totalChars += content.length;
    if (totalChars > MAX_CONTEXT_CHARS) {
      throw new Error(`O contexto de ${project} excede o limite de ${MAX_CONTEXT_CHARS} caracteres.`);
    }
    documents.push({ path: relativePath, content });
  }

  if (documents.length === 0 || documents[0]?.path !== `projects/${project}.md`) {
    throw new Error(`Perfil do projeto não encontrado: projects/${project}.md`);
  }

  return { project, documents, totalCharacters: totalChars };
}

function asTextResult(value: unknown) {
  return { content: [{ type: "text" as const, text: JSON.stringify(value, null, 2) }] };
}

export function registerProjectContext(server: McpServer, config: ServerConfig) {
  const projects = config.allowedProjects;
  const projectSchema = projectInputSchema(config);
  server.registerTool("get_project_context", {
    title: "Carregar contexto do projeto",
    description: "Retorna o perfil, steering e skills Markdown do projeto selecionado na allowlist.",
    inputSchema: { project: projectSchema },
  }, async ({ project }) => {
    try {
      return asTextResult(await loadProjectContext(project));
    } catch (error) {
      return { ...asTextResult({ error: error instanceof Error ? error.message : String(error) }), isError: true };
    }
  });

  for (const project of projects) {
    const uri = `nord-center-infra://projects/${project}/context`;
    server.registerResource(`${project}-context`, uri, {
      title: `Contexto do projeto ${project}`,
      description: "Perfil, steering e skills específicos do projeto.",
      mimeType: "application/json",
    }, async () => {
      const context = await loadProjectContext(project);
      return { contents: [{ uri, mimeType: "application/json", text: JSON.stringify(context, null, 2) }] };
    });
  }
}
