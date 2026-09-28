import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { loadConfig } from "./config.js";
import { createMcpServer } from "./factory.js";
import { startHttpServer } from "./http.js";
import { loadHttpConfig } from "./http-config.js";

const config = loadConfig();

if (process.argv.includes("--http") || process.env.MCP_TRANSPORT === "http") {
  await startHttpServer(createMcpServer, config, loadHttpConfig(process.env, config));
} else {
  await createMcpServer(config).connect(new StdioServerTransport());
}
