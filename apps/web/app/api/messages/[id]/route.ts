import { withApiErrorHandling } from "@/lib/route";
import { authenticateApiRequest } from "@/server/services/api-auth-service";
import { MessagesService } from "@/server/services/messages-service";

export const dynamic = "force-dynamic";

export async function GET(request: Request, context: { params: { id: string } }) {
  return withApiErrorHandling(async () => {
    const principal = await authenticateApiRequest(request, "messages:read");
    const service = new MessagesService();
    const message = await service.get(context.params.id, principal.organizationId);

    return Response.json({
      id: message.id,
      application_id: message.application_id,
      to: message.to_number,
      from: message.from_number,
      status: message.status,
      body: message.body,
      media_urls: message.media_urls,
      error_code: message.error_code,
      error_message: message.error_message,
      created_at: message.created_at,
      delivered_at: message.delivered_at
    });
  });
}
