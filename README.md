Lorraine Hawkins / Trichology Platform (Next.js + Prisma + Supabase + BullMQ)

## Local setup (macOS)

### Prereqs

- Node.js 18+
- A Postgres database (local Docker is easiest)
- Redis (required for queues: AI generation, automations, etc.)

### Option A (recommended): Docker Desktop

1. Install Docker Desktop for Mac.
2. Start Postgres + Redis:

```bash
cd /Users/ant/Documents/LorraineHawkin/trichology
docker compose up -d
```

### Option B: Homebrew services

```bash
brew install redis
brew services start redis
redis-cli ping  # should print PONG
```

For Postgres you can either use Docker just for Postgres:

```bash
cd /Users/ant/Documents/LorraineHawkin/trichology
docker compose up -d postgres
```

### Environment

Copy the template env file:

```bash
cd /Users/ant/Documents/LorraineHawkin/trichology
cp env.local.template .env.local
```

Make sure these are correct for your machine:
- `DATABASE_URL` (Postgres)
- `REDIS_URL` (Redis, default: `redis://localhost:6379`)

### Install + DB setup

```bash
cd /Users/ant/Documents/LorraineHawkin/trichology
npm install
npm run prisma:generate
npm run prisma:migrate
```

### Run the app (2 terminals)

Terminal A (Next.js):

```bash
npm run dev
```

Terminal B (BullMQ worker — required for Regenerate / AI jobs):

```bash
npm run worker
```

Open `http://localhost:3000`.

## Why Redis if we use Supabase?

Supabase is used for **database/storage**, but Redis is used for **background job queues** (BullMQ). The app queues AI jobs immediately, and the worker consumes them from Redis and writes results back to Postgres.

## More docs

See `docs/platform/runbook.md` and `docs/platform/content-factory.md`.
