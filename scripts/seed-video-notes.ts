/**
 * Seeds memberContent (notes, keyTakeaways, nextSteps) for all published video products.
 *
 * Usage:  npx tsx scripts/seed-video-notes.ts
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const NOTES_BY_SLUG: Record<
  string,
  { notes: string; keyTakeaways: string[]; nextSteps: string[] }
> = {
  "menopause-hair-loss": {
    notes:
      "Menopausal hair changes are driven primarily by declining oestrogen and rising androgens, which shorten the anagen phase and can miniaturise follicles — particularly at the crown and frontal hairline. Lorraine explains how to distinguish diffuse menopausal shedding (telogen effluvium) from female pattern hair loss (androgenetic alopecia), and why the two often present together. Scalp changes such as increased dryness, reduced sebum, and sensitivity are covered alongside the hair cycle disruption. The module emphasises realistic client communication: recovery is possible but rarely returns to pre-menopausal density, and setting honest expectations is part of professional care.",
    keyTakeaways: [
      "Oestrogen decline shortens the growth phase and can trigger both diffuse shedding and miniaturisation at the same time",
      "Scalp barrier function often deteriorates during menopause — dryness, flaking, and sensitivity are common co-presentations",
      "Distinguish between telogen effluvium (temporary shedding) and androgenetic alopecia (progressive thinning) using pull tests and parting-width assessment",
      "Topical support should focus on anti-inflammatory, barrier-repair ingredients rather than aggressive stimulation",
      "Nutritional factors — iron, ferritin, vitamin D, and protein — play a supporting role and are worth screening for",
      "HRT can help stabilise hair loss in some women but outcomes vary; always advise clients to discuss with their GP",
      "Recovery timelines are typically 6–12 months for TE, while AGA requires ongoing management",
    ],
    nextSteps: [
      "Practice distinguishing TE from AGA in your next menopausal client consultations",
      "Review your product range for barrier-repair and anti-inflammatory scalp formulations",
      "Create a simple one-page handout for menopausal clients covering what to expect and realistic timelines",
      "Consider adding a scalp-health screening checklist to your consultation process",
    ],
  },
  "postpartum-hair-loss": {
    notes:
      "Postpartum hair loss is a form of telogen effluvium triggered by the sharp drop in oestrogen and progesterone after delivery. During pregnancy, elevated hormones keep more hairs in the anagen (growth) phase, creating the appearance of thicker hair. Once hormone levels normalise — typically 2–4 months after birth — those retained hairs shift into telogen and shed simultaneously. Lorraine explains the mechanism clearly and covers how to differentiate normal postpartum shedding from presentations that warrant medical investigation, such as prolonged or worsening loss beyond 12 months, patchy loss, or accompanying symptoms like fatigue and mood changes that may indicate thyroid dysfunction or iron deficiency.",
    keyTakeaways: [
      "Postpartum shedding is a physiological response to hormonal normalisation, not a sign of damage",
      "Onset is typically 2–4 months post-delivery, with peak shedding around 3–6 months",
      "Most cases resolve spontaneously within 6–12 months without intervention",
      "Breastfeeding can extend the timeline due to sustained hormonal changes",
      "Iron deficiency and thyroid dysfunction are common postpartum co-factors that can prolong or worsen shedding",
      "Avoid aggressive treatments — gentle scalp care and nutritional support are the evidence-based approach",
      "Refer for blood work if shedding persists beyond 12 months or is accompanied by fatigue, weight changes, or mood disturbance",
    ],
    nextSteps: [
      "Add a postpartum timeline question to your client intake form to identify this presentation early",
      "Prepare a reassurance script you can use with anxious new mothers — normalising the experience is half the consultation",
      "Familiarise yourself with the referral criteria for thyroid and iron screening",
      "Review gentle, non-irritating scalp care options suitable for postpartum clients",
    ],
  },
  "stress-hair-loss": {
    notes:
      "Stress-related hair loss is most commonly telogen effluvium (TE), where a significant physiological or emotional stressor pushes a disproportionate number of follicles from anagen into telogen simultaneously. The hallmark of stress-related TE is the delay: shedding typically begins 2–3 months after the triggering event, which often confuses clients who don't connect the current loss to an earlier stressor. Lorraine covers the cortisol–hair-cycle pathway, the role of inflammation in stress-related scalp symptoms, and how to differentiate acute TE from chronic TE and other conditions. The module emphasises that recovery is the natural outcome once the stressor resolves — the clinical focus should be on supporting recovery without over-treating.",
    keyTakeaways: [
      "Cortisol and other stress hormones can prematurely shift follicles from growth (anagen) to resting (telogen) phase",
      "The 2–3 month delay between stressor and shedding is the key diagnostic clue — always ask about events 3 months ago",
      "Acute TE is self-limiting and typically resolves within 6–9 months once the trigger is removed",
      "Chronic TE (lasting beyond 6 months) may indicate an ongoing stressor, nutritional deficiency, or underlying condition",
      "Stress-related scalp inflammation — tenderness, tightness, tingling — is a real presentation and not imagined",
      "Avoid aggressive scalp stimulation during active shedding; focus on anti-inflammatory, calming approaches",
      "Regrowth is expected in the vast majority of cases — confident reassurance is one of the most valuable things you can offer",
    ],
    nextSteps: [
      "Start asking every shedding client about significant events or changes 2–4 months before onset",
      "Build a stress-timeline assessment into your consultation process",
      "Review your scalp care recommendations — swap stimulating products for calming, anti-inflammatory alternatives during active shedding",
      "Learn to identify when stress-related TE may be masking an underlying condition that needs referral",
    ],
  },
  "sensitive-scalps": {
    notes:
      "Sensitive and reactive scalps are an increasingly common presentation, driven by impaired barrier function, environmental triggers, and product overload. Lorraine explains the scalp barrier in clinical terms: the stratum corneum, lipid matrix, and acid mantle work together to protect against irritants and moisture loss. When this barrier is compromised — through over-washing, harsh surfactants, chemical services, or inflammatory conditions — the scalp becomes hyper-reactive, leading to redness, itching, burning, and flaking. The module covers how to systematically identify triggers, assess barrier integrity, and recommend calming protocols that restore function without aggravating symptoms. Differential assessment is included to help distinguish simple sensitivity from presentations requiring dermatological referral.",
    keyTakeaways: [
      "The scalp barrier consists of the stratum corneum, intercellular lipids, and the acid mantle — damage to any layer increases sensitivity",
      "Common triggers include harsh sulphate surfactants, frequent washing, chemical services, fragrance, and environmental factors",
      "Product overload and ingredient layering is a growing cause of reactive scalps — more is not always better",
      "Itching without visible pathology is a real and valid presentation, often linked to sub-clinical inflammation",
      "Scalp pH matters: the healthy scalp sits around pH 4.5–5.5; disruption increases vulnerability to irritation and microbial imbalance",
      "Calming protocols should prioritise barrier repair (ceramides, squalane, niacinamide) over stimulation",
      "Refer to a dermatologist when you see persistent plaques, weeping, crusting, or hair loss accompanying scalp symptoms",
    ],
    nextSteps: [
      "Audit your salon's shampoo and scalp products for harsh surfactants and high-fragrance formulations",
      "Add a scalp sensitivity screening question to your consultation form",
      "Create a step-down protocol for clients who are over-using products or washing too frequently",
      "Practice identifying the difference between simple sensitivity and presentations that need medical referral",
    ],
  },
};

async function main() {
  const videos = await prisma.videoProduct.findMany({
    where: { status: "PUBLISHED" },
    select: { id: true, slug: true, title: true, memberContent: true },
  });

  console.log(`Found ${videos.length} published video products\n`);

  for (const video of videos) {
    const seed = NOTES_BY_SLUG[video.slug];
    if (!seed) {
      console.log(`  SKIP  ${video.title} (slug "${video.slug}" — no seed data)`);
      continue;
    }

    const existing = (video.memberContent ?? {}) as Record<string, unknown>;
    if (existing.notes && existing.keyTakeaways) {
      console.log(`  SKIP  ${video.title} (already has notes)`);
      continue;
    }

    await prisma.videoProduct.update({
      where: { id: video.id },
      data: {
        memberContent: {
          ...existing,
          notes: seed.notes,
          keyTakeaways: seed.keyTakeaways,
          nextSteps: seed.nextSteps,
        },
      },
    });

    console.log(`  DONE  ${video.title}`);
  }

  console.log("\nSeed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
