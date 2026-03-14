# 3. API Specification

Base URL: `https://<your-domain>`

Auth:
- `Authorization: Bearer <API_KEY>` or `x-api-key`
- OAuth token endpoint: `POST /api/auth/oauth/token`

## `/auth`

### POST `/api/auth/oauth/token`
Request:
```json
{
  "grant_type": "client_credentials",
  "client_id": "client_dev_nextgen",
  "client_secret": "secret_dev_nextgen_123456",
  "scope": "messages:write messages:read"
}
```
Response:
```json
{
  "access_token": "oa_xxx",
  "token_type": "bearer",
  "expires_in": 3600,
  "scope": "messages:write messages:read"
}
```

## `/messages`

### POST `/api/messages/send`
Request:
```json
{
  "to": "+1234567890",
  "from": "+1987654321",
  "text": "Hello World",
  "mediaUrls": []
}
```
Response (202):
```json
{
  "id": "cbe6...",
  "status": "queued",
  "to": "+1234567890",
  "from": "+1987654321",
  "segments": 1,
  "created_at": "2026-03-14T12:00:00.000Z"
}
```

### GET `/api/messages/{id}`
Response:
```json
{
  "id": "cbe6...",
  "status": "delivered",
  "to": "+1234567890",
  "from": "+1987654321",
  "body": "Hello World",
  "media_urls": [],
  "created_at": "2026-03-14T12:00:00.000Z",
  "delivered_at": "2026-03-14T12:00:03.000Z"
}
```

## `/voice`

### POST `/api/voice/call`
Request:
```json
{
  "to": "+1234567890",
  "from": "+1987654321",
  "answerUrl": "https://app.example.com/voice/answer",
  "record": true
}
```
Response (202):
```json
{
  "id": "67f1...",
  "status": "initiated",
  "to": "+1234567890",
  "from": "+1987654321",
  "created_at": "2026-03-14T12:02:00.000Z"
}
```

## `/numbers`

### POST `/api/numbers/purchase`
Request:
```json
{
  "countryCode": "US",
  "numberType": "local",
  "capabilities": ["sms", "voice"]
}
```
Response:
```json
{
  "id": "9dbb...",
  "phone_number": "+14155550111",
  "status": "active",
  "capabilities": ["sms", "voice"]
}
```

## `/webhooks`

### POST `/api/webhooks/{provider}`
Inbound event payloads:
```json
{
  "event": "inbound_sms",
  "organizationId": "...",
  "applicationId": "...",
  "to": "+14155550111",
  "from": "+14155550999",
  "body": "STOP"
}
```

```json
{
  "event": "call_ended",
  "organizationId": "...",
  "callId": "...",
  "durationSeconds": 84
}
```

## `/campaigns`

### POST `/api/campaigns`
Request:
```json
{
  "name": "Spring Promo",
  "templateId": "...",
  "segmentFilter": {"tags": ["vip"]},
  "scheduledAt": "2026-03-15T08:00:00.000Z"
}
```

## `/contacts`

### POST `/api/contacts/import`
Request:
```json
{
  "csv": "phone,first_name,last_name,email,tags\n+123,Ada,Lovelace,ada@example.com,vip|eng"
}
```
Response:
```json
{
  "imported": 1
}
```

## `/templates`

### POST `/api/templates`
Request:
```json
{
  "name": "otp_login",
  "channel": "sms",
  "body": "Your code is {{code}}",
  "variables": ["code"]
}
```

## `/verify`

### POST `/api/verify/start`
Request:
```json
{
  "to": "+1234567890",
  "from": "+1987654321",
  "ttlSeconds": 300
}
```

### POST `/api/verify/check`
Request:
```json
{
  "to": "+1234567890",
  "code": "123456"
}
```
Response:
```json
{
  "verification_id": "...",
  "status": "approved"
}
```

## `/analytics`

### GET `/api/analytics/overview`
Response:
```json
{
  "total_spend_usd": 120.03,
  "total_units": 23811,
  "top_events": [
    {"event_type": "sms.send", "units": 18000}
  ]
}
```

## `/usage`

### GET `/api/usage/summary`
Response:
```json
{
  "organization_id": "...",
  "summary": {
    "sms.send": {"units": 123, "amount": 0.9225}
  }
}
```

## Event Types Emitted

- `message.delivered`
- `message.failed`
- `call.started`
- `call.ended`
- `inbound.sms`

### POST `/api/templates/{id}/submit`
Moves template from `draft` to `pending_approval`.

### POST `/api/templates/{id}/approve`
Request:
```json
{
  "approved": true,
  "notes": "Compliant for A2P use",
  "approvedBy": "11111111-1111-1111-1111-111111111111"
}
```

### POST `/api/numbers/port`
Request:
```json
{
  "phoneNumber": "+14155551234",
  "countryCode": "US",
  "numberType": "local",
  "capabilities": ["sms", "voice"]
}
```
Response:
```json
{
  "id": "...",
  "phone_number": "+14155551234",
  "status": "porting",
  "port_requested_at": "2026-03-14T12:30:00.000Z"
}
```

### POST `/api/numbers/assign`
Request:
```json
{
  "phoneNumberId": "...",
  "applicationId": "..."
}
```
Response:
```json
{
  "id": "...",
  "phone_number": "+14155550111",
  "application_id": "...",
  "status": "active"
}
```

### POST `/api/webhooks`
Request:
```json
{
  "name": "Primary Sink",
  "url": "https://example.com/webhook",
  "subscribedEvents": ["message.delivered", "call.ended"],
  "applicationId": "..."
}
```
