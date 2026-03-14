#!/usr/bin/env node

const { createHash } = require("crypto");
const fs = require("fs");
const path = require("path");
const { createClient } = require("@supabase/supabase-js");

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return;
  }

  const lines = fs.readFileSync(filePath, "utf8").split(/\r?\n/);
  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) {
      continue;
    }

    const match = line.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
    if (!match) {
      continue;
    }

    const key = match[1];
    if (process.env[key] !== undefined) {
      continue;
    }

    let value = match[2].trim();
    if ((value.startsWith("\"") && value.endsWith("\"")) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    process.env[key] = value;
  }
}

const cwd = process.cwd();
loadEnvFile(path.resolve(cwd, "../../.env"));
loadEnvFile(path.resolve(cwd, "../../.env.local"));
loadEnvFile(path.resolve(cwd, ".env"));
loadEnvFile(path.resolve(cwd, ".env.local"));

const required = ["NEXT_PUBLIC_SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY"];

for (const key of required) {
  if (!process.env[key]) {
    console.error(`Missing required environment variable: ${key}`);
    process.exit(1);
  }
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  }
);

const seedConfig = {
  seedTag: process.env.SEED_TAG ?? "demo-v3",
  ownerEmail: process.env.SEED_USER_EMAIL ?? "owner@nextgen.dev",
  ownerPassword: process.env.SEED_USER_PASSWORD ?? "Nextgen123!",
  demoPassword: process.env.SEED_DEMO_PASSWORD ?? "Nextgen123!",
  opsEmail: process.env.SEED_OPS_USER_EMAIL ?? "ops@nextgen.dev",
  analystEmail: process.env.SEED_ANALYST_USER_EMAIL ?? "analyst@nextgen.dev",
  supportEmail: process.env.SEED_SUPPORT_USER_EMAIL ?? "support@nextgen.dev",
  defaultApiKey: process.env.SEED_API_KEY ?? "sk_test_nextgen_1234567890"
};

function stableUuid(label) {
  const hex = createHash("md5").update(`nextgen-seed:${label}`).digest("hex");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20, 32)}`;
}

function emailLocalPart(email) {
  return email.toLowerCase().split("@")[0].replace(/[^a-z0-9]+/g, "-");
}

function titleCaseSlug(slug) {
  return slug
    .split("-")
    .filter(Boolean)
    .map((part) => part[0].toUpperCase() + part.slice(1))
    .join(" ");
}

function isoHoursAgo(hours) {
  return new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();
}

function isoDaysAgo(days) {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
}

function makeE164(base, offset) {
  return `+${base + offset}`;
}

async function findAuthUserByEmail(email) {
  const lowerEmail = email.toLowerCase();
  let page = 1;
  const perPage = 200;

  while (true) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage });
    if (error) {
      throw error;
    }

    const users = data?.users ?? [];
    const match = users.find((user) => user.email?.toLowerCase() === lowerEmail);
    if (match) {
      return match;
    }

    if (users.length < perPage) {
      return null;
    }

    page += 1;
  }
}

async function ensureAuthUser({ email, password, fullName }) {
  const existing = await findAuthUserByEmail(email);
  if (existing) {
    const { error } = await supabase.auth.admin.updateUserById(existing.id, {
      password,
      email_confirm: true,
      user_metadata: {
        ...(existing.user_metadata ?? {}),
        full_name: fullName
      }
    });

    if (error) {
      throw error;
    }

    return { id: existing.id, email, fullName };
  }

  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      full_name: fullName
    }
  });

  if (error) {
    throw error;
  }

  if (!data.user) {
    throw new Error("Supabase did not return an auth user.");
  }

  return { id: data.user.id, email, fullName };
}

async function upsertOne(table, payload, onConflict = "id") {
  const { error } = await supabase.from(table).upsert(payload, { onConflict });
  if (error) {
    throw error;
  }
}

async function upsertMany(table, payload, onConflict = "id") {
  if (!payload.length) {
    return;
  }

  const { error } = await supabase.from(table).upsert(payload, { onConflict });
  if (error) {
    throw error;
  }
}

function buildTenant(user, index) {
  const local = emailLocalPart(user.email);
  const suffix = 40 + index;
  const orgId = stableUuid(`org-${user.email}`);
  const orgSlug = `demo-${local}`;
  const orgName = `${titleCaseSlug(local)} Demo Telecom`;
  const coreAppId = stableUuid(`app-core-${user.email}`);
  const supportAppId = stableUuid(`app-support-${user.email}`);
  const webhookId = stableUuid(`webhook-${user.email}`);
  const campaignPrimaryId = stableUuid(`campaign-primary-${user.email}`);
  const campaignOpsId = stableUuid(`campaign-ops-${user.email}`);
  const templatePromoId = stableUuid(`template-promo-${user.email}`);
  const templateIncidentId = stableUuid(`template-incident-${user.email}`);
  const templateOtpId = stableUuid(`template-otp-${user.email}`);
  const baseNumber = 14155550000 + index * 200;

  const primaryApiKey = index === 0 ? seedConfig.defaultApiKey : `sk_test_${local}_primary_${suffix}11`;
  const secondaryApiKey = `sk_test_${local}_support_${suffix}22`;
  const primaryApiKeyHash = createHash("sha256").update(primaryApiKey).digest("hex");
  const secondaryApiKeyHash = createHash("sha256").update(secondaryApiKey).digest("hex");

  const phoneNumbers = [
    {
      id: stableUuid(`number-core-${user.email}`),
      organization_id: orgId,
      application_id: coreAppId,
      e164_number: makeE164(baseNumber, 11),
      country_code: "US",
      region: "CA",
      number_type: "local",
      status: "active",
      capabilities: ["sms", "voice"],
      provider: "mock",
      monthly_cost_usd: 1.2 + index * 0.2,
      purchased_at: isoDaysAgo(90 + index * 5),
      metadata: { seed_tag: seedConfig.seedTag, tenant: local, channel: "core" }
    },
    {
      id: stableUuid(`number-voice-${user.email}`),
      organization_id: orgId,
      application_id: supportAppId,
      e164_number: makeE164(baseNumber, 12),
      country_code: "US",
      region: "NY",
      number_type: index % 2 === 0 ? "local" : "toll_free",
      status: "active",
      capabilities: ["voice"],
      provider: "mock",
      monthly_cost_usd: 1.4 + index * 0.25,
      purchased_at: isoDaysAgo(70 + index * 4),
      metadata: { seed_tag: seedConfig.seedTag, tenant: local, channel: "support" }
    },
    {
      id: stableUuid(`number-campaign-${user.email}`),
      organization_id: orgId,
      application_id: coreAppId,
      e164_number: makeE164(baseNumber, 13),
      country_code: "US",
      region: "TX",
      number_type: "toll_free",
      status: index % 3 === 0 ? "active" : "porting",
      capabilities: ["sms"],
      provider: "mock",
      monthly_cost_usd: 1.8 + index * 0.3,
      purchased_at: isoDaysAgo(50 + index * 3),
      metadata: { seed_tag: seedConfig.seedTag, tenant: local, channel: "campaign" }
    }
  ];

  const emergencyLocationId = stableUuid(`emergency-location-${user.email}`);
  const emergencyLocations = [
    {
      id: emergencyLocationId,
      organization_id: orgId,
      label: `${titleCaseSlug(local)} HQ`,
      country_code: "US",
      address_line1: `${100 + index} Market Street`,
      address_line2: "Suite 800",
      city: "San Francisco",
      state_region: "CA",
      postal_code: `9410${index}`,
      latitude: 37.7749 + index * 0.001,
      longitude: -122.4194 + index * 0.001,
      is_validated: true,
      validated_at: isoDaysAgo(1 + index),
      metadata: { seed_tag: seedConfig.seedTag, tenant: local, emergency_profile: "primary" }
    }
  ];

  const emergencyAssignments = [
    {
      id: stableUuid(`emergency-assignment-${user.email}`),
      organization_id: orgId,
      phone_number_id: phoneNumbers[0].id,
      emergency_location_id: emergencyLocationId,
      is_active: true,
      activated_at: isoDaysAgo(1 + index),
      metadata: { seed_tag: seedConfig.seedTag, tenant: local, emergency_profile: "default" }
    }
  ];

  const sipEndpoints = [
    {
      id: stableUuid(`sip-endpoint-core-${user.email}`),
      organization_id: orgId,
      application_id: coreAppId,
      name: `${titleCaseSlug(local)} Core SIP Trunk`,
      username: `sip_${local}_core`,
      password_secret: createHash("sha256").update(`sip_${local}_core_password`).digest("hex"),
      domain: `${local}.sip.nextgen.dev`,
      transport: "tls",
      codecs: ["opus", "pcmu"],
      is_active: true,
      metadata: { seed_tag: seedConfig.seedTag, tenant: local, trunk: "core" }
    },
    {
      id: stableUuid(`sip-endpoint-support-${user.email}`),
      organization_id: orgId,
      application_id: supportAppId,
      name: `${titleCaseSlug(local)} Support SIP Trunk`,
      username: `sip_${local}_support`,
      password_secret: createHash("sha256").update(`sip_${local}_support_password`).digest("hex"),
      domain: `${local}-support.sip.nextgen.dev`,
      transport: "udp",
      codecs: ["pcmu"],
      is_active: true,
      metadata: { seed_tag: seedConfig.seedTag, tenant: local, trunk: "support" }
    }
  ];

  const webrtcSessions = [
    {
      id: stableUuid(`webrtc-session-active-${user.email}`),
      organization_id: orgId,
      application_id: supportAppId,
      call_id: null,
      room_name: `${local}-support-room`,
      session_token: createHash("sha256").update(`webrtc-active-${user.email}`).digest("hex").slice(0, 48),
      status: "active",
      expires_at: isoHoursAgo(-4 - index),
      ended_at: null,
      metadata: { seed_tag: seedConfig.seedTag, tenant: local, source: "dashboard-demo" }
    },
    {
      id: stableUuid(`webrtc-session-ended-${user.email}`),
      organization_id: orgId,
      application_id: supportAppId,
      call_id: null,
      room_name: `${local}-incident-room`,
      session_token: createHash("sha256").update(`webrtc-ended-${user.email}`).digest("hex").slice(0, 48),
      status: "ended",
      expires_at: isoHoursAgo(10 + index),
      ended_at: isoHoursAgo(11 + index),
      metadata: { seed_tag: seedConfig.seedTag, tenant: local, source: "incident" }
    }
  ];

  const apiQuotas = [
    {
      id: stableUuid(`quota-org-daily-${user.email}`),
      organization_id: orgId,
      application_id: null,
      quota_key: "api.requests",
      limit_value: 12000 + index * 4000,
      quota_window: "daily",
      is_active: true,
      metadata: { seed_tag: seedConfig.seedTag, tenant: local, scope: "org" }
    },
    {
      id: stableUuid(`quota-app-monthly-${user.email}`),
      organization_id: orgId,
      application_id: coreAppId,
      quota_key: "api.requests",
      limit_value: 180000 + index * 45000,
      quota_window: "monthly",
      is_active: true,
      metadata: { seed_tag: seedConfig.seedTag, tenant: local, scope: "app" }
    }
  ];

  const contactsSeed = [
    ["Maya", "Lopez"],
    ["Daniel", "Khan"],
    ["Priya", "Shah"],
    ["Ethan", "Brooks"],
    ["Rina", "Patel"],
    ["Owen", "Price"],
    ["Sara", "Nguyen"],
    ["Lucas", "Miller"],
    ["Nina", "Roy"],
    ["Aditya", "Menon"]
  ];

  const contacts = contactsSeed.map(([firstName, lastName], contactIndex) => {
    const phone = makeE164(baseNumber, 80 + contactIndex);
    const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}+${local}@example.com`;
    const tagPool = [
      ["vip", "retail"],
      ["support", "trial"],
      ["enterprise", "renewal"],
      ["risk", "at-risk"]
    ];
    const tags = tagPool[(contactIndex + index) % tagPool.length];

    return {
      id: stableUuid(`contact-${user.email}-${contactIndex}`),
      organization_id: orgId,
      application_id: coreAppId,
      phone,
      email,
      first_name: firstName,
      last_name: lastName,
      tags,
      metadata: {
        seed_tag: seedConfig.seedTag,
        tenant: local,
        segment: contactIndex % 2 === 0 ? "growth" : "care"
      }
    };
  });

  const statusPattern = ["delivered", "delivered", "failed", "queued", "sent", "undelivered", "received", "delivered"];
  const messages = contacts.map((contact, contactIndex) => {
    const status = statusPattern[(contactIndex + index) % statusPattern.length];
    const isInbound = status === "received";
    const createdAt = isoHoursAgo(60 - contactIndex * 3 - index);
    const sentAt = status === "queued" ? null : isoHoursAgo(59 - contactIndex * 3 - index);
    const deliveredAt = status === "delivered" ? isoHoursAgo(58 - contactIndex * 3 - index) : null;

    return {
      id: stableUuid(`message-${user.email}-${contactIndex}`),
      organization_id: orgId,
      application_id: isInbound ? supportAppId : coreAppId,
      campaign_id: isInbound ? null : campaignPrimaryId,
      template_id: isInbound ? null : templatePromoId,
      to_number: isInbound ? makeE164(baseNumber, 12) : contact.phone,
      from_number: isInbound ? contact.phone : makeE164(baseNumber, 13),
      direction: isInbound ? "inbound" : "outbound",
      status,
      provider: "mock",
      provider_message_id: `msg_${local}_${contactIndex + 1}`,
      body: isInbound
        ? `${firstWord(contact.first_name)} asking for support update`
        : `Hi ${firstWord(contact.first_name)}, your demo offer closes today.`,
      segment_count: 1 + ((contactIndex + index) % 2),
      error_code: status === "failed" ? "carrier_error" : status === "undelivered" ? "blocked" : null,
      error_message: status === "failed" ? "Carrier temporary issue" : status === "undelivered" ? "Recipient blocked" : null,
      created_at: createdAt,
      sent_at: sentAt,
      delivered_at: deliveredAt,
      metadata: { seed_tag: seedConfig.seedTag, tenant: local }
    };
  });

  const deliveryReceipts = messages
    .filter((message) => ["delivered", "failed", "undelivered"].includes(message.status))
    .map((message, receiptIndex) => ({
      id: stableUuid(`receipt-${user.email}-${receiptIndex}`),
      organization_id: orgId,
      message_id: message.id,
      provider: "mock",
      provider_event_id: `evt_${local}_${receiptIndex + 1}`,
      status: message.status,
      received_at: isoHoursAgo(36 - receiptIndex * 2 - index),
      raw_payload: {
        seed_tag: seedConfig.seedTag,
        tenant: local,
        status: message.status
      }
    }));

  const calls = [
    {
      id: stableUuid(`call-${user.email}-1`),
      organization_id: orgId,
      application_id: supportAppId,
      to_number: contacts[2].phone,
      from_number: makeE164(baseNumber, 12),
      direction: "outbound",
      status: "completed",
      provider: "mock",
      provider_call_id: `call_${local}_1`,
      record: true,
      started_at: isoHoursAgo(30 + index),
      ended_at: isoHoursAgo(29.7 + index),
      duration_seconds: 780 + index * 60,
      metadata: { seed_tag: seedConfig.seedTag, tenant: local, queue: "support" }
    },
    {
      id: stableUuid(`call-${user.email}-2`),
      organization_id: orgId,
      application_id: supportAppId,
      to_number: contacts[4].phone,
      from_number: makeE164(baseNumber, 12),
      direction: "outbound",
      status: "completed",
      provider: "mock",
      provider_call_id: `call_${local}_2`,
      record: false,
      started_at: isoHoursAgo(24 + index),
      ended_at: isoHoursAgo(23.7 + index),
      duration_seconds: 1020 + index * 90,
      metadata: { seed_tag: seedConfig.seedTag, tenant: local, queue: "priority" }
    },
    {
      id: stableUuid(`call-${user.email}-3`),
      organization_id: orgId,
      application_id: supportAppId,
      to_number: contacts[7].phone,
      from_number: makeE164(baseNumber, 12),
      direction: "outbound",
      status: index % 2 === 0 ? "no-answer" : "failed",
      provider: "mock",
      provider_call_id: `call_${local}_3`,
      record: false,
      started_at: isoHoursAgo(18 + index),
      ended_at: isoHoursAgo(17.95 + index),
      duration_seconds: 0,
      metadata: { seed_tag: seedConfig.seedTag, tenant: local }
    },
    {
      id: stableUuid(`call-${user.email}-4`),
      organization_id: orgId,
      application_id: supportAppId,
      to_number: makeE164(baseNumber, 12),
      from_number: contacts[0].phone,
      direction: "inbound",
      status: "in-progress",
      provider: "mock",
      provider_call_id: `call_${local}_4`,
      record: true,
      started_at: isoHoursAgo(1.1 + index * 0.2),
      duration_seconds: 0,
      metadata: { seed_tag: seedConfig.seedTag, tenant: local, queue: "inbound" }
    }
  ];

  const cdrRows = calls
    .filter((call) => call.status === "completed")
    .map((call, cdrIndex) => ({
      id: stableUuid(`cdr-${user.email}-${cdrIndex}`),
      organization_id: orgId,
      call_id: call.id,
      billable_seconds: call.duration_seconds,
      billed_amount_usd: Number((call.duration_seconds / 60 * (0.015 + index * 0.0015)).toFixed(4)),
      sip_response_code: 200,
      from_carrier: "MockCarrier Voice",
      to_carrier: "MockCarrier Voice",
      raw_payload: { seed_tag: seedConfig.seedTag, tenant: local }
    }));

  const usageRows = [];
  for (let day = 0; day < 10; day += 1) {
    usageRows.push({
      id: stableUuid(`usage-sms-${user.email}-${day}`),
      organization_id: orgId,
      application_id: coreAppId,
      event_type: "sms.segment",
      unit_type: "segment",
      units: 250 + index * 90 + day * 16,
      amount_usd: Number(((250 + index * 90 + day * 16) * (0.0078 + index * 0.0006)).toFixed(6)),
      reference_type: "campaign",
      reference_id: campaignPrimaryId,
      occurred_at: isoDaysAgo(day),
      metadata: { seed_tag: seedConfig.seedTag, tenant: local }
    });
    usageRows.push({
      id: stableUuid(`usage-voice-${user.email}-${day}`),
      organization_id: orgId,
      application_id: supportAppId,
      event_type: "voice.minute",
      unit_type: "minute",
      units: 90 + index * 35 + day * 7,
      amount_usd: Number(((90 + index * 35 + day * 7) * (0.017 + index * 0.0012)).toFixed(6)),
      reference_type: "application",
      reference_id: supportAppId,
      occurred_at: isoDaysAgo(day),
      metadata: { seed_tag: seedConfig.seedTag, tenant: local }
    });
    usageRows.push({
      id: stableUuid(`usage-verify-${user.email}-${day}`),
      organization_id: orgId,
      application_id: coreAppId,
      event_type: "verify.check",
      unit_type: "attempt",
      units: 60 + index * 20 + day * 5,
      amount_usd: Number(((60 + index * 20 + day * 5) * (0.011 + index * 0.001)).toFixed(6)),
      reference_type: "template",
      reference_id: templateOtpId,
      occurred_at: isoDaysAgo(day),
      metadata: { seed_tag: seedConfig.seedTag, tenant: local }
    });
  }

  const templates = [
    {
      id: templatePromoId,
      organization_id: orgId,
      application_id: coreAppId,
      name: `${titleCaseSlug(local)}_Promo_FlashSale`,
      channel: "sms",
      body: "Hi {{first_name}}, exclusive offer ends tonight.",
      variables: ["first_name"],
      status: index % 3 === 1 ? "pending_approval" : "approved",
      approval_notes: index % 3 === 1 ? "Awaiting compliance sign-off" : "Approved for promotional traffic",
      approved_by: index % 3 === 1 ? null : user.id,
      approved_at: index % 3 === 1 ? null : isoDaysAgo(10 + index),
      metadata: { seed_tag: seedConfig.seedTag, tenant: local, category: "marketing" }
    },
    {
      id: templateIncidentId,
      organization_id: orgId,
      application_id: supportAppId,
      name: `${titleCaseSlug(local)}_Incident_Notice`,
      channel: "sms",
      body: "Service advisory: our team is actively investigating.",
      variables: [],
      status: index % 4 === 3 ? "rejected" : "approved",
      approval_notes: index % 4 === 3 ? "Contains unsupported claims" : "Approved for service notifications",
      approved_by: index % 4 === 3 ? null : user.id,
      approved_at: index % 4 === 3 ? null : isoDaysAgo(6 + index),
      metadata: { seed_tag: seedConfig.seedTag, tenant: local, category: "ops" }
    },
    {
      id: templateOtpId,
      organization_id: orgId,
      application_id: coreAppId,
      name: `${titleCaseSlug(local)}_Login_OTP`,
      channel: "sms",
      body: "Your verification code is {{code}}.",
      variables: ["code"],
      status: "approved",
      approval_notes: "Approved for auth",
      approved_by: user.id,
      approved_at: isoDaysAgo(4 + index),
      metadata: { seed_tag: seedConfig.seedTag, tenant: local, category: "verify" }
    }
  ];

  const campaigns = [
    {
      id: campaignPrimaryId,
      organization_id: orgId,
      application_id: coreAppId,
      template_id: templatePromoId,
      name: `${titleCaseSlug(local)} Spring Promotion`,
      status: "completed",
      segment_filter: { tags_any: ["vip", "retail"] },
      schedule_timezone: "America/Los_Angeles",
      scheduled_at: isoDaysAgo(2 + index),
      started_at: isoDaysAgo(2 + index),
      completed_at: isoDaysAgo(1 + index),
      total_recipients: contacts.length,
      sent_count: contacts.length - 1,
      failed_count: 1,
      metadata: { seed_tag: seedConfig.seedTag, tenant: local, owner: "growth" }
    },
    {
      id: campaignOpsId,
      organization_id: orgId,
      application_id: supportAppId,
      template_id: templateIncidentId,
      name: `${titleCaseSlug(local)} Incident Advisory`,
      status: index % 2 === 0 ? "running" : "scheduled",
      segment_filter: { tags_any: ["support"] },
      schedule_timezone: "UTC",
      scheduled_at: isoHoursAgo(4 + index),
      started_at: index % 2 === 0 ? isoHoursAgo(3 + index) : null,
      total_recipients: 6 + index,
      sent_count: index % 2 === 0 ? 4 + index : 0,
      failed_count: 0,
      metadata: { seed_tag: seedConfig.seedTag, tenant: local, owner: "ops" }
    }
  ];

  const webhooks = [
    {
      id: webhookId,
      organization_id: orgId,
      application_id: coreAppId,
      name: `${titleCaseSlug(local)} Event Sink`,
      url: `https://example.org/hooks/${local}`,
      subscribed_events:
        index % 2 === 0
          ? ["message.delivered", "message.failed", "call.started", "call.ended", "inbound.sms"]
          : ["message.delivered", "call.ended", "inbound.sms"],
      signing_secret: `whsec_${local}_demo`,
      is_active: true,
      timeout_ms: 5000,
      max_retries: 8,
      retry_backoff: "exponential",
      metadata: { seed_tag: seedConfig.seedTag, tenant: local }
    }
  ];

  const webhookAttempts = [
    {
      id: stableUuid(`wh-attempt-${user.email}-1`),
      organization_id: orgId,
      webhook_id: webhookId,
      event_type: "message.delivered",
      request_payload: { id: `msg_${local}_1`, status: "delivered", tenant: local },
      response_status: 200,
      response_body: "ok",
      success: true,
      retry_count: 0,
      attempted_at: isoHoursAgo(9 + index)
    },
    {
      id: stableUuid(`wh-attempt-${user.email}-2`),
      organization_id: orgId,
      webhook_id: webhookId,
      event_type: "message.failed",
      request_payload: { id: `msg_${local}_3`, status: "failed", tenant: local },
      response_status: index % 2 === 0 ? 503 : 429,
      response_body: "upstream timeout",
      success: false,
      retry_count: 1,
      attempted_at: isoHoursAgo(8.5 + index)
    },
    {
      id: stableUuid(`wh-attempt-${user.email}-3`),
      organization_id: orgId,
      webhook_id: webhookId,
      event_type: "message.failed",
      request_payload: { id: `msg_${local}_3`, status: "failed", tenant: local },
      response_status: 200,
      response_body: "ok",
      success: true,
      retry_count: 2,
      attempted_at: isoHoursAgo(8 + index)
    }
  ];

  const otpRows = [
    {
      id: stableUuid(`otp-${user.email}-1`),
      organization_id: orgId,
      application_id: coreAppId,
      to_number: contacts[0].phone,
      code_hash: createHash("sha256").update(`${317000 + index}`).digest("hex"),
      channel: "sms",
      status: "verified",
      expires_at: isoHoursAgo(6 + index),
      verified_at: isoHoursAgo(6.3 + index)
    },
    {
      id: stableUuid(`otp-${user.email}-2`),
      organization_id: orgId,
      application_id: coreAppId,
      to_number: contacts[3].phone,
      code_hash: createHash("sha256").update(`${428000 + index}`).digest("hex"),
      channel: "sms",
      status: "pending",
      expires_at: isoHoursAgo(-0.5 - index * 0.1)
    }
  ];

  const publicLead = {
    id: stableUuid(`lead-${user.email}`),
    lead_type: index % 2 === 0 ? "expert" : "trial",
    name: `${titleCaseSlug(local)} Contact`,
    email: `lead+${local}@example.com`,
    company: `${titleCaseSlug(local)} Corp`,
    use_case: "Omnichannel CPaaS rollout",
    message: `Interested in improving routing reliability for ${local}.`,
    source: "marketing"
  };

  const newsletter = {
    email: `newsletter+${local}@example.com`,
    source: "marketing"
  };

  return {
    local,
    orgId,
    orgSlug,
    orgName,
    coreAppId,
    supportAppId,
    webhookId,
    primaryApiKey,
    secondaryApiKey,
    primaryApiKeyHash,
    secondaryApiKeyHash,
    templatePromoId,
    templateIncidentId,
    templateOtpId,
    phoneNumbers,
    emergencyLocations,
    emergencyAssignments,
    sipEndpoints,
    webrtcSessions,
    apiQuotas,
    contacts,
    messages,
    deliveryReceipts,
    calls,
    cdrRows,
    usageRows,
    templates,
    campaigns,
    webhooks,
    webhookAttempts,
    otpRows,
    publicLead,
    newsletter
  };
}

function firstWord(value) {
  return String(value ?? "").split(" ")[0];
}

async function seedTenant(user, index) {
  const tenant = buildTenant(user, index);

  await upsertOne("users", {
    id: user.id,
    email: user.email,
    full_name: user.fullName
  });

  await upsertOne("organizations", {
    id: tenant.orgId,
    name: tenant.orgName,
    slug: tenant.orgSlug,
    created_by: user.id,
    settings: {
      seed_tag: seedConfig.seedTag,
      tenant: tenant.local,
      demo: true
    }
  });

  await upsertOne(
    "organization_members",
    {
      organization_id: tenant.orgId,
      user_id: user.id,
      role: "owner"
    },
    "organization_id,user_id"
  );

  await upsertMany("applications", [
    {
      id: tenant.coreAppId,
      organization_id: tenant.orgId,
      name: `${titleCaseSlug(tenant.local)} Core Messaging`,
      slug: "core-messaging",
      default_from_number: tenant.phoneNumbers[0].e164_number
    },
    {
      id: tenant.supportAppId,
      organization_id: tenant.orgId,
      name: `${titleCaseSlug(tenant.local)} Support Voice`,
      slug: "support-voice",
      default_from_number: tenant.phoneNumbers[1].e164_number
    }
  ]);

  await upsertMany(
    "api_keys",
    [
      {
        id: stableUuid(`apikey-primary-${user.email}`),
        organization_id: tenant.orgId,
        application_id: tenant.coreAppId,
        name: "Primary API key",
        key_hash: tenant.primaryApiKeyHash,
        last_four: tenant.primaryApiKey.slice(-4),
        scopes: ["*"],
        rate_limit_per_minute: 180 + index * 30,
        is_active: true,
        created_by: user.id,
        last_used_at: isoHoursAgo(index + 1)
      },
      {
        id: stableUuid(`apikey-secondary-${user.email}`),
        organization_id: tenant.orgId,
        application_id: tenant.supportAppId,
        name: "Support API key",
        key_hash: tenant.secondaryApiKeyHash,
        last_four: tenant.secondaryApiKey.slice(-4),
        scopes: ["voice:write", "usage:read"],
        rate_limit_per_minute: 120 + index * 20,
        is_active: index % 3 !== 2,
        created_by: user.id,
        last_used_at: isoHoursAgo(index + 5)
      }
    ],
    "key_hash"
  );

  await upsertMany(
    "oauth_clients",
    [
      {
        id: stableUuid(`oauth-core-${user.email}`),
        organization_id: tenant.orgId,
        application_id: tenant.coreAppId,
        client_id: `client_${tenant.local}_core`,
        client_secret: `secret_${tenant.local}_core_123`,
        default_scope: "messages:write messages:read usage:read",
        is_active: true
      },
      {
        id: stableUuid(`oauth-support-${user.email}`),
        organization_id: tenant.orgId,
        application_id: tenant.supportAppId,
        client_id: `client_${tenant.local}_support`,
        client_secret: `secret_${tenant.local}_support_123`,
        default_scope: "voice:write usage:read",
        is_active: true
      }
    ],
    "client_id"
  );

  await upsertMany("phone_numbers", tenant.phoneNumbers);
  await upsertMany("emergency_locations", tenant.emergencyLocations);
  await upsertMany("emergency_number_assignments", tenant.emergencyAssignments);
  await upsertMany("sip_endpoints", tenant.sipEndpoints);
  await upsertMany("webrtc_sessions", tenant.webrtcSessions);
  await upsertMany("api_quotas", tenant.apiQuotas);
  await upsertMany("templates", tenant.templates);
  await upsertMany("contacts", tenant.contacts);
  await upsertMany("campaigns", tenant.campaigns);
  await upsertMany("messages", tenant.messages);
  await upsertMany("delivery_receipts", tenant.deliveryReceipts);
  await upsertMany("calls", tenant.calls);
  await upsertMany("call_detail_records", tenant.cdrRows);
  await upsertMany("usage_records", tenant.usageRows);
  await upsertMany("webhooks", tenant.webhooks);
  await upsertMany("webhook_attempts", tenant.webhookAttempts);
  await upsertMany("otp_verifications", tenant.otpRows);
  await upsertMany("public_leads", [tenant.publicLead]);
  await upsertMany("public_newsletter", [tenant.newsletter], "email");

  await upsertOne(
    "billing_accounts",
    {
      organization_id: tenant.orgId,
      billing_email: `billing+${tenant.local}@nextgen.dev`,
      plan: index === 0 ? "enterprise" : index === 1 ? "growth" : "starter",
      status: "active",
      currency: "USD",
      balance_usd: Number((900 + index * 550 + 45.35).toFixed(4)),
      credit_limit_usd: 4000 + index * 1800,
      autopay_enabled: true,
      metadata: {
        seed_tag: seedConfig.seedTag,
        tenant: tenant.local
      }
    },
    "organization_id"
  );

  return tenant;
}

async function main() {
  const userSpecs = [
    { email: seedConfig.ownerEmail, password: seedConfig.ownerPassword, fullName: "Owner User", role: "owner" },
    { email: seedConfig.opsEmail, password: seedConfig.demoPassword, fullName: "Ops Manager", role: "admin" },
    { email: seedConfig.analystEmail, password: seedConfig.demoPassword, fullName: "Analytics Lead", role: "analyst" },
    { email: seedConfig.supportEmail, password: seedConfig.demoPassword, fullName: "Support Supervisor", role: "member" }
  ];

  const users = [];
  for (const spec of userSpecs) {
    users.push({ ...(await ensureAuthUser(spec)), role: spec.role, password: spec.password });
  }

  await upsertMany(
    "carriers",
    [
      { name: "MockCarrier SMS", country_code: "US", channel: "sms" },
      { name: "MockCarrier Voice", country_code: "US", channel: "voice" }
    ],
    "name,country_code,channel"
  );

  const tenants = [];
  for (let index = 0; index < users.length; index += 1) {
    tenants.push(await seedTenant(users[index], index));
  }

  console.log("Supabase seed completed with tenant-specific demo data.");
  console.log("Login users:");
  users.forEach((user) => {
    console.log(`- ${user.email} / ${user.password} (${user.role})`);
  });

  console.log("Tenant API keys:");
  tenants.forEach((tenant) => {
    console.log(`- ${tenant.orgSlug}: ${tenant.primaryApiKey}`);
    console.log(`- ${tenant.orgSlug}: ${tenant.secondaryApiKey}`);
  });
}

main().catch((error) => {
  console.error("Supabase seed failed.");
  console.error(error);
  process.exit(1);
});
