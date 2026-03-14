import { z } from "zod";
import { toApiErrorResponse } from "@/lib/http";

export async function parseJson<T>(request: Request, schema: z.ZodSchema<T>) {
  const body = await request.json();
  return schema.parse(body);
}

export async function withApiErrorHandling(handler: () => Promise<Response>) {
  try {
    return await handler();
  } catch (error) {
    return toApiErrorResponse(error);
  }
}
