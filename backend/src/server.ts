import { buildApp } from "./app.js";
import { loadConfig } from "./config.js";
import { closeDatabase, createDatabase } from "./persistence/database.js";

const config = loadConfig();
const database = await createDatabase(config.databasePath);
const app = buildApp(database, config);

app.listen({ port: config.port, host: "0.0.0.0" }).catch((error) => {
  app.log.error(error);
  closeDatabase(database, config.databasePath);
  process.exit(1);
});

const shutdown = async (): Promise<void> => {
  await app.close();
  closeDatabase(database, config.databasePath);
};

process.once("SIGINT", shutdown);
process.once("SIGTERM", shutdown);
