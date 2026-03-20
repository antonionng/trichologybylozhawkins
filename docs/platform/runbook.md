# Operations Runbook

## Local Development

1. Duplicate `.env.example` to `.env.local` and populate credentials:
   - `DATABASE_URL` to Supabase Postgres (or local Postgres)
   - `REDIS_URL` for BullMQ queues
   - `STRIPE_SECRET_KEY` & `STRIPE_WEBHOOK_SECRET`
   - `DEV_SKIP_CHECKOUT=false`
   - `RESEND_API_KEY` & `RESEND_FROM_EMAIL`
   - `SHOP_ADMIN_NOTIFY_EMAILS` for comma-separated shop order alerts
   - `OPENAI_API_KEY`
   - `SUPABASE_*` for secure media delivery
2. Install dependencies and generate Prisma client:
   ```bash
   npm install
   npm run prisma:generate
   npm run env:check
   npm run dev
   ```
   
   Tip: for local Postgres + Redis, you can use the included Docker compose file:
   ```bash
   docker compose -f docker-compose.yml up -d
   ```
   And use `env.local.template` as a starting point for `.env.local`.
3. Optionally run queues with a separate Node process executing `ts-node src/server/jobs/worker.ts` or compile via `ts-node/register`.

## Seeding / Fixtures

- **Quiz card images (non-destructive):** Published quizzes with no `cardImageUrl` and no `heroMediaId` can get default Unsplash URLs in rotation:
  ```bash
  DRY_RUN=1 npm run backfill:quiz-images   # preview
  npm run backfill:quiz-images             # apply (uses DATABASE_URL from `.env`)
  ```
- Use Prisma Studio (`npx prisma studio`) for ad-hoc seeding.
- Minimal APIs exist for:
  - `POST /api/crm/contacts`
  - `POST /api/cms/collections`
  - `POST /api/education/courses`
  - `POST /api/email/audiences`
  - `POST /api/ai/templates`
- Adjust payloads per schemas in `src/server/schema/**`.

## Background Worker

- The worker relies on Redis. Ensure `REDIS_URL` points to a reachable instance.
- Queues:
  - `email`: sends campaigns synchronously (stubbed for now).
  - `automation`: processes automation steps sequentially.
  - `ai`: executes OpenAI generations and updates Prisma.
  - `fulfillment`: finalises checkout orders and entitlements.
- If deploying to serverless, run the worker as a separate long-lived process (e.g., Vercel background functions, Fly.io, or container workloads).

## Stripe Integration

- Checkout sessions are created through `POST /api/education/checkout`.
- Configure Stripe webhook to `POST /api/stripe/webhook`.
- Fulfillment handler updates order status and enrolments; extend to grant download entitlements as needed.

## Email Providers

- Campaign sending uses Resend from the `email` worker queue. Ensure `RESEND_API_KEY` is configured.
- Webhook ingestion expects JSON payloads with `event` and `email`. Map provider payloads accordingly.

## AI Usage

- `POST /api/ai/preview` offers synchronous generation with rate limiting.
- Batch jobs go through `/api/ai/generate` and complete via the `ai` queue.
- Update model selection or prompts in `executeTemplatePreview` and `runGeneration`.

## Monitoring

- Extend the worker to emit metrics (e.g., to OpenTelemetry exporters).
- Capture queue health stats via BullMQ UI or custom dashboards.
- Log API errors and security events (rate limits, failed webhook validation).

## Testing & QA

- Run schema/unit tests with `npm test`.
- Lint with `npm run lint` (set `SKIP_ENV_VALIDATION=true` when env not present).
- Add integration and Playwright tests before automating deployments.

## Launch Preflight Checklist

- `npm run env:check` passes in the deploy environment.
- Stripe webhook endpoint `/api/stripe/webhook` is configured and verified.
- Redis is reachable and the worker process is running.
- Resend API key and sender identity are configured and a test campaign is delivered.
- Admin smoke flows pass: create/edit course, workshop, video, campaign, automation, CRM updates.
- User smoke flows pass: sign in, checkout, webhook fulfillment, academy access, quiz submission.

