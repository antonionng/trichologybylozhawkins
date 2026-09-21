# Essentials voice-over (ElevenLabs)

Source of truth for spoken copy: `essentials-vo-scripts.md` (also split per lesson below).

**Voice:** Loz Hawkins clone. Calm, clinical, British spelling. Graphics / B-roll only. Loz does not appear on camera.

Do **not** invent audio in this repo unless `ELEVENLABS_API_KEY` is present. This environment does not generate mp4/m4v.

## Lesson files → storage path (`CourseLesson.videoUrl`)

`videoUrl` is a **Supabase storage path**, signed the same way as `VideoProduct.videoPath`.

```
courses/salon-trichology-essentials/lessons/<lesson-slug>/vo.mp4
```

`.m4v` is also accepted (`vo.m4v`).

| Lesson | Script file | `lesson-slug` | `videoUrl` |
| --- | --- | --- | --- |
| 1. The scalp conditions you'll see most often | `lesson-01-scalp-conditions.md` | `scalp-conditions` | `courses/salon-trichology-essentials/lessons/scalp-conditions/vo.mp4` |
| 2. When hair loss is more than normal shedding | `lesson-02-when-hair-loss-is-more-than-normal-shedding.md` | `when-hair-loss-is-more-than-normal-shedding` | `courses/salon-trichology-essentials/lessons/when-hair-loss-is-more-than-normal-shedding/vo.mp4` |
| 3. Starting the conversation | `lesson-03-starting-the-conversation.md` | `starting-the-conversation` | `courses/salon-trichology-essentials/lessons/starting-the-conversation/vo.mp4` |
| 4. Recommending products and services with confidence | `lesson-04-recommending-products-services.md` | `recommending-products-services` | `courses/salon-trichology-essentials/lessons/recommending-products-services/vo.mp4` |
| 5. Scope of practice for stylists | `lesson-05-scope-of-practice-for-stylists.md` | `scope-of-practice-for-stylists` | `courses/salon-trichology-essentials/lessons/scope-of-practice-for-stylists/vo.mp4` |

Admin upload still writes `courses/<courseId>/lessons/<lessonId>/<timestamp>-<filename>`. Either path works.

## After ElevenLabs

1. Export mp4 or m4v (voice-over over graphics; no face).
2. Upload to the Academy Supabase bucket at the `videoUrl` path above.
3. Set the lesson `videoUrl` in Course editor, or run:

```bash
ESSENTIALS_VIDEO_DIR=./local-vo npm run essentials:deepen -- attach-videos
```

`attach-videos` without `ESSENTIALS_VIDEO_DIR` only writes the convention path. The player appears once the file exists at that path.

See `docs/essentials-deepen.md`.
