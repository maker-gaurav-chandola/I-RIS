import { describe, expect, it } from "vitest";
import { loadConfig } from "./config.js";

describe("configuration", () => {
  it("uses default values when environment variables are missing", () => {
    const config = loadConfig({});

    expect(config).toEqual({
      port: 3000,
      databasePath: "./data/i-ris.sqlite",
      frontendOrigin: "http://localhost:5173",
      aiProvider: "freellmapi",
      aiBaseUrl: "http://localhost:3001/v1",
      aiApiKey: "",
      aiModel: "auto",
    });
  });

  it("loads configured values from environment variables", () => {
    const config = loadConfig({
      PORT: "3001",
      DATABASE_PATH: "./data/test.sqlite",
      FRONTEND_ORIGIN: "http://localhost:5174",
      AI_PROVIDER: "freellmapi",
      AI_BASE_URL: "http://localhost:3001/v1",
      AI_API_KEY: "test-api-key",
      AI_MODEL: "gemini-2.5-flash",
    });

    expect(config).toEqual({
      port: 3001,
      databasePath: "./data/test.sqlite",
      frontendOrigin: "http://localhost:5174",
      aiProvider: "freellmapi",
      aiBaseUrl: "http://localhost:3001/v1",
      aiApiKey: "test-api-key",
      aiModel: "gemini-2.5-flash",
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
