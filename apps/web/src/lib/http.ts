import { AppError } from "@/lib/errors";

export function toApiErrorResponse(error: unknown) {
  if (error instanceof AppError) {
    return Response.json(
      {
        error: {
          code: error.code,
          message: error.message
        }
      },
      { status: error.status }
    );
  }

  console.error(error);
  return Response.json(
    {
      error: {
        code: "internal_error",
        message: "Unexpected server error"
      }
    },
    { status: 500 }
  );
}
