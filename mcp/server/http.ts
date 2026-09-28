import { randomUUID, timingSafeEqual } from "node:crypto";
import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { isInitializeRequest } from "@modelcontextprotocol/sdk/types.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { ServerConfig } from "./config.js";
import type { HttpServerConfig, McpClientCredential } from "./http-config.js";

type McpServerFactory = (config: ServerConfig) => McpServer;
type Session = { transport: StreamableHTTPServerTransport; server: McpServer; clientId: string; projects: string[]; lastUsed: number; idleTimer?: NodeJS.Timeout };
type RateEntry = { startedAt: number; count: number };

class HttpError extends Error {
  constructor(readonly status: number, message: string, readonly retryAfter?: number) { super(message); }
}

function safeTokenEqual(provided: string, expected: string): boolean {
  const left = Buffer.from(provided, "utf8");
  const right = Buffer.from(expected, "utf8");
  return left.length === right.length && timingSafeEqual(left, right);
}

function credentialFor(request: IncomingMessage, credentials: McpClientCredential[]): McpClientCredential {
  const authorization = request.headers.authorization;
  if (typeof authorization !== "string" || !/^Bearer [^\s]+$/i.test(authorization)) {
    throw new HttpError(401, "Bearer token obrigatório.");
  }
  const provided = authorization.slice(7);
  let match: McpClientCredential | undefined;
  for (const credential of credentials) {
    if (safeTokenEqual(provided, credential.token)) match = credential;
  }
  if (!match) throw new HttpError(401, "Credencial MCP inválida.");
  return match;
}

function hostname(request: IncomingMessage): string | undefined {
  const host = request.headers.host;
  if (!host || typeof host !== "string") return undefined;
  try { return new URL(`http://${host}`).hostname.toLowerCase(); } catch { return undefined; }
}

function applyCors(request: IncomingMessage, response: ServerResponse, config: HttpServerConfig): void {
  const origin = request.headers.origin;
  if (origin === undefined) return;
  if (typeof origin !== "string" || !config.allowedOrigins.includes(origin)) {
    throw new HttpError(403, "Origin não autorizado.");
  }
  response.setHeader("Access-Control-Allow-Origin", origin);
  response.setHeader("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS");
  response.setHeader("Access-Control-Allow-Headers", "Authorization, Content-Type, Accept, Mcp-Session-Id, Last-Event-ID, MCP-Protocol-Version");
  response.setHeader("Access-Control-Expose-Headers", "Mcp-Session-Id, WWW-Authenticate, Last-Event-ID, MCP-Protocol-Version");
  response.setHeader("Vary", "Origin");
}

function validateRequestBoundary(request: IncomingMessage, config: HttpServerConfig): void {
  if (!config.allowedHosts.includes(hostname(request) ?? "")) throw new HttpError(403, "Host não autorizado.");
  const origin = request.headers.origin;
  if (origin !== undefined && (typeof origin !== "string" || !config.allowedOrigins.includes(origin))) {
    throw new HttpError(403, "Origin não autorizado.");
  }
  if (config.requireHttps) {
    const forwardedProto = request.headers["x-forwarded-proto"];
    const externallyHttps = typeof forwardedProto === "string" && forwardedProto.split(",")[0]?.trim().toLowerCase() === "https";
    const directlyHttps = Boolean((request.socket as typeof request.socket & { encrypted?: boolean }).encrypted);
    if (!externallyHttps && !directlyHttps) throw new HttpError(426, "HTTPS obrigatório.");
  }
}

function sendJson(response: ServerResponse, status: number, body: unknown): void {
  if (response.headersSent) return;
  const serialized = JSON.stringify(body);
  response.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Content-Length": Buffer.byteLength(serialized),
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff",
  });
  response.end(serialized);
}

async function readJsonBody(request: IncomingMessage, maxBytes: number): Promise<unknown> {
  const contentType = request.headers["content-type"]?.split(";")[0]?.trim().toLowerCase();
  if (contentType !== "application/json") throw new HttpError(415, "Content-Type application/json obrigatório.");
  const declaredLength = Number(request.headers["content-length"] ?? 0);
  if (Number.isFinite(declaredLength) && declaredLength > maxBytes) throw new HttpError(413, "Corpo excede o limite permitido.");
  const chunks: Buffer[] = [];
  let length = 0;
  for await (const chunk of request) {
    const part = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
    length += part.length;
    if (length > maxBytes) throw new HttpError(413, "Corpo excede o limite permitido.");
    chunks.push(part);
  }
  try { return JSON.parse(Buffer.concat(chunks).toString("utf8")); }
  catch { throw new HttpError(400, "Corpo JSON inválido."); }
}

function sessionHeader(request: IncomingMessage): string | undefined {
  const value = request.headers["mcp-session-id"];
  if (Array.isArray(value)) throw new HttpError(400, "Mcp-Session-Id inválido.");
  return value;
}

export function startHttpServer(createServerForConfig: McpServerFactory, baseConfig: ServerConfig, config: HttpServerConfig): Promise<void> {
  const sessions = new Map<string, Session>();
  const rates = new Map<string, RateEntry>();

  function log(requestId: string, request: IncomingMessage, status: number, startedAt: number, clientId?: string): void {
    console.error(JSON.stringify({ event: "http_request", requestId, method: request.method, path: new URL(request.url ?? "/", "http://localhost").pathname, status, durationMs: Date.now() - startedAt, ...(clientId ? { clientId } : {}) }));
  }

  function consumeRate(key: string): void {
    const now = Date.now();
    let entry = rates.get(key);
    if (!entry || now - entry.startedAt >= config.rateLimitWindowMs) {
      entry = { startedAt: now, count: 0 };
      rates.set(key, entry);
    }
    if (entry.count >= config.rateLimitMax) {
      const seconds = Math.max(1, Math.ceil((config.rateLimitWindowMs - (now - entry.startedAt)) / 1000));
      throw new HttpError(429, "Limite de chamadas excedido.", seconds);
    }
    entry.count += 1;
    if (rates.size > 10_000) {
      for (const [rateKey, rate] of rates) if (now - rate.startedAt >= config.rateLimitWindowMs) rates.delete(rateKey);
    }
  }

  function expireSession(sessionId: string, session: Session): void {
    if (session.idleTimer) clearTimeout(session.idleTimer);
    session.idleTimer = setTimeout(() => {
      if (sessions.get(sessionId) !== session) return;
      sessions.delete(sessionId);
      void session.transport.close().catch(() => undefined);
    }, config.sessionIdleMs);
    session.idleTimer.unref();
  }

  function closeSession(sessionId: string): void {
    const session = sessions.get(sessionId);
    if (!session) return;
    if (session.idleTimer) clearTimeout(session.idleTimer);
    sessions.delete(sessionId);
    void session.transport.close().catch(() => undefined);
  }

  async function handle(request: IncomingMessage, response: ServerResponse): Promise<void> {
    const requestId = randomUUID();
    const startedAt = Date.now();
    let clientId: string | undefined;
    let logged = false;
    const finishLog = (status: number) => { if (!logged) { logged = true; log(requestId, request, status, startedAt, clientId); } };
    response.setHeader("X-Request-Id", requestId);
    response.setHeader("X-Content-Type-Options", "nosniff");
    response.setHeader("Cache-Control", "no-store");
    response.once("finish", () => finishLog(response.statusCode));
    response.once("close", () => finishLog(response.statusCode));

    try {
      validateRequestBoundary(request, config);
      applyCors(request, response, config);
      consumeRate(`ip:${request.socket.remoteAddress ?? "unknown"}`);

      const requestUrl = new URL(request.url ?? "/", "http://localhost");
      if (requestUrl.pathname === "/healthz" && request.method === "GET") {
        sendJson(response, 200, { status: "ok" });
        return;
      }
      if (requestUrl.pathname !== config.endpointPath) throw new HttpError(404, "Endpoint não encontrado.");
      if (requestUrl.search) throw new HttpError(400, "Parâmetros de query não são aceitos no endpoint MCP.");
      if (request.method === "OPTIONS") {
        response.writeHead(204, { "Content-Length": "0" });
        response.end();
        return;
      }
      if (!["GET", "POST", "DELETE"].includes(request.method ?? "")) {
        response.setHeader("Allow", "GET, POST, DELETE, OPTIONS");
        throw new HttpError(405, "Método não permitido.");
      }

      const credential = credentialFor(request, config.credentials);
      clientId = credential.id;
      consumeRate(`client:${credential.id}`);

      const sessionId = sessionHeader(request);
      let session = sessionId ? sessions.get(sessionId) : undefined;
      if (sessionId && !session) throw new HttpError(404, "Sessão MCP não encontrada.");
      if (session && session.clientId !== credential.id) throw new HttpError(403, "Sessão MCP pertence a outra credencial.");

      let parsedBody: unknown;
      if (request.method === "POST") parsedBody = await readJsonBody(request, config.maxBodyBytes);

      if (!session) {
        if (request.method !== "POST" || !isInitializeRequest(parsedBody)) {
          throw new HttpError(400, "Uma sessão MCP deve começar com initialize.");
        }
        for (const [id, existing] of sessions) {
          if (Date.now() - existing.lastUsed > config.sessionIdleMs) closeSession(id);
        }
        if (sessions.size >= config.maxSessions) throw new HttpError(503, "Limite de sessões MCP atingido.");

        const scopedConfig: ServerConfig = { ...baseConfig, allowedProjects: credential.projects };
        const mcpServer = createServerForConfig(scopedConfig);
        let newTransport!: StreamableHTTPServerTransport;
        newTransport = new StreamableHTTPServerTransport({
          sessionIdGenerator: () => randomUUID(),
          onsessioninitialized: (id) => {
            const state: Session = { transport: newTransport, server: mcpServer, clientId: credential.id, projects: credential.projects, lastUsed: Date.now() };
            sessions.set(id, state);
            expireSession(id, state);
          },
        });
        newTransport.onclose = () => {
          const id = newTransport.sessionId;
          if (!id) return;
          const state = sessions.get(id);
          if (state?.idleTimer) clearTimeout(state.idleTimer);
          sessions.delete(id);
        };
        await mcpServer.connect(newTransport);
        await newTransport.handleRequest(request, response, parsedBody);
        return;
      }

      session.lastUsed = Date.now();
      if (session.idleTimer) clearTimeout(session.idleTimer);
      expireSession(sessionId!, session);
      await session.transport.handleRequest(request, response, parsedBody);
      if (request.method === "DELETE") closeSession(sessionId!);
    } catch (error) {
      const status = error instanceof HttpError ? error.status : 500;
      if (error instanceof HttpError && error.retryAfter) response.setHeader("Retry-After", String(error.retryAfter));
      if (status === 401) response.setHeader("WWW-Authenticate", 'Bearer realm="nord-center-infra-agent"');
      sendJson(response, status, { error: error instanceof HttpError ? error.message : "Falha interna no endpoint MCP.", requestId });
      finishLog(status);
    }
  }

  const httpServer = createServer((request, response) => { void handle(request, response); });
  httpServer.headersTimeout = 15_000;
  httpServer.requestTimeout = 30_000;
  return new Promise((resolve, reject) => {
    httpServer.once("error", reject);
    httpServer.listen(config.port, config.host, () => {
      httpServer.off("error", reject);
      const address = httpServer.address();
      const port = typeof address === "object" && address ? address.port : config.port;
      console.error(JSON.stringify({ event: "http_server_started", host: config.host, port, path: config.endpointPath }));

      let shuttingDown = false;
      const shutdown = () => {
        if (shuttingDown) return;
        shuttingDown = true;
        for (const id of sessions.keys()) closeSession(id);
        httpServer.close((error) => {
          if (error) {
            console.error(JSON.stringify({ event: "http_server_shutdown_error" }));
            process.exitCode = 1;
          }
          resolve();
        });
      };
      process.once("SIGINT", shutdown);
      process.once("SIGTERM", shutdown);
    });
  });
}
