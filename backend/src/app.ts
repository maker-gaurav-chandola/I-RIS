import cookie from "@fastify/cookie";
import websocket from "@fastify/websocket";
import cors from "@fastify/cors";
import Fastify, { type FastifyInstance } from "fastify";
import type { FastifyReply, FastifyRequest } from "fastify";
import type { Database } from "sql.js";
import type { AppConfig } from "./config.js";
import {
  findAccountById,
  loginAccount,
  registerAccount,
  validateCredentials,
} from "./modules/identity/identity-service.js";
import {
  createSessionEngine,
  SessionEngineError,
  type SessionConfiguration,
} from "./modules/interview-session/session-engine.js";
import { createHistoryProgressBoundary } from "./modules/history-progress/history-progress-boundary.js";
import { createGroqSttProvider } from "./providers/stt/groq-stt-provider.js";
import { createGeminiLiveProvider } from "./providers/voice/gemini-live-provider.js";

const sessionCookieName = "i_ris_session";

export function buildApp(
  database: Database,
  config: AppConfig,
): FastifyInstance {
  const app = Fastify({ logger: false });
  const sessions = new Map<string, string>();
  const sessionEngine = createSessionEngine(database, config);
  const historyProgress = createHistoryProgressBoundary(database);
  const sttProvider =
    config.sttProvider === "groq" && config.sttApiKey
      ? createGroqSttProvider({
          apiKey: config.sttApiKey,
          model: config.sttModel,
          language: config.sttLanguage,
        })
      : null;

  const geminiLiveProvider =
    config.geminiApiKey
      ? createGeminiLiveProvider({
          apiKey: config.geminiApiKey,
          model: config.geminiModel ?? "gemini-3.1-flash-live-preview",
          systemInstruction:
            "You are the voice interviewer for I-RIS. Act as a professional interviewer. Speak naturally and concisely. Do not invent interview questions or change the interview flow. Only speak the question or instruction supplied by the I-RIS backend. Do not provide scores, feedback, strengths, weaknesses, or analysis during the interview.",
        })
      : null;
  app.register(cookie);
  app.register(websocket);
  app.register(cors, { origin: config.frontendOrigin, credentials: true });

  const setSessionCookie = (reply: FastifyReply, token: string): void => {
    reply.setCookie(sessionCookieName, token, {
      httpOnly: true,
      sameSite: "lax",
      secure: false,
      path: "/",
    });
  };

  const getAuthenticatedAccount = (request: FastifyRequest) => {
    const token = request.cookies?.[sessionCookieName];
    const accountId = token ? sessions.get(token) : undefined;
    return accountId ? findAccountById(database, accountId) : null;
  };

  app.register(async (voiceApp) => {
    voiceApp.addHook("preValidation", async (request, reply) => {
      const account = getAuthenticatedAccount(request);
      const sessionId = (request.query as { sessionId?: string }).sessionId;

      if (!account || !sessionId) {
        return reply
          .code(401)
          .send({ error: "Voice session authentication required." });
      }

      try {
        const session = sessionEngine.get(account.id, sessionId);

        if (session.mode !== "Voice") {
          return reply.code(400).send({
            error: "Voice transport requires a Voice interview session.",
          });
        }

        if (session.state !== "active") {
          return reply.code(409).send({
            error: "Voice transport requires an active interview session.",
          });
        }
      } catch {
        return reply
          .code(404)
          .send({ error: "Interview session was not found." });
      }
    });

    voiceApp.get("/voice", { websocket: true }, (socket, request) => {
      console.log("[VOICE] websocket connected");

      if (!geminiLiveProvider) {
        socket.send(
          JSON.stringify({
            type: "error",
            code: "CONNECTION_FAILED",
            message: "Gemini Live voice provider is not configured.",
          }),
        );
        socket.close();
        return;
      }

      const gemini = createGeminiLiveProvider({
        apiKey: config.geminiApiKey ?? "",
        model: config.geminiModel ?? "gemini-3.1-flash-live-preview",
        systemInstruction:
          "You are the voice interviewer for I-RIS. Act as a professional interviewer. Speak naturally and concisely. Do not invent interview questions or change the interview flow. Only speak the question or instruction supplied by the I-RIS backend. Do not provide scores, feedback, strengths, weaknesses, or analysis during the interview.",
      });

      let inputTranscript = "";
      let connected = false;
      let processingAnswer = false;

      gemini.onAudio((audio) => {
        socket.send(
          JSON.stringify({
            type: "audio",
            audio,
          }),
        );
      });

      gemini.onTranscript((transcript, isFinal, source) => {
        if (source === "input") {
          inputTranscript += transcript;

          socket.send(
            JSON.stringify({
              type: "transcription",
              transcript,
              isFinal,
            }),
          );
        } else {
          socket.send(
            JSON.stringify({
              type: "interviewerTranscription",
              transcript,
              isFinal,
            }),
          );
        }
      });

      gemini.onState((state) => {
          if (state === "connected") {
            connected = true;
          }

        if (state === "error") {
          socket.send(
            JSON.stringify({
              type: "error",
              code: "CONNECTION_FAILED",
              message: "Gemini Live connection failed.",
            }),
          );
        }

        if (state === "disconnected") {
          connected = false;
          socket.send(
            JSON.stringify({
              type: "state",
              state: "disconnected",
            }),
          );
        }
      });

      socket.send(
        JSON.stringify({
          type: "state",
          state: "connecting",
        }),
      );

      const processCandidateAnswer = async () => {
        if (processingAnswer) return;

        const answer = inputTranscript.trim();

        if (!answer) {
          return;
        }

        processingAnswer = true;
        inputTranscript = "";

        socket.send(
          JSON.stringify({
            type: "state",
            state: "processing",
          }),
        );

        try {
          const cookieHeader = Array.isArray(request.headers.cookie)
            ? request.headers.cookie.join("; ")
            : request.headers.cookie ?? "";

          const sessionCookie = cookieHeader
            .split(";")
            .map((part) => part.trim())
            .find((part) =>
              part.startsWith(`${sessionCookieName}=`),
            );

          const token = sessionCookie?.slice(
            sessionCookieName.length + 1,
          );

          const accountId = token
            ? sessions.get(decodeURIComponent(token))
            : undefined;

          const account = accountId
            ? findAccountById(database, accountId)
            : null;

          const sessionId = new URL(
            request.url,
            `http://${request.headers.host ?? "localhost"}`,
          ).searchParams.get("sessionId");

          if (!account || !sessionId) {
            throw new Error(
              "Voice session authentication required.",
            );
          }

          const session = await sessionEngine.submitAnswer(
            account.id,
            sessionId,
            answer,
          );

          socket.send(
            JSON.stringify({
              type: "session",
              session,
            }),
          );

          socket.send(
            JSON.stringify({
              type: "turnComplete",
            }),
          );

          if (
            session.state === "active" &&
            session.currentQuestion
          ) {
            socket.send(
              JSON.stringify({
                type: "state",
                state: "speaking",
              }),
            );

            gemini.sendQuestion(session.currentQuestion);
          }
        } catch (error) {
          console.error(
            "[VOICE] automatic answer processing failed",
            error,
          );

          socket.send(
            JSON.stringify({
              type: "error",
              code: "UNKNOWN",
              message: "Interview answer processing failed.",
            }),
          );

          socket.send(
            JSON.stringify({
              type: "state",
              state: "listening",
            }),
          );
        } finally {
          processingAnswer = false;
        }
      };

      gemini.onTurnComplete((source) => {
        if (source === "input") {
          void processCandidateAnswer();
          return;
        }

        socket.send(
          JSON.stringify({
            type: "state",
            state: "listening",
          }),
        );
      });

      void gemini
        .connect()
        .then(async () => {
          const cookieHeader = Array.isArray(request.headers.cookie) ? request.headers.cookie.join("; ") : request.headers.cookie ?? "";
          const sessionCookie = cookieHeader.split(";").map((part) => part.trim()).find((part) => part.startsWith(`${sessionCookieName}=`));
          const token = sessionCookie?.slice(sessionCookieName.length + 1);
          const accountId = token ? sessions.get(decodeURIComponent(token)) : undefined;
          const account = accountId ? findAccountById(database, accountId) : null;

          const sessionId = new URL(
            request.url,
            `http://${request.headers.host ?? "localhost"}`,
          ).searchParams.get("sessionId");

          if (!account || !sessionId) {
            throw new Error("Voice session authentication required.");
          }

          const session = sessionEngine.get(account.id, sessionId);

          if (session.currentQuestion) {
            socket.send(
              JSON.stringify({
                type: "state",
                state: "speaking",
              }),
            );

            gemini.sendQuestion(session.currentQuestion);
          }
        })
        .catch((error) => {
          console.error("[VOICE] Gemini connection failed", error);
          socket.send(
            JSON.stringify({
              type: "error",
              code: "CONNECTION_FAILED",
              message: "Unable to connect to Gemini Live.",
            }),
          );
        });

      socket.on("message", async (rawMessage: Buffer, isBinary: boolean) => {
        try {
          if (isBinary) {
            if (connected) {
              gemini.sendAudio(Buffer.from(rawMessage));
            }
            return;
          }

          const message = JSON.parse(rawMessage.toString()) as {
            type?: string;
          };

          if (message.type === "interrupt") {
            inputTranscript = "";
            gemini.interrupt();
            socket.send(JSON.stringify({ type: "interrupted" }));
            return;
          }

          if (message.type === "stopListening") {
            await processCandidateAnswer();
            return;
          }
          socket.send(
            JSON.stringify({
              type: "state",
              state: "listening",
            }),
          );
        } catch (error) {
          console.error("[VOICE] invalid message", error);
          socket.send(
            JSON.stringify({
              type: "error",
              code: "CONNECTION_FAILED",
              message: "Invalid voice message.",
            }),
          );
        }
      });

      socket.on("close", () => {
        connected = false;
        gemini.disconnect();
      });
    });
  });
  app.get("/api/health", async () => {
    try {
      database.exec("SELECT 1");
      return {
        status: "ok",
        service: "i-ris-backend",
        database: "connected",
      };
    } catch {
      return {
        status: "degraded",
        service: "i-ris-backend",
        database: "unavailable",
      };
    }
  });

  app.get("/api/status", async () => ({
    name: "I-RIS",
    foundation: "ready",
    ai: "boundary-only",
    interviewEngine: "boundary-only",
  }));

  app.get("/api/interview-history", async (request, reply) => {
    const account = getAuthenticatedAccount(request);
    if (!account)
      return reply.code(401).send({ error: "Authentication required." });
    return reply.send({
      history: historyProgress.listHistory(account.id),
      progress: historyProgress.compareProgress(account.id),
    });
  });

  app.post<{ Body: { email?: unknown; password?: unknown } }>(
    "/api/auth/register",
    async (request, reply) => {
      const { email, password } = request.body ?? {};
      const validationError = validateCredentials(email, password);
      if (validationError)
        return reply.code(400).send({ error: validationError });

      try {
        const result = registerAccount(
          database,
          email as string,
          password as string,
        );
        sessions.set(result.sessionToken, result.account.id);
        setSessionCookie(reply, result.sessionToken);
        return reply.code(201).send({ user: result.account });
      } catch (error) {
        if (
          error instanceof Error &&
          error.message === "ACCOUNT_ALREADY_EXISTS"
        ) {
          return reply
            .code(409)
            .send({ error: "An account with that email already exists." });
        }
        return reply.code(500).send({ error: "Account could not be created." });
      }
    },
  );

  app.post<{ Body: { email?: unknown; password?: unknown } }>(
    "/api/auth/login",
    async (request, reply) => {
      const { email, password } = request.body ?? {};
      const validationError = validateCredentials(email, password);
      if (validationError)
        return reply.code(400).send({ error: validationError });

      const result = loginAccount(
        database,
        email as string,
        password as string,
      );
      if (!result)
        return reply.code(401).send({ error: "Invalid email or password." });

      sessions.set(result.sessionToken, result.account.id);
      setSessionCookie(reply, result.sessionToken);
      return reply.send({ user: result.account });
    },
  );

  app.get("/api/auth/me", async (request, reply) => {
    const account = getAuthenticatedAccount(request);
    if (!account)
      return reply.code(401).send({ error: "Authentication required." });
    return reply.send({ user: account });
  });

  app.post("/api/auth/logout", async (request, reply) => {
    const token = request.cookies[sessionCookieName];
    if (token) sessions.delete(token);
    reply.clearCookie(sessionCookieName, { path: "/" });
    return reply.code(204).send();
  });

  const sessionError = (error: unknown, reply: FastifyReply) => {
    if (!(error instanceof SessionEngineError)) {
      return reply
        .code(500)
        .send({ error: "Interview session operation failed." });
    }
    const status =
      error.code === "SESSION_NOT_FOUND" ||
      error.code === "EVALUATION_NOT_FOUND"
        ? 404
        : error.code === "VOICE_UNSUPPORTED" ||
            error.code === "INVALID_DURATION" ||
            error.code === "INVALID_ANSWER" ||
            error.code === "INVALID_EXPECTED_SCORE"
          ? 400
          : 409;
    return reply.code(status).send({ error: error.message, code: error.code });
  };

  app.post<{ Body: SessionConfiguration }>(
    "/api/interview-sessions",
    async (request, reply) => {
      const account = getAuthenticatedAccount(request);
      if (!account)
        return reply.code(401).send({ error: "Authentication required." });
      try {
        const session = sessionEngine.start(account.id, request.body);
        return reply.code(201).send({ session });
      } catch (error) {
        return sessionError(error, reply);
      }
    },
  );

  app.get<{ Params: { sessionId: string } }>(
    "/api/interview-sessions/:sessionId",
    async (request, reply) => {
      const account = getAuthenticatedAccount(request);
      if (!account)
        return reply.code(401).send({ error: "Authentication required." });
      try {
        return reply.send({
          session: sessionEngine.get(account.id, request.params.sessionId),
        });
      } catch (error) {
        return sessionError(error, reply);
      }
    },
  );

  app.post<{ Params: { sessionId: string }; Body: { answer?: unknown } }>(
    "/api/interview-sessions/:sessionId/answers",
    async (request, reply) => {
      const account = getAuthenticatedAccount(request);
      if (!account)
        return reply.code(401).send({ error: "Authentication required." });
      if (typeof request.body?.answer !== "string")
        return reply.code(400).send({ error: "Answer is required." });
      try {
        const session = await sessionEngine.submitAnswer(
          account.id,
          request.params.sessionId,
          request.body.answer,
        );
        return reply.send({ session });
      } catch (error) {
        return sessionError(error, reply);
      }
    },
  );

  app.post<{ Params: { sessionId: string } }>(
    "/api/interview-sessions/:sessionId/close",
    async (request, reply) => {
      const account = getAuthenticatedAccount(request);
      if (!account)
        return reply.code(401).send({ error: "Authentication required." });
      try {
        return reply.send({
          session: sessionEngine.beginClosing(
            account.id,
            request.params.sessionId,
          ),
        });
      } catch (error) {
        return sessionError(error, reply);
      }
    },
  );

  app.post<{
    Params: { sessionId: string };
    Body: { expectedScore?: unknown };
  }>(
    "/api/interview-sessions/:sessionId/expected-score",
    async (request, reply) => {
      const account = getAuthenticatedAccount(request);
      if (!account)
        return reply.code(401).send({ error: "Authentication required." });
      if (typeof request.body?.expectedScore !== "number")
        return reply.code(400).send({ error: "Expected score is required." });
      try {
        return reply.send({
          session: sessionEngine.submitExpectedScore(
            account.id,
            request.params.sessionId,
            request.body.expectedScore,
          ),
        });
      } catch (error) {
        return sessionError(error, reply);
      }
    },
  );

  app.post<{ Params: { sessionId: string } }>(
    "/api/interview-sessions/:sessionId/evaluate",
    async (request, reply) => {
      const account = getAuthenticatedAccount(request);
      if (!account)
        return reply.code(401).send({ error: "Authentication required." });
      try {
        return reply.send({
          evaluation: sessionEngine.generateEvaluation(
            account.id,
            request.params.sessionId,
          ),
        });
      } catch (error) {
        return sessionError(error, reply);
      }
    },
  );

  app.get<{ Params: { sessionId: string } }>(
    "/api/interview-sessions/:sessionId/results",
    async (request, reply) => {
      const account = getAuthenticatedAccount(request);
      if (!account)
        return reply.code(401).send({ error: "Authentication required." });
      try {
        return reply.send({
          evaluation: sessionEngine.getEvaluationResult(
            account.id,
            request.params.sessionId,
          ),
        });
      } catch (error) {
        return sessionError(error, reply);
      }
    },
  );

  app.post<{ Params: { sessionId: string } }>(
    "/api/interview-sessions/:sessionId/terminate",
    async (request, reply) => {
      const account = getAuthenticatedAccount(request);
      if (!account)
        return reply.code(401).send({ error: "Authentication required." });
      try {
        return reply.send({
          session: sessionEngine.terminate(
            account.id,
            request.params.sessionId,
          ),
        });
      } catch (error) {
        return sessionError(error, reply);
      }
    },
  );

  return app;
}















