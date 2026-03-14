import { AppError } from "@/lib/errors";

type CounterState = {
  count: number;
  resetAt: number;
};

const counters = new Map<string, CounterState>();

function windowToMs(window: "daily" | "monthly") {
  if (window === "monthly") {
    return 30 * 24 * 60 * 60 * 1000;
  }

  return 24 * 60 * 60 * 1000;
}

export function checkQuotaLimit(payload: {
  key: string;
  limit: number;
  window: "daily" | "monthly";
}) {
  const now = Date.now();
  const windowMs = windowToMs(payload.window);
  const existing = counters.get(payload.key);

  if (!existing || existing.resetAt <= now) {
    counters.set(payload.key, { count: 1, resetAt: now + windowMs });
    return;
  }

  if (existing.count >= payload.limit) {
    throw new AppError("Quota exceeded", {
      status: 429,
      code: "quota_exceeded"
    });
  }

  existing.count += 1;
  counters.set(payload.key, existing);
}
