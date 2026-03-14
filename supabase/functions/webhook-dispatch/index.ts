Deno.serve(async (req) => {
  const payload = await req.text();
  const secret = Deno.env.get("CPAAS_WEBHOOK_SIGNING_SECRET") ?? "";

  const signatureBuffer = await crypto.subtle.sign(
    "HMAC",
    await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    ),
    new TextEncoder().encode(payload)
  );

  const signature = Array.from(new Uint8Array(signatureBuffer))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");

  return new Response(
    JSON.stringify({
      signature,
      payload: JSON.parse(payload)
    }),
    {
      headers: { "content-type": "application/json" }
    }
  );
});
