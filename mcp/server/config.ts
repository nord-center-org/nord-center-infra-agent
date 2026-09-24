export interface ServerConfig {
  name: string;
  version: string;
  githubToken?: string;
}

export function loadConfig(env: NodeJS.ProcessEnv = process.env): ServerConfig {
  return {
    name: "nord-center-infra-agent",
    version: "0.1.0",
    githubToken: env.GITHUB_TOKEN,
  };
}
