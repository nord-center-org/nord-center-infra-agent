import { randomBytes, timingSafeEqual } from "node:crypto";
import type { ProjectName } from "./projects.js";

const TOKEN_TTL_MS = 2 * 60 * 60 * 1000;
const issued = new Map<string, { project: ProjectName; expiresAt: number }>();

export function issueContextToken(project: ProjectName): string {
  const token = randomBytes(32).toString("hex");
  issued.set(token, { project, expiresAt: Date.now() + TOKEN_TTL_MS });
  if (issued.size > 10_000) {
    for (const [value, entry] of issued) if (entry.expiresAt <= Date.now()) issued.delete(value);
  }
  return token;
}

export function requireContextToken(project: ProjectName, token: string): void {
  const entry = issued.get(token);
  const supplied = Buffer.from(token);
  const stored = Buffer.from(entry ? token : "invalid-context-token");
  const matches = supplied.length === stored.length && timingSafeEqual(supplied, stored);
  if (!entry || !matches || entry.project !== project || entry.expiresAt <= Date.now()) {
    throw new Error(`Alteração bloqueada: carregue get_project_context para ${project} e use o context_token retornado. O token é válido por até duas horas.`);
  }
}
