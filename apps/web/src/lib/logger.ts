type LogLevel = "info" | "warn" | "error";

function log(level: LogLevel, message: string, metadata?: Record<string, unknown>) {
  const payload = {
    level,
    message,
    metadata,
    ts: new Date().toISOString()
  };

  if (level === "error") {
    console.error(JSON.stringify(payload));
    return;
  }

  console.log(JSON.stringify(payload));
}

export const logger = {
  info: (message: string, metadata?: Record<string, unknown>) => log("info", message, metadata),
  warn: (message: string, metadata?: Record<string, unknown>) => log("warn", message, metadata),
  error: (message: string, metadata?: Record<string, unknown>) => log("error", message, metadata)
};
