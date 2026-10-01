import "dotenv/config";

export type AppConfig = {
  port: number;
  databasePath: string;
  frontendOrigin: string;
  aiProvider?: string;
  aiBaseUrl?: string;
  aiApiKey?: string;
  aiModel?: string;
};

export function loadConfig(env: NodeJS.ProcessEnv = process.env): AppConfig {
  return {
    port: Number(env.PORT ?? 3000),
    databasePath: env.DATABASE_PATH ?? "./data/i-ris.sqlite",
    frontendOrigin: env.FRONTEND_ORIGIN ?? "http://localhost:5173",
    aiProvider: env.AI_PROVIDER ?? "freellmapi",
    aiBaseUrl: env.AI_BASE_URL ?? "http://localhost:3001/v1",
    aiApiKey: env.AI_API_KEY ?? "",
    aiModel: env.AI_MODEL ?? "auto",
  };
}
