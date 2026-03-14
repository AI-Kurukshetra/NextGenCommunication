import { CPaaSClient } from "../src/client";

async function run() {
  const client = new CPaaSClient({
    apiKey: process.env.CPAAS_API_KEY ?? "sk_test_nextgen_1234567890",
    baseUrl: process.env.CPAAS_BASE_URL ?? "http://localhost:3000"
  });

  const message = await client.messages.send({
    to: "+1234567890",
    from: "+1987654321",
    text: "Hello World"
  });

  console.log("Message accepted:", message);
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
