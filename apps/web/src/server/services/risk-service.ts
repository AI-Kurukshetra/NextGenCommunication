interface ScoringInput {
  from: string;
  to: string;
  body?: string;
  ipAddress?: string;
}

export function scoreSpam(input: ScoringInput) {
  const body = (input.body ?? "").toLowerCase();
  let score = 0;

  if (body.includes("win") || body.includes("lottery") || body.includes("free money")) {
    score += 0.45;
  }

  if (body.includes("http://") || body.includes("https://")) {
    score += 0.2;
  }

  if (input.from.startsWith("+999")) {
    score += 0.35;
  }

  return Math.min(1, score);
}

export function fraudRiskScore(input: ScoringInput) {
  let score = 0.08;

  if (input.ipAddress?.startsWith("10.")) {
    score += 0.2;
  }

  if ((input.body ?? "").length < 3) {
    score += 0.1;
  }

  return Math.min(1, score);
}
