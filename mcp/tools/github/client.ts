import type { ServerConfig } from "../../server/config.js";
import type { ProjectName } from "../../server/projects.js";
import { getProject } from "../../server/projects.js";

const API_BASE = "https://api.github.com";
const API_VERSION = "2026-03-10";

export class GitHubApiError extends Error {
  constructor(message: string, readonly status: number) {
    super(message);
    this.name = "GitHubApiError";
  }
}

export function repoPath(project: ProjectName, suffix: string): string {
  const { owner, repo } = getProject(project);
  return `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}${suffix}`;
}

export async function githubRequest<T>(config: ServerConfig, route: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  headers.set("Accept", "application/vnd.github+json");
  headers.set("X-GitHub-Api-Version", API_VERSION);
  headers.set("User-Agent", "nord-center-infra-agent-mcp");
  if (config.githubToken) headers.set("Authorization", `Bearer ${config.githubToken}`);
  const response = await fetch(`${API_BASE}${route}`, { ...init, headers });
  const raw = await response.text();
  if (!response.ok) {
    let detail = raw;
    try {
      const parsed = JSON.parse(raw) as { message?: string };
      detail = parsed.message ?? raw;
    } catch {
      // Keep the response text when GitHub did not return JSON.
    }
    throw new GitHubApiError(`GitHub API ${response.status}: ${detail.slice(0, 500)}`, response.status);
  }
  return (raw ? JSON.parse(raw) : undefined) as T;
}

export async function githubJson<T>(config: ServerConfig, route: string, method: string, body: unknown): Promise<T> {
  return githubRequest<T>(config, route, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

export function encodePath(path: string): string {
  return path.split("/").map(encodeURIComponent).join("/");
}
