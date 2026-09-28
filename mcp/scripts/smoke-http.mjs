import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { request as httpRequest } from "node:http";
import { createServer } from "node:net";
import { setTimeout as delay } from "node:timers/promises";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import path from "node:path";
import { fileURLToPath } from "node:url";

const mcpDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const serverPath = path.join(mcpDir, "dist", "server", "index.js");
const backendToken = "backend-test-token-do-not-use-in-production-123456";
const frontendToken = "frontend-test-token-do-not-use-in-production-123456";

async function freePort() {
  const server = createServer();
  await new Promise((resolve, reject) => server.once("error", reject).listen(0, "127.0.0.1", resolve));
  const port = server.address().port;
  await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
  return port;
}

async function requestWithHost(url, host) {
  return new Promise((resolve, reject) => {
    const target = new URL(url);
    const request = httpRequest({
      hostname: target.hostname,
      port: target.port,
      path: `${target.pathname}${target.search}`,
      method: "GET",
      headers: { Host: host, "X-Forwarded-Proto": "https" },
    }, (response) => {
      response.resume();
      response.once("end", () => resolve(response));
    });
    request.once("error", reject);
    request.end();
  });
}

const port = await freePort();
const endpoint = `http://127.0.0.1:${port}/mcp`;
const baseUrl = `http://127.0.0.1:${port}`;
const child = spawn(process.execPath, [serverPath, "--http"], {
  cwd: mcpDir,
  env: {
    ...process.env,
    GITHUB_TOKEN: "github-test-credential-not-used-by-this-smoke",
    MCP_CLIENT_TOKENS: JSON.stringify([
      { id: "backend-test", token: backendToken, projects: ["nord-tool-backend"] },
      { id: "frontend-test", token: frontendToken, projects: ["nord-tool-frontend"] },
    ]),
    MCP_HOST: "127.0.0.1",
    MCP_ALLOWED_HOSTS: "127.0.0.1,localhost",
    MCP_ALLOWED_ORIGINS: "https://trusted.example",
    MCP_REQUIRE_HTTPS: "true",
    MCP_RATE_LIMIT_MAX: "50",
    PORT: String(port),
  },
  stdio: ["ignore", "pipe", "pipe"],
});

let serverOutput = "";
child.stderr.setEncoding("utf8").on("data", (chunk) => { serverOutput += chunk; });
child.stdout.setEncoding("utf8").on("data", (chunk) => { serverOutput += chunk; });
const clients = [];

try {
  let ready = false;
  for (let attempt = 0; attempt < 50; attempt += 1) {
    if (child.exitCode !== null) throw new Error(`HTTP MCP server exited early: ${serverOutput}`);
    try {
      const response = await fetch(`${baseUrl}/healthz`, { headers: { "X-Forwarded-Proto": "https" } });
      if (response.ok) { ready = true; break; }
    } catch { /* Wait until the local listener is ready. */ }
    await delay(100);
  }
  assert.equal(ready, true, "health endpoint should become ready");

  const invalidHost = await requestWithHost(`${baseUrl}/healthz`, "attacker.example");
  assert.equal(invalidHost.statusCode, 403, "unlisted hosts should be rejected");
  const allowedOrigin = await fetch(`${baseUrl}/healthz`, { headers: { Origin: "https://trusted.example", "X-Forwarded-Proto": "https" } });
  assert.equal(allowedOrigin.status, 200);
  assert.equal(allowedOrigin.headers.get("access-control-allow-origin"), "https://trusted.example");

  const insecure = await fetch(`${baseUrl}/healthz`);
  assert.equal(insecure.status, 426, "public-mode requests must require HTTPS at the trusted proxy");

  const unauthorized = await fetch(endpoint, { method: "POST", headers: { "X-Forwarded-Proto": "https", "Content-Type": "application/json" }, body: "{}" });
  assert.equal(unauthorized.status, 401, "MCP endpoint should require bearer auth");
  assert.match(unauthorized.headers.get("www-authenticate") ?? "", /^Bearer/);

  const invalidOrigin = await fetch(endpoint, {
    method: "POST",
    headers: { Authorization: `Bearer ${backendToken}`, Origin: "https://attacker.example", "X-Forwarded-Proto": "https", "Content-Type": "application/json" },
    body: "{}",
  });
  assert.equal(invalidOrigin.status, 403, "unlisted browser origins should be rejected");

  const backendTransport = new StreamableHTTPClientTransport(new URL(endpoint), { requestInit: { headers: { Authorization: `Bearer ${backendToken}`, "X-Forwarded-Proto": "https" } } });
  const backendClient = new Client({ name: "phase8-http-smoke-backend", version: "0.1.0" });
  clients.push(backendClient);
  await backendClient.connect(backendTransport);
  const backendTools = await backendClient.listTools();
  const backendGetFile = backendTools.tools.find((tool) => tool.name === "get_file");
  assert.deepEqual(backendGetFile.inputSchema.properties.project.enum, ["nord-tool-backend"]);
  const backendResources = await backendClient.listResources();
  assert.deepEqual(backendResources.resources.map((resource) => resource.uri), ["nord-center-infra://projects/nord-tool-backend/context"]);
  const context = await backendClient.callTool({ name: "get_project_context", arguments: { project: "nord-tool-backend" } });
  assert.equal(context.isError, undefined);

  for (const branch of ["develop", "master", "main"]) {
    const write = await backendClient.callTool({ name: "update_file", arguments: { project: "nord-tool-backend", branch, path: "README.md", content: "blocked", message: "phase 7 smoke" } });
    assert.equal(write.isError, true, `direct write to ${branch} must be blocked`);
    const create = await backendClient.callTool({ name: "create_branch", arguments: { project: "nord-tool-backend", branch } });
    assert.equal(create.isError, true, `reserved branch ${branch} must not be created`);
    const pull = await backendClient.callTool({ name: "create_pr", arguments: { project: "nord-tool-backend", head: branch, title: "phase 7 smoke" } });
    assert.equal(pull.isError, true, `protected branch ${branch} must not be used as a PR source`);
  }

  const crossProject = await backendClient.callTool({ name: "get_project_context", arguments: { project: "nord-tool-frontend" } });
  assert.equal(crossProject.isError, true, "a credential must not access projects outside its allowlist");

  const foreignSession = await fetch(endpoint, {
    headers: { Authorization: `Bearer ${frontendToken}`, Accept: "text/event-stream", "Mcp-Session-Id": backendTransport.sessionId, "X-Forwarded-Proto": "https" },
  });
  assert.equal(foreignSession.status, 403, "a session must be bound to its authenticating client");

  const frontendTransport = new StreamableHTTPClientTransport(new URL(endpoint), { requestInit: { headers: { Authorization: `Bearer ${frontendToken}`, "X-Forwarded-Proto": "https" } } });
  const frontendClient = new Client({ name: "phase8-http-smoke-frontend", version: "0.1.0" });
  clients.push(frontendClient);
  await frontendClient.connect(frontendTransport);
  const frontendTools = await frontendClient.listTools();
  const frontendGetFile = frontendTools.tools.find((tool) => tool.name === "get_file");
  assert.deepEqual(frontendGetFile.inputSchema.properties.project.enum, ["nord-tool-frontend"]);

  let rateLimited = false;
  for (let attempt = 0; attempt < 60; attempt += 1) {
    const response = await fetch(`${baseUrl}/healthz`, { headers: { "X-Forwarded-Proto": "https" } });
    if (response.status === 429) { rateLimited = true; break; }
    assert.equal(response.status, 200);
  }
  assert.equal(rateLimited, true, "the per-IP request limit should return HTTP 429");

  await Promise.all(clients.map((client) => client.close().catch(() => undefined)));
  clients.length = 0;
  assert.equal(serverOutput.includes(backendToken), false, "server logs must not contain client tokens");
  assert.equal(serverOutput.includes(frontendToken), false, "server logs must not contain client tokens");
  console.log(JSON.stringify({ status: "passed", checks: ["develop-only automation guards", "health", "HTTPS enforcement", "host/origin allowlists", "bearer authentication", "project-scoped tools/resources", "cross-project denial", "session binding", "rate limit", "secret-free logs"] }, null, 2));
} finally {
  await Promise.all(clients.map((client) => client.close().catch(() => undefined)));
  child.kill("SIGTERM");
  await new Promise((resolve) => {
    if (child.exitCode !== null) resolve();
    else { child.once("exit", resolve); setTimeout(resolve, 3000).unref(); }
  });
}
