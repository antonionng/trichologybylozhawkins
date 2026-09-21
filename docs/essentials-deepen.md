# Salon Trichology Essentials — deepen runbook

Deepen the **existing** published course `salon-trichology-essentials` only. Do **not** add course or video SKUs. TEST Live Course/Product A/B stay unpublished.

**Deploy target:** Vercel project **trichology** (Academy / trichologyacademy.co.uk). Not experrt / aiadop.

Pay-first checkout is unchanged. Learners still buy the existing Essentials SKU, then watch attached lesson media inside `/academy`.

**Content source of truth:** `content/essentials/` (Marketing pack: README, VO scripts, chair-checks, one-pagers).

## Learner path (once content is attached)

1. Enrolled learner opens a lesson. If `CourseLesson.videoUrl` is set, the full-width player signs that **storage path** and plays the voice-over (no face required).
2. After the **last lesson** of a module, if a **PUBLISHED** quiz exists with that `moduleId`, LessonGate shows the chair-check and blocks the next module until they pass.
3. If the last lesson has a `downloadableId`, the chair-side one-pager download CTA appears.

Chair-check upserts stay **DRAFT** by default. They will not appear in the learner UI until someone publishes them in admin.

## Storage path convention (`lesson.videoUrl`)

Prefer slug-based paths so ElevenLabs files can land without knowing Prisma IDs:

```
courses/salon-trichology-essentials/lessons/<lesson-slug>/vo.mp4
```

| Lesson | Script | `lesson-slug` | `videoUrl` |
| --- | --- | --- | --- |
| 1. The scalp conditions you'll see most often | `content/essentials/vo/lesson-01-scalp-conditions.md` | `scalp-conditions` | `courses/salon-trichology-essentials/lessons/scalp-conditions/vo.mp4` |
| 2. When hair loss is more than normal shedding | `content/essentials/vo/lesson-02-when-hair-loss-is-more-than-normal-shedding.md` | `when-hair-loss-is-more-than-normal-shedding` | `courses/salon-trichology-essentials/lessons/when-hair-loss-is-more-than-normal-shedding/vo.mp4` |
| 3. Starting the conversation | `content/essentials/vo/lesson-03-starting-the-conversation.md` | `starting-the-conversation` | `courses/salon-trichology-essentials/lessons/starting-the-conversation/vo.mp4` |
| 4. Recommending products and services with confidence | `content/essentials/vo/lesson-04-recommending-products-services.md` | `recommending-products-services` | `courses/salon-trichology-essentials/lessons/recommending-products-services/vo.mp4` |
| 5. Scope of practice for stylists | `content/essentials/vo/lesson-05-scope-of-practice-for-stylists.md` | `scope-of-practice-for-stylists` | `courses/salon-trichology-essentials/lessons/scope-of-practice-for-stylists/vo.mp4` |

Also accepted: `.m4v` (`ESSENTIALS_VIDEO_FILENAME=vo.m4v`).

Admin file upload still writes:

```
courses/<courseId>/lessons/<lessonId>/<timestamp>-<filename>
```

Either form is a **storage path**, not a public URL. The lesson page signs it with `createSignedDownloadUrl`, same idea as `VideoProduct.videoPath`.

Spoken scripts live in `content/essentials/vo/`. **Do not generate ElevenLabs audio unless `ELEVENLABS_API_KEY` is available.** This PR does not invent audio.

## How to upload ElevenLabs mp4 / m4v

1. Generate Loz VO from the scripts in `content/essentials/vo/` (Marketing / Antonio; clone over graphics, no face).
2. Upload to the Academy Supabase bucket at the `videoUrl` path above.
3. Set `CourseLesson.videoUrl`:
   - **Admin:** Course editor → Curriculum → Edit Content → `videoUrl path` → Save video path.
   - **Script:** `npx tsx scripts/essentials-deepen.ts attach-videos` (sets the convention path; uploads from `ESSENTIALS_VIDEO_DIR` when present).

Env for attach / quiz upsert commands:

| Variable | Required | Notes |
| --- | --- | --- |
| `DATABASE_URL` | yes for DB commands | Production Academy DB |
| `SUPABASE_URL` | attach-videos / attach-pdfs | Academy storage |
| `SUPABASE_SERVICE_ROLE_KEY` | attach-videos / attach-pdfs | |
| `SUPABASE_STORAGE_BUCKET` | attach-videos / attach-pdfs | |
| `ESSENTIALS_COURSE_SLUG` | no | Default `salon-trichology-essentials` |
| `ESSENTIALS_VIDEO_FILENAME` | no | Default `vo.mp4` |
| `ESSENTIALS_VIDEO_DIR` | no | Local folder of `{lesson-slug}.mp4` files |
| `ESSENTIALS_FORCE` | no | `1` to replace an existing `videoUrl`, downloadable, or published quiz questions |
| `ELEVENLABS_API_KEY` | no | Absent here; do not invent audio |

`attach-videos` without `ESSENTIALS_VIDEO_DIR` only writes the path. The player shows once the file exists at that path.

This VM cannot reach production Supabase. PDF artifacts stay in `content/essentials/one-pagers/*.pdf` until `attach-pdfs` is run where storage credentials exist.

Inspect wiring (needs `DATABASE_URL`):

```bash
npm run essentials:status
```

## How to upsert and publish module chair-checks

Marketing copy: `content/essentials/chair-checks.md` (parsed into Quiz + questions, `moduleId` set by module title).

```bash
# Parse only (writes content/essentials/chair-checks.json, no DB)
npm run essentials:parse

# Upsert DRAFT quizzes linked to the three Essentials modules (needs DATABASE_URL)
npm run essentials:quizzes
```

Safe defaults:

- Always parse from the markdown pack.
- **Create / update as DRAFT.**
- Skip an already **PUBLISHED** quiz on that module unless `ESSENTIALS_FORCE=1` (then questions refresh and status stays published).
- Never invent a course SKU; look up `salon-trichology-essentials` by slug.

Admin publish (after review):

1. Dashboard → Education → Quizzes.
2. Open the chair-check (slug `essentials-chair-check-*`).
3. Confirm **Course module** is set.
4. Status → **Published**, Save.

LessonGate only surfaces `status = PUBLISHED` + matching `moduleId`.

### SQL when you are ready to publish

Look up IDs by slug/title. Do not invent SKUs.

```sql
SELECT c.id AS course_id, m.id AS module_id, m.title
FROM "Course" c
JOIN "CourseModule" m ON m."courseId" = c.id
WHERE c.slug = 'salon-trichology-essentials'
ORDER BY m.position;

SELECT id, title, status, "moduleId", slug
FROM "Quiz"
WHERE slug LIKE 'essentials-chair-check-%';

-- After admin review only:
-- UPDATE "Quiz" SET status = 'PUBLISHED' WHERE slug = 'essentials-chair-check-scalp-concerns';
```

Do not publish from this PR alone.

## How to attach end-of-module PDFs

Last lesson of each module uses `CourseLesson.downloadableId` → `DownloadableAsset.filePath` (signed download).

**Local artifacts (no Supabase required):**

```bash
npm run essentials:pdfs
```

Writes A4 PDFs next to the markdown:

- `content/essentials/one-pagers/scalp-hair-quick-screen.pdf`
- `content/essentials/one-pagers/chair-language-crib-sheet.pdf`
- `content/essentials/one-pagers/scope-referral-pathway.pdf`

**Admin:** Course editor → last lesson of the module → Upload PDF.

**Script** (needs Supabase + `DATABASE_URL`):

```bash
npx tsx scripts/essentials-deepen.ts attach-pdfs
```

Creates / updates `DownloadableAsset` and sets `downloadableId` on the last lesson of each matched module.

Storage convention:

```
courses/salon-trichology-essentials/downloads/<one-pager-slug>.pdf
```

`attach-pdfs` will not replace an existing lesson downloadable unless `ESSENTIALS_FORCE=1`.

## Out of scope (this deepen)

- New course or £29 video SKUs
- Inventing ElevenLabs audio without `ELEVENLABS_API_KEY`
- Experrt / aiadop
- Academy chrome redesign
- Publishing TEST Live Course/Product A/B
