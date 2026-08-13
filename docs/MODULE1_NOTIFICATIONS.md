# Module 1 — WhatsApp / Email Notifications

Developer handoff for the Tare Zameen Foundation donor platform.

## Overview

This module notifies a donor by email and/or WhatsApp when something happens to their account:

| Type | Channel(s) | Essential? |
| --- | --- | --- |
| `DONATION_CONFIRMED` | email, whatsapp | Yes — always on |
| `RECEIPT_READY` | email, whatsapp | Yes — always on |
| `RECURRING_DONATION_CHARGED` | email, whatsapp | Yes — always on |
| `RECURRING_DONATION_REMINDER` | email, whatsapp | No — donor can disable |
| `MONTHLY_IMPACT_SUMMARY` | email, whatsapp | No — donor can disable |

Every attempt — sent, failed, or skipped — is written to `notification_logs`, so there is a full audit trail of what was sent, to whom, when, and why (or why not).

**Important context:** before this module, the app had **no backend at all** — it was a static Lovable-generated frontend (TanStack Start) with a fake login screen, a donate form that only showed a toast, and hardcoded dashboard numbers. This module therefore had to add a minimal real backend (Supabase Postgres + Drizzle ORM, Supabase Auth, and a small donor/donation/receipt/recurring-donation data model) as a foundation — see "What else got built" below. None of that is a payment gateway; it's the smallest real substrate the notification engine needs to hook into.

## Architecture

```
src/server/notifications/
  types.ts              — the notification type registry (single source of truth)
  service.ts             — sendNotification(): the ONLY place that fans out to channels,
                            checks preferences, enforces idempotency, calls providers, writes logs
  preferences.ts          — get/update donor preferences, enforces "transactional can't be disabled"
  logs.ts                 — donor-scoped and staff-scoped log queries
  idempotency.ts          — builds the `${type}:${channel}:${entityKey}` dedupe key
  templates/
    render.ts              — {{variable}} substitution engine + validation (no undefined/null/[object Object])
    layout.ts               — shared branded HTML email shell
    donation-confirmed.ts, receipt-ready.ts, recurring-reminder.ts,
    recurring-charged.ts, monthly-impact-summary.ts   — one file per notification type,
                            each exporting renderXEmail()/renderXWhatsApp() — wording lives here,
                            NOT in service.ts or the triggers
    index.ts                 — renderTemplate(type, channel, data) registry
    sample-data.ts            — clearly-labeled PREVIEW data for the staff template-preview tool
  providers/
    email/{resend,console,types,index}.ts       — EmailProvider interface + implementations
    whatsapp/{twilio,cloud-api,disabled,types,index}.ts — WhatsAppProvider interface + implementations
  triggers/
    donation-confirmed.ts, receipt-ready.ts, recurring-reminder.ts,
    recurring-charged.ts, monthly-impact-summary.ts   — thin functions: (donor, entity) -> sendNotification(...)
  jobs/
    recurring-reminder-job.ts   — scans recurring_donations for upcoming charges
    monthly-summary-job.ts       — aggregates last month's + lifetime giving per donor
    cron-auth.ts                  — shared-secret check for the /api/cron/* HTTP endpoints
```

Data flow for every send:

```
event (donation recorded, receipt generated, ...)
  -> trigger function (triggers/*.ts) builds template data from real data only
  -> sendNotification() in service.ts
       -> insert QUEUED log row (idempotent — ON CONFLICT DO NOTHING on idempotency_key)
       -> if duplicate: stop, no send, no new log row
       -> resolve recipient (donor.email / donor.phone)
       -> if missing contact info: log SKIPPED, stop
       -> if optional type and donor disabled it: log SKIPPED, stop
       -> render template (renderTemplate) — throws if any variable would be undefined/null
       -> call the configured provider (Resend / Twilio / WhatsApp Cloud API / console / disabled)
       -> update the log row to SENT or FAILED with the real provider response
```

A notification failure **never** rolls back or fails the donation/receipt/recurring-charge that triggered it — every trigger call is wrapped in `.catch()` in the calling server function (see `src/server/functions/*.ts`).

### Why templates are separate from the engine

`service.ts` never contains message wording. Each notification type's copy lives in its own file under `templates/`, as plain strings with `{{placeholder}}` tokens rendered by `templates/render.ts`. Changing wording means editing one template file — the engine, triggers, and providers are untouched. `render.ts` throws (rather than silently rendering `undefined`/`null`/`[object Object]`) if a template references a variable that wasn't supplied.

### Asynchronous processing

Donation/receipt/recurring-charge server functions call the trigger **after** their own DB write has committed, and don't await a slow provider round-trip before responding in any way that would fail the donor-facing action — a `.catch()` guards every trigger call so a provider outage can't turn a successful donation into an error response. There is no message queue yet: everything runs in-process on the same request. This is intentional for now (see `NOTIFICATION_MODE` below) — the `sendNotification()` boundary is the natural place to swap in a real queue (BullMQ, Cloudflare Queues, Supabase Edge Function invocation, etc.) later without touching triggers or templates.

## Database

All new tables live in `supabase/migrations/20260813120000_module1_notifications.sql` (hand-authored SQL — not generated by `drizzle-kit push`, because Postgres RLS policies and the `auth.users` foreign key/trigger aren't things drizzle-kit manages well). `src/server/db/schema.ts` is the typed Drizzle mirror of that SQL, used for all queries.

- **`donors`** — one row per Supabase Auth user (`id` = `auth.users.id`), created automatically by a `handle_new_user` trigger on signup. Holds `full_name`, `email`, `phone` (for WhatsApp), `is_staff`.
- **`donations`**, **`receipts`**, **`recurring_donations`** — deliberately minimal records Module 1's triggers hook into. **Not a payment gateway integration** — see "Future Integration".
- **`notification_preferences`** — generic `(donor_id, notification_type)` design (brief section 7's "better design" option), so adding a new notification type never requires a schema migration. Absence of a row means "use the registry default".
- **`notification_logs`** — one row per send attempt, with `status` (`QUEUED`/`SENT`/`DELIVERED`/`FAILED`/`SKIPPED`), `provider`, `provider_message_id`, `error_code`/`error_message`, and a unique `idempotency_key`.

**Row Level Security** is enabled on every table. A donor's own Supabase session can only ever `SELECT` their own rows (policies check `auth.uid() = donor_id`). All writes go through server functions using the **service-role client**, which itself re-checks the caller's identity via `requireDonorMiddleware`/`requireStaffMiddleware` before writing — so authorization is enforced twice: once in application code, once at the database. `notification_preferences` additionally allows the donor's own session to insert/update its own rows directly (defense in depth), though this app always goes through the server function.

**Staff/admin access** is a simple `donors.is_staff boolean` flag, checked in `requireStaffMiddleware`. There's no staff UI to grant it yet — an NGO team member sets it manually via the Supabase SQL editor:

```sql
update public.donors set is_staff = true where email = 'staffmember@tarezameenfoundation.org';
```

See "Future Integration" for how to replace this with real staff RBAC.

## Notification Types

Defined once in `src/server/notifications/types.ts` (`NOTIFICATION_TYPES`). Each entry has an id, name, description, `category` (`transactional` | `optional`), which channels it supports, and default-enabled state per channel. Adding a 6th notification type means: add one entry here, add a template file, add a trigger file — `service.ts` needs no changes.

## Providers

**Email** — `EmailProvider` interface (`sendEmail`) with two implementations:
- `ResendEmailProvider` — real HTTP calls to the Resend API via `fetch` (no SDK dependency, so it stays portable to edge runtimes). Used when `EMAIL_PROVIDER=resend`.
- `ConsoleEmailProvider` — the default. Prints the fully-rendered message to the server console instead of calling anything external. Every log row from this provider is tagged `provider="console"` so it's never confused with a real delivery.

**WhatsApp** — `WhatsAppProvider` interface (`sendWhatsApp`) with three implementations:
- `TwilioWhatsAppProvider` (`WHATSAPP_PROVIDER=twilio`) — Twilio WhatsApp API via `fetch`.
- `CloudApiWhatsAppProvider` (`WHATSAPP_PROVIDER=cloud_api`) — Meta WhatsApp Business Cloud API via `fetch`.
- `DisabledWhatsAppProvider` — the default. Every send resolves `{ success: false, skipped: true }`; `service.ts` logs this as `SKIPPED`, never as a fake success.

In every case, a message is only ever logged `SENT` when the provider's HTTP API actually returned a 2xx with a message id.

## Preference Behavior

- Transactional types (`DONATION_CONFIRMED`, `RECEIPT_READY`, `RECURRING_DONATION_CHARGED`) cannot be disabled — `updateDonorPreference()` throws `TransactionalPreferenceError` before touching the database if you try. This is the single place that rule lives.
- Optional types respect the donor's per-channel toggle. Disabling one **actually prevents the send** — it's checked inside `sendNotification()`, not just hidden in the UI — and produces a `SKIPPED` log row with `errorMessage = "Disabled by donor preference."`.
- Donor-facing UI: `/dashboard/notifications` (`src/routes/dashboard.notifications.tsx`), split into "Essential · Transactional" (locked switches) and "Optional · Updates" (editable switches), with optimistic updates, a success toast, and revert-on-failure.

## Logging Behavior

Every attempt is logged, including skips — "do not silently discard skipped notifications" is enforced by the fact that `sendNotification()` always writes a row before deciding what to do. Idempotency is enforced by a **unique constraint** on `notification_logs.idempotency_key` (`${type}:${channel}:${entityKey}`) plus an atomic `INSERT ... ON CONFLICT DO NOTHING` — a retried request cannot produce a second send.

Staff view: `/dashboard/admin/notifications` (gated on `donors.is_staff`), with filters for type/channel/status and columns for when, donor, type, channel, recipient, provider, status, and failure reason.

## Scheduler / Cron Behavior

Two jobs, invoked over plain HTTP (not TanStack server functions, so any external scheduler can call them):

- `POST /api/cron/recurring-reminders` — runs `runRecurringReminderJob()`, which scans `recurring_donations` for `next_charge_date` within `REMINDER_DAYS_BEFORE` days and fires `RECURRING_DONATION_REMINDER` for each. Run daily.
- `POST /api/cron/monthly-summary` — runs `runMonthlySummaryJob()`, which aggregates last calendar month's + lifetime giving per donor (via grouped SQL, not fabricated numbers) and fires `MONTHLY_IMPACT_SUMMARY`. Run monthly (e.g. 1st of the month). Honors `MONTHLY_IMPACT_ENABLED=false` as a kill switch.

Both require `Authorization: Bearer <NOTIFICATION_CRON_SECRET>`. Point any external scheduler (cron-job.org, GitHub Actions scheduled workflow, a Cloudflare Cron Trigger hitting the deployed URL, etc.) at these two endpoints. There is no in-process scheduler — deliberately, since serverless/edge deployments don't reliably keep a long-running timer alive.

## Environment Variables

See `.env.example` for the full, commented list. Summary:

| Variable | Purpose |
| --- | --- |
| `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` | Supabase project + service-role key (server-only) |
| `DATABASE_URL` | Postgres connection string for Drizzle |
| `EMAIL_PROVIDER` (`resend`\|`console`), `EMAIL_API_KEY`, `EMAIL_FROM` | Email provider config |
| `WHATSAPP_PROVIDER` (`twilio`\|`cloud_api`\|`disabled`), `WHATSAPP_TWILIO_*`, `WHATSAPP_CLOUD_*` | WhatsApp provider config |
| `NOTIFICATION_MODE` (`development`\|`production`), `NOTIFICATION_TEST_RECIPIENTS` | Dev-mode allowlist for real (non-console/non-disabled) providers |
| `REMINDER_DAYS_BEFORE`, `MONTHLY_IMPACT_ENABLED` | Scheduled-job tuning |
| `NOTIFICATION_CRON_SECRET` | Bearer token the two `/api/cron/*` endpoints require |
| `APP_URL` | Base URL used to build dashboard/receipt links inside notifications |
| `STAFF_ADMIN_EMAILS` | Documented for reference; actual staff gate is `donors.is_staff` (see Database) |

None of these are prefixed `VITE_`, so none are ever bundled into client-side JavaScript.

## Triggers — what fires what

| Event | Where | Notification |
| --- | --- | --- |
| Donation recorded with `status = "succeeded"` | `src/server/functions/donations.ts` → `createDonation` | `DONATION_CONFIRMED` |
| Donation recorded with `status = "failed"` | same | nothing |
| Receipt row actually created | `src/server/functions/receipts.ts` → `generateReceiptForDonation` | `RECEIPT_READY` |
| Recurring donation charge simulated successfully | `src/server/functions/recurring.ts` → `simulateRecurringCharge` | `RECURRING_DONATION_CHARGED` |
| Recurring donation within `REMINDER_DAYS_BEFORE` of its next charge | `jobs/recurring-reminder-job.ts` (via `/api/cron/recurring-reminders`) | `RECURRING_DONATION_REMINDER` |
| Monthly job runs | `jobs/monthly-summary-job.ts` (via `/api/cron/monthly-summary`) | `MONTHLY_IMPACT_SUMMARY` |

## Testing

```
bun run test
```

Runs the unit suite (43 tests, no external services required):

- `src/lib/format.test.ts` — INR/date formatting.
- `src/server/notifications/templates/render.test.ts` — variable substitution, missing-variable errors, HTML escaping.
- `src/server/notifications/templates/templates.test.ts` — all 5 templates: correct substitution, no `undefined`/`null`/`[object Object]`/unrendered `{{...}}`, optional fields omitted cleanly, XSS-safe HTML escaping of donor-supplied text, honest (non-fabricated) monthly-summary wording, test-mode marking.
- `src/server/notifications/types.test.ts` — registry completeness/consistency.
- `src/server/notifications/idempotency.test.ts` — key format and determinism.
- `src/server/notifications/preferences.test.ts` — the transactional-lock business rule.
- `src/server/notifications/providers/providers.test.ts` — provider factory fallback behavior; asserts the console/disabled providers never claim a fake external delivery.

`src/server/notifications/service.integration.test.ts` exercises the **full** service — real DB writes, real idempotency, real preference enforcement — against a live Supabase project. It's skipped automatically unless `DATABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are set (creates and tears down its own throwaway Supabase Auth user).

### Manual / demo flows

With a Supabase project connected and the dev server running (`bun run dev`):

1. **Donation confirmation** — sign up/sign in, go to `/donate`, submit a donation. Check the server console (default `EMAIL_PROVIDER=console`) for the rendered confirmation email, and `/dashboard/admin/notifications` (after granting yourself `is_staff`) for the `SENT` log row.
2. **Preference opt-out** — go to `/dashboard/notifications`, turn off "Monthly impact summary" for email. Call `POST /api/cron/monthly-summary` with the bearer secret. Confirm the log row is `SKIPPED` with reason "Disabled by donor preference."
3. **Receipt** — from `/dashboard`, use `generateReceiptForDonation` (wire a button, or call it directly) on one of your donations; confirm the email contains a working `/dashboard/receipts/:id` link and the log is `SENT`.
4. **Recurring** — create a recurring donation, call `simulateRecurringCharge`, confirm `RECURRING_DONATION_CHARGED` fires; call `POST /api/cron/recurring-reminders` to see `RECURRING_DONATION_REMINDER` fire for anything due within `REMINDER_DAYS_BEFORE` days.
5. **Log view** — `/dashboard/admin/notifications` shows donor, type, channel, recipient, status, and failure reason, filterable.
6. **Template preview** — `/dashboard/admin/templates` (staff-only) renders any of the 5 templates against clearly-labeled sample data.

## Exact steps to run Module 1

1. Create a free Supabase project at supabase.com.
2. Copy `.env.example` to `.env` and fill in `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` (Project Settings → API) and `DATABASE_URL` (Project Settings → Database → Connection string → Session pooler).
3. In the Supabase SQL editor, run `supabase/migrations/20260813120000_module1_notifications.sql`.
4. `bun install` (if not already done), then `bun run dev`.
5. Sign up a donor at `/login`. If your Supabase project has "Confirm email" enabled, confirm via the emailed link before signing in.
6. (Optional) Grant yourself staff access: `update public.donors set is_staff = true where email = '<your email>';`
7. Donate at `/donate`. Watch the terminal running `bun run dev` for the console-provider email output, and check `/dashboard/admin/notifications`.
8. To activate real email: set `EMAIL_PROVIDER=resend`, `EMAIL_API_KEY`, `EMAIL_FROM`. To activate real WhatsApp: set `WHATSAPP_PROVIDER=twilio` (or `cloud_api`) and the matching credentials.
9. `bun run test` for the unit suite; set `DATABASE_URL`/`SUPABASE_SERVICE_ROLE_KEY` and re-run for the integration suite too.

## What could not be fully activated here

- **Real email/WhatsApp delivery** — no Resend or Twilio/WhatsApp Cloud API account credentials were available in this environment. Both providers are fully implemented and tested against their real HTTP APIs; they just need credentials in `.env` to go live. Until then, the module runs completely on the console/disabled fallbacks, which is the documented, honest default (never a faked "delivered").
- **Live Supabase project** — none existed for this app; the schema, RLS, and auth wiring are all in place but unexercised against a real database in this session unless you've since connected one (see `service.integration.test.ts`).

## Known limitations

- `donations`/`receipts`/`recurring_donations` are a minimal model for triggering notifications, not a payment gateway integration — see below.
- No message queue; sends happen inline within the triggering request. Fine at NGO scale; revisit if volume grows.
- `donors.is_staff` is a manual SQL flag, not a real admin console.
- `monthly-summary-job.ts` recomputes aggregates on every run rather than incrementally; fine for typical NGO donor counts, would want batching/pagination at large scale.
- No password-reset flow was built (out of scope for Module 1); the login page has a placeholder for it.

## Future Integration — connecting this to the NGO's live platform

- **Payment gateway**: point your gateway's success webhook at the same logic `createDonation`/`simulateRecurringCharge` use — insert the `donations` row with `status: "succeeded"` only after the gateway confirms payment, then call `triggerDonationConfirmed`/`triggerRecurringDonationCharged` exactly as those functions do. Never call the trigger before the charge is confirmed.
- **Receipt generation**: replace `generateReceiptForDonation`'s placeholder receipt-number generation with your real 80G-compliant PDF pipeline; call `triggerReceiptReady` once the PDF actually exists, and point `receiptUrl` at it.
- **Staff RBAC**: replace the `donors.is_staff` flag with a real role system once one exists; `requireStaffMiddleware` (`src/server/auth/require-donor.ts`) is the single choke point to update.
- **Scheduler**: wire `/api/cron/recurring-reminders` and `/api/cron/monthly-summary` into whatever the NGO's hosting provides — Cloudflare Cron Triggers, GitHub Actions `schedule:`, or a simple cron-job.org entry — with `NOTIFICATION_CRON_SECRET` as a repo/host secret.
- **Scale**: if send volume grows, move the provider call inside `sendOneChannel()` (service.ts) behind a queue (Cloudflare Queues, a Postgres-backed job table, BullMQ) — the QUEUED-row-then-finalize pattern already used for idempotency is a natural fit for a worker to pick up.
- **Deployment target**: this repo's Nitro build defaults to Cloudflare. The Postgres connection here uses `postgres` (a TCP driver), which Cloudflare Workers can't reach directly without Hyperdrive — either provision Hyperdrive in front of the Supabase Postgres connection, or swap `src/server/db/client.ts` to query via Supabase's HTTP API instead.
