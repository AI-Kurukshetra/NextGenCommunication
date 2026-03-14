export class AppError extends Error {
  readonly status: number;
  readonly code: string;

  constructor(message: string, options?: { status?: number; code?: string }) {
    super(message);
    this.name = "AppError";
    this.status = options?.status ?? 500;
    this.code = options?.code ?? "internal_error";
  }
}

export function assert(condition: unknown, message: string, status = 400): asserts condition {
  if (!condition) {
    throw new AppError(message, { status, code: "validation_error" });
  }
}
