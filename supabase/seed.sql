insert into organizations (id, name, slug, created_by)
values
  ('22222222-2222-2222-2222-222222222222', 'NextGen Communications', 'nextgen-comms', null)
on conflict (id) do nothing;

insert into applications (id, organization_id, name, slug, default_from_number)
values
  ('33333333-3333-3333-3333-333333333333', '22222222-2222-2222-2222-222222222222', 'Retail Alerts', 'retail-alerts', '+14155550111')
on conflict (id) do nothing;

insert into api_keys (organization_id, application_id, name, key_hash, last_four, scopes, rate_limit_per_minute)
values (
  '22222222-2222-2222-2222-222222222222',
  '33333333-3333-3333-3333-333333333333',
  'Default SDK key',
  encode(digest('sk_test_nextgen_1234567890', 'sha256'), 'hex'),
  '7890',
  array['*'],
  300
)
on conflict (key_hash) do nothing;

insert into oauth_clients (organization_id, application_id, client_id, client_secret, default_scope)
values (
  '22222222-2222-2222-2222-222222222222',
  '33333333-3333-3333-3333-333333333333',
  'client_dev_nextgen',
  'secret_dev_nextgen_123456',
  'messages:write messages:read voice:write usage:read'
)
on conflict (client_id) do nothing;

insert into carriers (name, country_code, channel)
values
  ('MockCarrier SMS', 'US', 'sms'),
  ('MockCarrier Voice', 'US', 'voice')
on conflict (name, country_code, channel) do nothing;

insert into webhooks (organization_id, application_id, name, url, subscribed_events, signing_secret)
values
  (
    '22222222-2222-2222-2222-222222222222',
    '33333333-3333-3333-3333-333333333333',
    'Primary Event Sink',
    'https://example.org/webhooks/cpaas',
    array['message.delivered','message.failed','call.started','call.ended','inbound.sms'],
    'whsec_dev_nextgen'
  )
on conflict do nothing;

insert into billing_accounts (organization_id, billing_email, plan, balance_usd)
values ('22222222-2222-2222-2222-222222222222', 'billing@nextgen.dev', 'growth', 120.00)
on conflict (organization_id) do nothing;
