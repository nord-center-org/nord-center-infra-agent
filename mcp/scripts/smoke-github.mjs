import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import path from "node:path";
import { fileURLToPath } from "node:url";

const mcpDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const client = new Client({ name: "nord-center-github-smoke", version: "0.1.0" });
const transport = new StdioClientTransport({ command: process.execPath, args: [path.join(mcpDir, "dist", "server", "index.js")] });

function parseToolResult(result, toolName) {
  if (result.isError) throw new Error(`${toolName} failed: ${result.content.map((item) => item.type === "text" ? item.text : "").join("\n")}`);
  const textBlock = result.content.find((item) => item.type === "text");
  if (!textBlock || textBlock.type !== "text") throw new Error(`${toolName} returned no text result.`);
  return JSON.parse(textBlock.text);
}

try {
  await client.connect(transport);
  const tools = await client.listTools();
  const required = ["get_file", "search_code", "create_branch", "update_file", "create_pr", "get_pull_request", "merge_pull_request", "apply_changes_and_merge", "get_workflow", "get_logs", "get_project_context"];
  const registered = new Set(tools.tools.map((tool) => tool.name));
  const missing = required.filter((name) => !registered.has(name));
  if (missing.length) throw new Error(`Missing MCP tools: ${missing.join(", ")}`);

  const projectNames = ["nord-tool-backend", "nord-tool-frontend", "nord-tool-scripts-sql"];
  const resources = await client.listResources();
  const resourceUris = new Set(resources.resources.map((resource) => resource.uri));
  const projectContexts = [];
  for (const project of projectNames) {
    const uri = `nord-center-infra://projects/${project}/context`;
    if (!resourceUris.has(uri)) throw new Error(`Missing project context resource: ${uri}`);
    const resource = await client.readResource({ uri });
    const text = resource.contents.find((item) => item.mimeType === "application/json" && "text" in item);
    if (!text || !("text" in text)) throw new Error(`Context resource returned no JSON text for ${project}.`);
    const context = JSON.parse(text.text);
    const expectedPrefix = [`projects/${project}.md`, `steering/${project}/`, `skills/${project}/`];
    for (const prefix of expectedPrefix) {
      if (!context.documents.some((document) => document.path === prefix || document.path.startsWith(prefix))) {
        throw new Error(`Project context for ${project} is missing ${prefix}.`);
      }
    }
    const toolContext = parseToolResult(await client.callTool({ name: "get_project_context", arguments: { project } }), "get_project_context");
    if (toolContext.project !== project || toolContext.documents.length !== context.documents.length) throw new Error(`Context tool returned an unexpected result for ${project}.`);
    projectContexts.push({ project, documents: context.documents.length, characters: context.totalCharacters });
  }

  const files = [];
  const localGitStatus = [];
  for (const project of projectNames) {
    const file = parseToolResult(await client.callTool({ name: "get_file", arguments: { project, path: "README.md", ref: "develop" } }), "get_file");
    if (file.project !== project || file.path !== "README.md" || typeof file.content !== "string") throw new Error(`GitHub file read returned an unexpected result for ${project}.`);
    files.push({ project, path: file.path, characters: file.content.length });

    const statusResult = await client.callTool({ name: "git_status", arguments: { project } });
    if (statusResult.isError) throw new Error(`git_status failed for ${project}: ${statusResult.content.map((item) => item.type === "text" ? item.text : "").join("\n")}`);
    const statusText = statusResult.content.find((item) => item.type === "text");
    if (!statusText || statusText.type !== "text" || !statusText.text.startsWith("## ")) throw new Error(`git_status returned an unexpected result for ${project}.`);
    localGitStatus.push({ project, branchLine: statusText.text.split("\n", 1)[0] });
  }

  const workflows = parseToolResult(await client.callTool({ name: "get_workflow", arguments: { project: "nord-tool-backend", branch: "develop", limit: 3 } }), "get_workflow");
  if (workflows.project !== "nord-tool-backend" || !Array.isArray(workflows.runs)) throw new Error("GitHub Actions query returned an unexpected result.");

  const protectedWrite = await client.callTool({ name: "update_file", arguments: { project: "nord-tool-backend", branch: "develop", path: "README.md", content: "must not be written", message: "smoke guard" } });
  if (!protectedWrite.isError) throw new Error("Protected-branch write guard did not reject a direct develop write.");

  console.log(JSON.stringify({
    mcp: "connected",
    tools: tools.tools.length,
    requiredGitHubAndCiTools: required.length,
    projectContextResources: projectContexts,
    githubFileReads: files,
    localGitStatusChecks: localGitStatus,
    githubActionsRead: { project: workflows.project, matchingRuns: workflows.runs.length, totalRuns: workflows.total_count },
    protectedBranchWriteGuard: "passed",
  }, null, 2));
} finally {
  await client.close();
}
