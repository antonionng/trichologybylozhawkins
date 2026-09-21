# Salon Trichology Essentials — deepen runbook

Deepen the **existing** published course `salon-trichology-essentials` only. Do **not** add course or video SKUs. TEST Live Course/Product A/B stay unpublished.

**Deploy target:** Vercel project **trichology** (Academy / trichologyacademy.co.uk). Not experrt / aiadop.

Pay-first checkout is unchanged. Learners still buy the existing Essentials SKU, then watch attached lesson media inside `/academy`.

## Learner path (once content is attached)

1. Enrolled learner opens a lesson. If `CourseLesson.videoUrl` is set, the full-width player signs that **storage path** and plays the voice-over (no face required).
2. After the **last lesson** of a module, if a **PUBLISHED** quiz exists with that `moduleId`, LessonGate shows the chair-check and blocks “next module” until they pass.
3. If the last lesson has a `downloadableId`, the chair-side one-pager download CTA appears.

Placeholder quizzes stay **DRAFT**. They will not appear in the learner UI until someone publishes them in admin.

## Storage path convention (lesson VO)

Prefer slug-based paths so Marketing can drop ElevenLabs files without knowing Prisma IDs:

```
courses/salon-trichology-essentials/lessons/<lesson-slug>/vo.mp4
```

| Lesson | `lesson-slug` |
| --- | --- |
| The scalp conditions you'll see most often | `scalp-conditions` |
| When hair loss is more than normal shedding | `when-hair-loss-is-more-than-normal-shedding` |
| Starting the conversation | `starting-the-conversation` |
| Recommending products and services with confidence | `recommending-products-services` |
| Scope of practice for stylists | `scope-of-practice-for-stylists` |

Also accepted: `.m4v`. Set `ESSENTIALS_VIDEO_FILENAME=vo.m4v` if that is what you upload.

Admin file upload (Course editor → lesson → Upload VO) still writes the existing cuid path:

```
courses/<courseId>/lessons/<lessonId>/<timestamp>-<filename>
```

Either form is a **storage path**, not a public URL. The lesson page signs it with `createSignedDownloadUrl`, same idea as `VideoProduct.videoPath`.

## How to upload ElevenLabs mp4 / m4v

1. Generate Loz voice-over later (scripts come from Marketing; do not generate ElevenLabs from this repo).
2. Upload the file to the Academy Supabase bucket at the slug path above (Dashboard Storage, or `ESSENTIALS_VIDEO_DIR` + `npm run essentials:deepen -- attach-videos`).
3. Set `CourseLesson.videoUrl` to that path:
   - **Admin:** Course editor → Curriculum → Edit Content → `videoUrl path` → Save video path.
   - **Script:** `npm run essentials:deepen -- attach-videos` (sets the convention path on each matched lesson; uploads from `ESSENTIALS_VIDEO_DIR` when present).

Env for attach commands:

| Variable | Required | Notes |
| --- | --- | --- |
| `DATABASE_URL` | yes for DB commands | Production Academy DB |
| `SUPABASE_URL` | attach-videos / attach-pdfs | Academy storage |
| `SUPABASE_SERVICE_ROLE_KEY` | attach-videos / attach-pdfs | |
| `SUPABASE_STORAGE_BUCKET` | attach-videos / attach-pdfs | |
| `ESSENTIALS_COURSE_SLUG` | no | Default `salon-trichology-essentials` |
| `ESSENTIALS_VIDEO_FILENAME` | no | Default `vo.mp4` |
| `ESSENTIALS_VIDEO_DIR` | no | Local folder of `{lesson-slug}.mp4` files |
| `ESSENTIALS_FORCE` | no | `1` to replace an existing `videoUrl` / downloadable |

`attach-videos` without `ESSENTIALS_VIDEO_DIR` only writes the path. The player shows once the file exists at that path.

Inspect current wiring (read-only):

```bash
npm run essentials:status
```

## How to publish module chair-check quizzes

Admin can now bind a quiz to a course **module**:

1. Dashboard → Education → Quizzes → New Quiz (or edit an existing quiz).
2. Select **Salon Trichology Essentials**.
3. Select the module under **Course module (chair-check)**.
4. Keep **Status = Draft** until Marketing replaces placeholder questions.
5. When copy is final: Status → **Published**, Save.

LessonGate only queries `Quiz` where `moduleId` matches and `status = PUBLISHED`. Drafts never gate learners.

Safe placeholder seed (does **not** publish; skips a live published non-placeholder quiz):

```bash
npm run essentials:quizzes
```

Copy lives in `data/essentials/chair-check-quizzes.json`. Every title/question is marked `[DRAFT PLACEHOLDER]`.

If production already has published module quizzes from an earlier seed, the script leaves them alone. Edit those rows in admin rather than overwriting.

### SQL when Marketing copy arrives

Look up IDs by slug/title — do not invent SKUs.

```sql
-- Find the course and modules
SELECT c.id AS course_id, m.id AS module_id, m.title
FROM "Course" c
JOIN "CourseModule" m ON m."courseId" = c.id
WHERE c.slug = 'salon-trichology-essentials'
ORDER BY m.position;

-- Find the draft chair-check (placeholder slugs)
SELECT id, title, status, "moduleId"
FROM "Quiz"
WHERE slug LIKE 'essentials-chair-check-%';

-- After editing questions in admin (preferred), publish one module:
-- UPDATE "Quiz" SET status = 'PUBLISHED' WHERE slug = 'essentials-chair-check-scalp-concerns';
```

Do not run a publish update from this PR.

## How to attach end-of-module PDFs

Last lesson of each module uses `CourseLesson.downloadableId` → `DownloadableAsset.filePath` (signed download).

**Admin:** Course editor → last lesson in the module → Edit Content → Upload PDF (or hover File). That creates a `DownloadableAsset` and links it.

**Script (placeholder generators):**

```bash
# Write local PDFs from the markdown stubs
npm run essentials:pdfs

# Upload + link to each module's last lesson (needs Supabase + DATABASE_URL)
npx tsx scripts/essentials-deepen.ts attach-pdfs
```

Markdown stubs (replace, then regenerate):

- `data/essentials/one-pagers/recognising-common-scalp-concerns.md`
- `data/essentials/one-pagers/client-conversations-that-build-trust.md`
- `data/essentials/one-pagers/know-your-boundaries.md`

Storage convention:

```
courses/salon-trichology-essentials/downloads/<module-slug>-chair-side.pdf
```

`attach-pdfs` will not replace an existing lesson downloadable unless `ESSENTIALS_FORCE=1`.

## Out of scope (this deepen)

- New course or £29 video SKUs
- ElevenLabs generation
- Final clinical copy
- Experrt / aiadop
- Academy chrome redesign
- Publishing TEST Live Course/Product A/B
