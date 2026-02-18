# Content Factory Runbook

## Overview

The Content Factory stitches together the AI Studio, the new `ContentPlan`/`ContentSlot` models, and the dashboard calendar. It lets the team brief multi-channel drops, auto-generate copy + hero visuals, review drafts, and export approved rows to external schedulers (Make, Buffer, etc.).

## Data Model

- `ContentPlan`: Named campaigns with time windows, tags, and owners. Every slot can belong to a plan, but ad-hoc drops work too.
- `ContentSlot`: The single source of truth for each scheduled deliverable. Tracks channel, persona, brief, `scheduledFor`, `publishedAt`, status, and metadata (channels, tone, goals).
- `ContentAsset`: Links an AI `GeneratedContent` row to the slot. Stores prompt metadata and any uploaded/rendered media.
- `AssetVariant`: Platform-ready fragments (headline, caption, CTA, hashtags) that reviewers approve before export.
- Status enums drive the Kanban + automation: `ContentSlotStatus` (Draft → Needs Review → Approved → Scheduled → Published) and `AssetVariantStatus`.

## Generation Flow

1. **Creation Wizard (`/dashboard/content`)**
   - Collects plan, persona, campaign, channels, goals, tone, schedule, and prompt.
   - Calls `POST /api/content/generate`, which creates/updates the slot and queues a `mode: "content-factory"` generation job.
2. **Worker (`runGeneration`)**
   - Forces a JSON response (copy variants + optional image prompts).
   - Persists variants as `AssetVariant` rows, attaches image assets when `includeImages` is true, and moves the slot to `NEEDS_REVIEW`.
3. **Kanban & Calendar**
   - Reviewers drag slots between statuses (`PATCH /api/content/slots/status`).
   - Drag & drop calendar reschedules via `POST /api/content/slots/reschedule`.
4. **Export + Publish feedback**
   - Approved/Scheduled slots stream out through `GET /api/content/export`.
   - External schedulers call `POST /api/content/hooks/publish` to mark final delivery times.

## API Surface

| Endpoint | Method | Purpose |
| --- | --- | --- |
| `/api/content/generate` | `POST` | Create/queue a slot with AI brief |
| `/api/content/slots/reschedule` | `POST` | Move slot to a new `scheduledFor` |
| `/api/content/slots/status` | `PATCH` | Update approval state |
| `/api/content/export` | `GET` | Export approved/scheduled slots for Make/Buffer |
| `/api/content/hooks/publish` | `POST` | Webhook to mark slots as published |

### Example payloads

```json
// POST /api/content/generate
{
  "planId": "clp...",
  "title": "Detox intensive teaser",
  "persona": "Salon owners",
  "campaign": "Autumn Detox Sprint",
  "channels": ["INSTAGRAM", "LINKEDIN"],
  "tone": ["warm", "evidence-based"],
  "goals": ["Drive consult bookings"],
  "includeImages": true,
  "prompt": "Craft a carousel + caption promoting the scalp detox intensive.",
  "scheduledFor": "2025-12-05T15:00:00.000Z"
}
```

```json
// POST /api/content/slots/reschedule
{
  "slotId": "cls...",
  "scheduledFor": "2025-12-07T10:00:00.000Z"
}
```

```json
// GET /api/content/export?status=APPROVED&status=SCHEDULED&channel=INSTAGRAM
{
  "slots": [
    {
      "id": "cls...",
      "status": "APPROVED",
      "channel": "INSTAGRAM",
      "scheduledFor": "2025-12-07T10:00:00.000Z",
      "plan": "Autumn Detox Sprint",
      "assets": [
        {
          "id": "cla...",
          "type": "COPY",
          "variants": [
            {
              "id": "clv...",
              "platform": "INSTAGRAM",
              "headline": "3 micro-rituals for flawless scalps",
              "copy": "Caption text...",
              "cta": "Book the detox intensive"
            }
          ]
        }
      ]
    }
  ]
}
```

```json
// POST /api/content/hooks/publish
{
  "slotId": "cls...",
  "externalId": "make-run-123",
  "publishedAt": "2025-12-07T10:05:00.000Z",
  "notes": "Auto-posted via Make scenario 42"
}
```

## Environment & Ops

- `OPENAI_API_KEY`: already required for copy generation.
- `OPENAI_IMAGE_MODEL`: model to use for hero renders (defaults to `gpt-image-1` if unset).
- `SUPABASE_BUCKET_CONTENT`: optional bucket for persisting rendered images long term.
- Background worker must run (`pnpm ts-node src/server/jobs/worker.ts`) so the AI queue can hydrate slots.

> Note: `.env.example` is managed outside this workspace, so add the two new variables there manually.

## Make / Scheduler Integration

1. Poll `GET /api/content/export?status=APPROVED&status=SCHEDULED` for ready slots.
2. Map variants → platform-specific modules in Make (or Buffer bulk API).
3. After successful publish, POST to `/api/content/hooks/publish` so the calendar flips to `PUBLISHED`.

This keeps the Lorraine Hawkins operations dashboard authoritative, while external schedulers handle the vendor APIs.

