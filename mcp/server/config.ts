import { PROJECT_NAMES, type ProjectName } from "./projects.js";
import { z } from "zod";

export interface ServerConfig {
  name: string;
  version: string;
  githubToken?: string;
  allowedProjects: readonly ProjectName[];
}

export function loadConfig(env: NodeJS.ProcessEnv = process.env): ServerConfig {
  return {
    name: "nord-center-infra-agent",
    version: "0.1.0",
    githubToken: env.GITHUB_TOKEN,
    allowedProjects: PROJECT_NAMES,
  };
}

export function projectInputSchema(config: ServerConfig) {
  const projects = [...config.allowedProjects] as [ProjectName, ...ProjectName[]];
  if (projects.length === 0) throw new Error("A credencial MCP precisa autorizar ao menos um projeto.");
  return z.enum(projects);
}
