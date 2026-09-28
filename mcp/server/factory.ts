import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { ServerConfig } from "./config.js";
import { registerCiTools } from "../tools/ci/index.js";
import { registerGitTools } from "../tools/git/index.js";
import { registerGitHubTools } from "../tools/github/index.js";
import { registerApplyAndMergeTool } from "../tools/github/apply-and-merge.js";
import { registerProjectContext } from "../tools/projects/index.js";

export function createMcpServer(config: ServerConfig): McpServer {
  const server = new McpServer({ name: config.name, version: config.version });
  registerGitHubTools(server, config);
  registerApplyAndMergeTool(server, config);
  registerGitTools(server, config);
  registerCiTools(server, config);
  registerProjectContext(server, config);
  return server;
}
