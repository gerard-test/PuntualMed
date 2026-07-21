import { getEnv } from "./env";

// Funcion que entrega el token actual; se inyecta para no acoplar el cliente a Supabase.
export type TokenProvider = () => Promise<string | null>;

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public body: unknown = null,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

type RequestOptions = {
  method?: string;
  body?: unknown;
  token?: TokenProvider;
};

export async function apiRequest<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const { apiBaseUrl } = getEnv();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  const token = options.token ? await options.token() : null;
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  const response = await fetch(`${apiBaseUrl}${path}`, {
    method: options.method ?? "GET",
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const text = await response.text();
  let data: unknown = null;

  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
  }

  if (!response.ok) {
    console.error(`[API Error ${response.status}]:`, data);

    const errorMessage =
      typeof data === "object" && data !== null && "detail" in data
        ? String((data as { detail: unknown }).detail)
        : typeof data === "string"
          ? data
          : `Request failed: ${response.status}`;

    throw new ApiError(response.status, errorMessage, data);
  }

  return data as T;
}