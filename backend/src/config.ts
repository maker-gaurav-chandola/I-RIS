import "dotenv/config";

export type AppConfig = {
  port: number;
  databasePath: string;
  frontendOrigin: string;
};

export function loadConfig(env: NodeJS.ProcessEnv = process.env): AppConfig {
  return {
    port: Number(env.PORT ?? 3000),
    databasePath: env.DATABASE_PATH ?? "./data/i-ris.sqlite",
    frontendOrigin: env.FRONTEND_ORIGIN ?? "http://localhost:5173",
  };
}
