import { describe, expect, it } from "vitest";
import { loadConfig } from "./config.js";

describe("configuration", () => {
  it("uses default values when environment variables are missing", () => {
    const config = loadConfig({});

    expect(config).toEqual({
      port: 3000,
      databasePath: "./data/i-ris.sqlite",
      frontendOrigin: "http://localhost:5173",
    });
  });

  it("loads configured values from environment variables", () => {
    const config = loadConfig({
      PORT: "3001",
      DATABASE_PATH: "./data/test.sqlite",
      FRONTEND_ORIGIN: "http://localhost:5174",
    });

    expect(config).toEqual({
      port: 3001,
      databasePath: "./data/test.sqlite",
      frontendOrigin: "http://localhost:5174",
    });
  });

  it("converts the configured port to a number", () => {
    const config = loadConfig({
      PORT: "4321",
    });

    expect(config.port).toBe(4321);
    expect(typeof config.port).toBe("number");
  });
});
