# Platform Architecture

## Overview

The Bunny at Home growth platform now spans five primary domains:

- **CRM**: Contacts, companies, deals, tasks, and activities managed through Prisma models and dashboard views.
- **CMS**: Collections, entries, media assets, and version history to power public content and course descriptions.
- **Education Commerce**: Courses, modules, pricing, checkout, orders, enrollments, entitlements, and enquiries.
- **Email**: Audiences, members, campaigns, automations, sends, and webhook ingestion with queue-based delivery.
- **AI Studio**: Prompt templates, queued generations, synchronous previews, and dashboard review tools.

All persistent data is consolidated in `prisma/schema.prisma` and surfaced via service modules under `src/server/modules`.

## Services & Routing

- **Service Layer**: Each domain exposes CRUD, workflow helpers, and validation logic. See `src/server/modules/{crm,cms,education,email,ai}`.
- **API Routes**: App Router handlers in `src/app/api/**` validate and orchestrate requests using the service layer, with rate limiting on AI preview endpoints.
- **Queues**: BullMQ queues (`email`, `automation`, `ai`, `fulfillment`) share a Redis connection defined in `src/server/jobs/queues.ts`. The worker (`src/server/jobs/worker.ts`) handles campaign sending, automation execution, AI generation fulfillment, and order entitlements.

## Dashboard Experience

- `src/app/dashboard/layout.tsx` defines shared navigation, glassmorphism UI, and high-level navigation.
- Feature screens are located in `src/app/dashboard/{crm,cms,education,email,ai}` with supporting client components in `src/components/dashboard/**`.
- AI-assisted actions are embedded in the email campaign form and AI Studio tooling.

## Environment & Infrastructure

- `.env.example` outlines required secrets: Postgres, Redis, Supabase storage, Stripe, and OpenAI.
- `next.config.mjs` validates critical environment variables during production builds, unless `SKIP_ENV_VALIDATION` is set.
- Redis powers queues and rate limiting (upgrade recommended for distributed deployments).
- Stripe handles payment orchestration via checkout session creation and webhook fulfillment (`/api/education/fulfillment`).

## Security & Compliance Considerations

- API preview endpoint (`/api/ai/preview`) ships with an in-memory rate limiter. For production, swap to a durable store (e.g., Redis with fixed window or token bucket) and add auth guards.
- Dashboard routes currently rely on implicit trust. Integrate an auth provider (NextAuth, Clerk, etc.) or implement middleware to constrain access.
- Ensure Stripe webhooks validate signatures before calling `handleCheckoutFulfillment`.
- Audit logging stubs exist via Prisma relations (`AutomationEvent`, `PaymentEvent`). Expand to capture user context per request.

## Testing

- Vitest configuration (`vitest.config.ts`) enables lightweight schema and rate-limit tests located in `tests/**`.
- Extend coverage with service-level tests (mocking Prisma) and Playwright flows once UI states stabilise.

