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
      sttProvider: "groq",
      sttApiKey: "",
      sttModel: "whisper-large-v3-turbo",
      sttLanguage: "en",
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
      STT_PROVIDER: "groq",
      STT_API_KEY: "test-groq-key",
      STT_MODEL: "whisper-large-v3",
      STT_LANGUAGE: "hi",
    });

    expect(config).toEqual({
      port: 3001,
      databasePath: "./data/test.sqlite",
      frontendOrigin: "http://localhost:5174",
      aiProvider: "freellmapi",
      aiBaseUrl: "http://localhost:3001/v1",
      aiApiKey: "test-api-key",
      aiModel: "gemini-2.5-flash",
      sttProvider: "groq",
      sttApiKey: "test-groq-key",
      sttModel: "whisper-large-v3",
      sttLanguage: "hi",
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
