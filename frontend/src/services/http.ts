// Single point of contact with the Fastify backend. Every service module
// goes through this — never call fetch() directly from a page or hook.
//
// Auth model assumption: the backend issues an httpOnly session cookie on
// login (not a token the frontend stores/attaches). `credentials: "include"`
// is set on every request so that cookie always rides along. If the actual
// backend instead returns a bearer token, swap that in here — it's the only
// file that needs to change.

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "";

export class ApiError extends Error {
  status: number;
  body: unknown;

  constructor(status: number, message: string, body?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.body = body;
  }
}

interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  signal?: AbortSignal;
}

export async function apiRequest<TResponse>(
  path: string,
  options: RequestOptions = {},
): Promise<TResponse> {
  const { method = "GET", body, signal } = options;
  const requestBody = body ?? (method === "POST" ? {} : undefined);

  const response = await fetch(`${API_BASE}${path}`, {
    method,
    credentials: "include",
    headers: requestBody ? { "Content-Type": "application/json" } : undefined,
    body: requestBody ? JSON.stringify(requestBody) : undefined,
    signal,
  });

  const contentType = response.headers.get("content-type") ?? "";
  const isJson = contentType.includes("application/json");
  const payload = isJson
    ? await response.json().catch(() => null)
    : await response.text().catch(() => null);

  if (!response.ok) {
    // The backend is the source of truth for error shape/messages. Adjust
    // this extraction once the real error envelope is confirmed.
    const message =
      (isJson && payload && typeof payload === "object" && "error" in payload
        ? String((payload as { error: unknown }).error)
        : isJson &&
            payload &&
            typeof payload === "object" &&
            "message" in payload
          ? String((payload as { message: unknown }).message)
          : null) ?? `Request failed with status ${response.status}`;
    throw new ApiError(response.status, message, payload);
  }

  return payload as TResponse;
}

