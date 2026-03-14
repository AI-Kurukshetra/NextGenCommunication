import { PageHeader } from "@/components/dashboard/page-header";
import { Card, CardTitle } from "@/components/ui/card";

const curlSend = `curl -X POST http://localhost:3000/api/messages/send \\
  -H \"Authorization: Bearer $CPAAS_API_KEY\" \\
  -H \"Content-Type: application/json\" \\
  -d '{\n    \"to\": \"+1234567890\",\n    \"from\": \"+1987654321\",\n    \"text\": \"Hello from curl\"\n  }'`;

const sdkExample = `import { CPaaSClient } from \"@nextgen/cpaas-sdk\";

const client = new CPaaSClient(process.env.CPAAS_API_KEY!);

await client.messages.send({
  to: \"+1234567890\",
  from: \"+1987654321\",
  text: \"Hello World\"
});`;

export default function DeveloperPortalPage() {
  return (
    <div>
      <PageHeader
        title="Developer Portal"
        description="API docs, SDK quickstart, webhook testing, and an interactive playground."
      />
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardTitle>cURL Example</CardTitle>
          <pre className="mt-3 overflow-x-auto rounded-md bg-slate-950 p-3 text-xs text-slate-100">{curlSend}</pre>
        </Card>
        <Card>
          <CardTitle>Node SDK Example</CardTitle>
          <pre className="mt-3 overflow-x-auto rounded-md bg-slate-950 p-3 text-xs text-slate-100">{sdkExample}</pre>
        </Card>
        <Card>
          <CardTitle>Webhook Testing</CardTitle>
          <p className="mt-2 text-sm">Use `/api/webhooks/:provider` with sample payloads for inbound SMS and call events.</p>
        </Card>
        <Card>
          <CardTitle>Code Playground</CardTitle>
          <p className="mt-2 text-sm">Add a Monaco-based playground using this endpoint map and your API key.</p>
        </Card>
      </div>
    </div>
  );
}
