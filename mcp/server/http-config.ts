import { PROJECT_NAMES, type ProjectName } from "./projects.js";
import type { ServerConfig } from "./config.js";

export interface McpClientCredential {
  id: string;
  token: string;
  projects: ProjectName[];
}

export interface HttpServerConfig {
  host: string;
  port: number;
  endpointPath: string;
  credentials: McpClientCredential[];
  allowedHosts: string[];
  allowedOrigins: string[];
  requireHttps: boolean;
  rateLimitWindowMs: number;
  rateLimitMax: number;
  maxSessions: number;
  sessionIdleMs: number;
  maxBodyBytes: number;
}

function boundedInteger(env: NodeJS.ProcessEnv, name: string, fallback: number, min: number, max: number): number {
  const raw = env[name];
  if (!raw) return fallback;
  const value = Number(raw);
  if (!Number.isSafeInteger(value) || value < min || value > max) {
    throw new Error(`${name} precisa ser um inteiro entre ${min} e ${max}.`);
  }
  return value;
}

function parseCredentials(raw: string | undefined, githubToken: string | undefined): McpClientCredential[] {
  if (!raw) throw new Error("MCP_CLIENT_TOKENS é obrigatório no transporte HTTP.");
  let parsed: unknown;
  try { parsed = JSON.parse(raw); } catch { throw new Error("MCP_CLIENT_TOKENS precisa conter um JSON válido."); }
  if (!Array.isArray(parsed) || parsed.length === 0 || parsed.length > 100) {
    throw new Error("MCP_CLIENT_TOKENS precisa listar de 1 a 100 credenciais.");
  }

  const ids = new Set<string>();
  const tokens = new Set<string>();
  const credentials = parsed.map((item, index): McpClientCredential => {
    if (!item || typeof item !== "object") throw new Error(`Credencial ${index + 1} inválida.`);
    const candidate = item as Record<string, unknown>;
    const { id, token, projects } = candidate;
    if (typeof id !== "string" || !/^[A-Za-z0-9._-]{1,64}$/.test(id) || ids.has(id)) {
      throw new Error(`Identificador inválido ou duplicado na credencial ${index + 1}.`);
    }
    if (typeof token !== "string" || Buffer.byteLength(token, "utf8") < 32 || tokens.has(token)) {
      throw new Error(`Token curto, inválido ou duplicado na credencial ${index + 1}; use pelo menos 32 bytes únicos.`);
    }
    if (githubToken && token === githubToken) throw new Error("A credencial MCP não pode reutilizar GITHUB_TOKEN.");
    if (!Array.isArray(projects) || projects.length === 0 || projects.some((project) => typeof project !== "string" || !PROJECT_NAMES.includes(project as ProjectName))) {
      throw new Error(`A credencial ${id} precisa autorizar ao menos um projeto conhecido.`);
    }
    const authorizedProjects = [...new Set(projects as ProjectName[])];
    if (authorizedProjects.length !== projects.length) throw new Error(`A credencial ${id} contém projetos duplicados.`);
    ids.add(id);
    tokens.add(token);
    return { id, token, projects: authorizedProjects };
  });
  return credentials;
}

function parseHosts(raw: string | undefined, publicDomain: string | undefined, host: string): string[] {
  const configured = raw?.split(",").map((value) => value.trim().toLowerCase()).filter(Boolean);
  const hosts = configured?.length ? configured : publicDomain ? [publicDomain.trim().toLowerCase()] : ["localhost", "127.0.0.1"];
  if (hosts.some((value) => value.includes("://") || value.includes("/") || value.includes("*"))) {
    throw new Error("MCP_ALLOWED_HOSTS deve conter somente hostnames exatos, separados por vírgula.");
  }
  const publicBind = !["127.0.0.1", "::1", "localhost"].includes(host.toLowerCase());
  if (publicBind && !configured?.length && !publicDomain) {
    throw new Error("MCP_ALLOWED_HOSTS é obrigatório quando MCP_HOST escuta fora do loopback.");
  }
  return [...new Set(hosts)];
}

function parseOrigins(raw: string | undefined): string[] {
  if (!raw?.trim()) return [];
  const origins = raw.split(",").map((value) => value.trim()).filter(Boolean).map((value) => {
    let parsed: URL;
    try { parsed = new URL(value); } catch { throw new Error("MCP_ALLOWED_ORIGINS contém uma origem inválida."); }
    if (parsed.origin !== value || !["https:", "http:"].includes(parsed.protocol) || parsed.username || parsed.password) {
      throw new Error("MCP_ALLOWED_ORIGINS deve conter origens exatas, sem caminho ou credenciais.");
    }
    if (parsed.protocol === "http:" && !["localhost", "127.0.0.1", "[::1]"].includes(parsed.hostname)) {
      throw new Error("Origens HTTP só são permitidas para localhost durante desenvolvimento.");
    }
    return parsed.origin;
  });
  return [...new Set(origins)];
}

export function loadHttpConfig(env: NodeJS.ProcessEnv, base: ServerConfig): HttpServerConfig {
  if (!base.githubToken) throw new Error("GITHUB_TOKEN é obrigatório para o servidor MCP remoto.");
  const host = env.MCP_HOST || (env.RAILWAY_ENVIRONMENT ? "0.0.0.0" : "127.0.0.1");
  const port = boundedInteger(env, "PORT", 3000, 1, 65535);
  const publicDeployment = Boolean(env.RAILWAY_ENVIRONMENT || env.RAILWAY_PUBLIC_DOMAIN);
  const requireHttps = env.MCP_REQUIRE_HTTPS === "true";
  if (publicDeployment && !requireHttps) throw new Error("MCP_REQUIRE_HTTPS=true é obrigatório em implantação pública.");
  const endpointPath = env.MCP_ENDPOINT_PATH || "/mcp";
  if (!/^\/[A-Za-z0-9/_-]*$/.test(endpointPath) || endpointPath.includes("//")) {
    throw new Error("MCP_ENDPOINT_PATH precisa ser um caminho absoluto simples, como /mcp.");
  }

  return {
    host,
    port,
    endpointPath,
    credentials: parseCredentials(env.MCP_CLIENT_TOKENS, base.githubToken),
    allowedHosts: parseHosts(env.MCP_ALLOWED_HOSTS, env.RAILWAY_PUBLIC_DOMAIN, host),
    allowedOrigins: parseOrigins(env.MCP_ALLOWED_ORIGINS),
    requireHttps,
    rateLimitWindowMs: boundedInteger(env, "MCP_RATE_LIMIT_WINDOW_MS", 60_000, 1_000, 3_600_000),
    rateLimitMax: boundedInteger(env, "MCP_RATE_LIMIT_MAX", 120, 1, 10_000),
    maxSessions: boundedInteger(env, "MCP_MAX_SESSIONS", 200, 1, 10_000),
    sessionIdleMs: boundedInteger(env, "MCP_SESSION_IDLE_MS", 3_600_000, 60_000, 86_400_000),
    maxBodyBytes: boundedInteger(env, "MCP_MAX_BODY_BYTES", 1_048_576, 1_024, 10_485_760),
  };
}
