import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import path from "node:path";
import { fileURLToPath } from "node:url";

const mcpDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const client = new Client({ name: "nord-center-project-context-smoke", version: "0.1.0" });
const transport = new StdioClientTransport({ command: process.execPath, args: [path.join(mcpDir, "dist", "server", "index.js")] });
const projects = ["nord-tool-backend", "nord-tool-frontend", "nord-tool-scripts-sql"];

try {
  await client.connect(transport);
  const [resources, tools] = await Promise.all([client.listResources(), client.listTools()]);
  const resourceUris = new Set(resources.resources.map((resource) => resource.uri));
  const toolNames = new Set(tools.tools.map((tool) => tool.name));
  if (!toolNames.has("get_project_context")) throw new Error("Missing MCP tool get_project_context.");

  const results = [];
  for (const project of projects) {
    const uri = `nord-center-infra://projects/${project}/context`;
    if (!resourceUris.has(uri)) throw new Error(`Missing project context resource: ${uri}`);
    const resource = await client.readResource({ uri });
    const resourceText = resource.contents.find((item) => item.mimeType === "application/json" && "text" in item);
    if (!resourceText || !("text" in resourceText)) throw new Error(`Resource returned no JSON text for ${project}.`);
    const context = JSON.parse(resourceText.text);
    const toolResult = await client.callTool({ name: "get_project_context", arguments: { project } });
    if (toolResult.isError) throw new Error(`get_project_context failed for ${project}.`);
    const toolText = toolResult.content.find((item) => item.type === "text");
    if (!toolText || toolText.type !== "text") throw new Error(`Tool returned no text for ${project}.`);
    const toolContext = JSON.parse(toolText.text);
    if (context.project !== project || toolContext.project !== project) throw new Error(`Wrong project returned for ${project}.`);
    for (const prefix of [`projects/${project}.md`, `steering/${project}/`, `skills/${project}/`]) {
      if (!context.documents.some((document) => document.path === prefix || document.path.startsWith(prefix))) {
        throw new Error(`Context for ${project} is missing ${prefix}.`);
      }
    }
    if (context.documents.length !== toolContext.documents.length) throw new Error(`Resource and tool disagree for ${project}.`);
    results.push({ project, documents: context.documents.length, characters: context.totalCharacters });
  }
  console.log(JSON.stringify({ status: "passed", projects: results }, null, 2));
} finally {
  await client.close();
}
