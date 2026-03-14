export class CPaaSError extends Error {
  readonly status: number;
  readonly code: string;

  constructor(message: string, status = 500, code = "internal_error") {
    super(message);
    this.name = "CPaaSError";
    this.status = status;
    this.code = code;
  }
}

export async function requestJson<T>(
  baseUrl: string,
  apiKey: string,
  path: string,
  options: RequestInit = {},
  timeoutMs = 15_000
): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(`${baseUrl}${path}`, {
      ...options,
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${apiKey}`,
        ...(options.headers ?? {})
      },
      signal: controller.signal
    });

    const data = await response.json();

    if (!response.ok) {
      throw new CPaaSError(
        data?.error?.message ?? "Request failed",
        response.status,
        data?.error?.code ?? "request_failed"
      );
    }

    return data as T;
  } finally {
    clearTimeout(timeout);
  }
}
