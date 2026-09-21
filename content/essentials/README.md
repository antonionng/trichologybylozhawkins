# Salon Trichology Essentials: Content Pack README

**Course:** Salon Trichology Essentials (£99)  
**Slug:** salon-trichology-essentials  
**Site:** trichologyacademy.co.uk  
**Handoff for:** Experrt Engineer  
**Approved scope:** Deepen Essentials only (no new SKUs)  
**Voice:** Loz Hawkins (calm, clinical, British spelling, education-led). ElevenLabs voice clone over graphics/B-roll; Loz does not appear on camera.  
**Status:** Ready for engineer

## Files

| File | Contents | Status |
|------|----------|--------|
| `essentials-vo-scripts.md` | Five lesson voice-over scripts (Lessons 1-5), each with word-count estimate, must-say caveats, spoken script body | Ready |
| `essentials-chair-checks.md` | Three module chair-checks (3-5 questions each): MULTIPLE_CHOICE / TRUE_FALSE, stems, options, correct answers, short explanations | Ready |
| `essentials-one-pagers.md` | Three PDF-ready end-of-module one-pagers (quick screen + refer; language crib; scope + pathway) | Ready |
| `essentials-content-pack-README.md` | This index | Ready |

## Live course map (for wiring)

**Module 1: Recognising Common Scalp Concerns**  
- Lesson 1: The scalp conditions you'll see most often  
- Lesson 2: When hair loss is more than normal shedding  

**Module 2: Client Conversations That Build Trust**  
- Lesson 3: Starting the conversation  
- Lesson 4: Recommending products and services with confidence  

**Module 3: Know Your Boundaries**  
- Lesson 5: Scope of practice for stylists  

## Editorial constraints (honoured in pack)
- No miracle/cure claims  
- No em dashes (commas, periods, or parentheses used instead)  
- No phrase "hair journey"  
- Scope-safe: observation + language + referral; no stylist diagnosis of medical disease  
- Knutsford clinic mentioned lightly where referral fits; Academy = education; Loz clinic = client care  

## Script length check (spoken body word counts)
- Lesson 1: ~692 words  
- Lesson 2: ~613 words  
- Lesson 3: ~573 words  
- Lesson 4: ~518 words  
- Lesson 5: ~527 words  
Target band: ~450-900 words (~3-6 min spoken). All five in band.

## Engineer notes
- VO files are markdown source for ElevenLabs + on-screen lesson titles  
- Chair-checks include correct answer letter/index and rationale for LMS feedback  
- One-pagers are copy-ready for A4 PDF layout (title + bullets)  
- Pair Module 1 one-pager with Lessons 1-2; Module 2 with Lessons 3-4; Module 3 with Lesson 5

## Repo wiring (engineer)

- Chair-checks: parse `chair-checks.md` → `npm run essentials:parse` / `essentials:quizzes` (DRAFT, `moduleId` linked). JSON artifact: `chair-checks.json`.
- One-pagers: `one-pagers/*.md` → `npm run essentials:pdfs` writes A4 PDFs beside them. `attach-pdfs` needs Academy Supabase.
- VO: `vo/` scripts for ElevenLabs. Do not invent audio without `ELEVENLABS_API_KEY`. Paths in `vo/README.md` and `docs/essentials-deepen.md`.
- No new SKUs. TEST catalog stays unpublished. Pay-first checkout untouched.  
