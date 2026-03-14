# Feature Coverage Matrix

Status legend:
- `Implemented`: working in current codebase.
- `Partial`: foundation exists, but full scope from requirement is not complete.
- `Planned`: not implemented yet.

## Core Platform Features

| # | Feature | Priority | Complexity | Status | Notes |
|---|---|---|---|---|---|
| 1 | SMS/MMS API | must-have | medium | Implemented | Send, inbound webhook, status updates, delivery receipts pipeline. |
| 2 | Voice API | must-have | high | Partial | Outbound/inbound + status + usage; conferencing/call control depth still limited. |
| 3 | Number Management | must-have | medium | Implemented | Purchase, port, assign APIs and DB lifecycle states. |
| 4 | Webhooks & Events | must-have | medium | Implemented | Config API, signed delivery, attempts log, queue retries. |
| 5 | API Authentication | must-have | low | Implemented | API keys + OAuth client credentials + scope checks. |
| 6 | Call Detail Records (CDR) | must-have | medium | Partial | CDR table + seeded data; dedicated CDR reporting API can be expanded. |
| 7 | Multi-channel Messaging | important | high | Partial | Channel model includes `whatsapp`; broad channel adapters not fully integrated. |
| 8 | Emergency Services Integration | must-have | high | Planned | 911/E911 workflows and compliance controls not yet implemented. |
| 9 | SIP/WebRTC Support | important | high | Planned | No SIP trunk or WebRTC signaling/session APIs yet. |
| 10 | Usage Analytics Dashboard | important | medium | Implemented | Dashboard pages now read tenant-scoped usage + operational data. |
| 11 | Rate Limiting & Quotas | important | low | Partial | API key rate limit exists; full quotas/policies dashboard not complete. |
| 12 | Global Carrier Network | must-have | high | Partial | Carrier/routing schema exists; direct global carrier connectivity remains roadmap. |
| 13 | SDK & Libraries | important | medium | Partial | Node SDK implemented; additional languages pending. |
| 14 | Compliance Management | must-have | medium | Partial | Template approvals and audit data exist; full TCPA/GDPR/HIPAA module pending. |
| 15 | Message Templates | important | low | Implemented | Create/submit/approve lifecycle is implemented. |
| 16 | Failover & Redundancy | must-have | high | Partial | Routing and retry foundations exist; full active-active carrier failover still evolving. |
| 17 | Spam Detection | important | medium | Partial | Risk scoring service exists; deeper ML + production feedback loop pending. |
| 18 | Billing & Usage Tracking | must-have | medium | Implemented | Usage ledger + billing account views and summaries in place. |
| 19 | API Documentation | must-have | low | Partial | OpenAPI/spec docs exist; interactive hosted docs can be improved further. |
| 20 | Number Verification | important | medium | Implemented | Verify start/check OTP flow implemented. |
| 21 | Contact Management | nice-to-have | medium | Implemented | Contact storage, CSV import, and dashboard views implemented. |
| 22 | Campaign Management | important | medium | Partial | Create/schedule and status lifecycle present; A/B testing pending. |
| 23 | Two-Factor Authentication API | important | low | Partial | SMS OTP implemented; voice/TOTP expansion pending. |

## Advanced / Differentiating Features

| # | Feature | Priority | Complexity | Status | Notes |
|---|---|---|---|---|---|
| 1 | AI-Powered Voice Analytics | innovative | high | Planned | |
| 2 | Intelligent Message Routing (ML) | important | high | Partial | Route selection service exists without ML optimization layer. |
| 3 | Low-Code Communication Workflows | innovative | high | Partial | Workflow service foundations exist; visual builder pending. |
| 4 | Voice Biometrics | innovative | high | Planned | |
| 5 | Conversational AI Integration | important | high | Planned | |
| 6 | Omnichannel Orchestration | important | high | Partial | Omnichannel model scaffold exists; full channel orchestration pending. |
| 7 | Predictive Scaling | nice-to-have | high | Planned | |
| 8 | Blockchain Message Verification | innovative | high | Planned | |
| 9 | Edge Computing Integration | innovative | high | Planned | |
| 10 | Advanced Fraud Prevention | important | high | Partial | Fraud scoring baseline exists; behavioral ML layer pending. |
| 11 | Real-time Language Translation | innovative | high | Planned | |
| 12 | IoT Device Communication | important | medium | Planned | |
| 13 | Custom Carrier Integration (white-label) | nice-to-have | high | Partial | Carrier/routing abstractions exist; enterprise self-integration workflows pending. |
| 14 | Quantum-Safe Encryption | innovative | high | Planned | |

## Innovative Ideas (Backlog)

All listed innovative ideas are currently `Planned` and should be treated as post-core roadmap initiatives after must-have and important gaps are closed.

## Suggested Delivery Waves

| Wave | Scope |
|---|---|
| Wave 1 | Close must-have core gaps: emergency services, SIP/WebRTC, CDR reporting, failover hardening, compliance baseline. |
| Wave 2 | Expand important features: multi-channel adapters, quotas, multi-SDK support, campaign experimentation, stronger fraud stack. |
| Wave 3 | Differentiate with AI/ML and workflow productization: intelligent routing, low-code builder, conversational AI modules. |
| Wave 4 | Innovation backlog pilots: biometrics, translation, edge, blockchain proofs, quantum-safe options. |
