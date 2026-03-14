# 4. Folder Structure

```text
.
+- apps/
¦  +- web/
¦     +- app/
¦     ¦  +- (dashboard)/
¦     ¦  ¦  +- dashboard messages calls numbers campaigns contacts templates
¦     ¦  ¦  +- webhooks analytics billing settings api-keys logs developer-portal
¦     ¦  +- api/
¦     ¦     +- messages/send, messages/[id]
¦     ¦     +- voice/call
¦     ¦     +- numbers/purchase
¦     ¦     +- verify/start, verify/check
¦     ¦     +- campaigns, contacts/import, templates
¦     ¦     +- usage/summary, analytics/overview
¦     ¦     +- auth/oauth/token
¦     ¦     +- webhooks/[provider]
¦     ¦     +- internal/(webhook-dispatch,message-status,queue/run)
¦     +- src/
¦        +- components/
¦        +- hooks/
¦        +- lib/
¦        +- server/
¦           +- integrations/
¦           +- repositories/
¦           +- services/
¦           +- workers/
+- packages/
¦  +- sdk/
¦     +- src/
¦     ¦  +- resources/
¦     ¦  +- client.ts
¦     +- examples/
+- supabase/
¦  +- migrations/
¦  +- functions/
¦  ¦  +- queue-worker/
¦  ¦  +- webhook-dispatch/
¦  +- seed.sql
+- docs/
+- .github/workflows/
```
