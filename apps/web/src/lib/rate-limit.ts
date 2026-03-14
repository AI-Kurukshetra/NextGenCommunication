import { AppError } from "@/lib/errors";

const limits = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(key: string, limit = 60, windowMs = 60_000) {
  const now = Date.now();
  const existing = limits.get(key);

  if (!existing || existing.resetAt <= now) {
    limits.set(key, { count: 1, resetAt: now + windowMs });
    return;
  }

  if (existing.count >= limit) {
    throw new AppError("Rate limit exceeded", { status: 429, code: "rate_limited" });
  }

  existing.count += 1;
  limits.set(key, existing);
}
