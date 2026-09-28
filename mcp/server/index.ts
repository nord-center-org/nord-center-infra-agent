import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { loadConfig } from "./config.js";
import { registerCiTools } from "../tools/ci/index.js";
import { registerGitTools } from "../tools/git/index.js";
import { registerGitHubTools } from "../tools/github/index.js";
import { registerApplyAndMergeTool } from "../tools/github/apply-and-merge.js";
import { registerProjectContext } from "../tools/projects/index.js";

const config = loadConfig();
const server = new McpServer({ name: config.name, version: config.version });
registerGitHubTools(server, config);
registerApplyAndMergeTool(server, config);
registerGitTools(server);
registerCiTools(server, config);
registerProjectContext(server);
await server.connect(new StdioServerTransport());
