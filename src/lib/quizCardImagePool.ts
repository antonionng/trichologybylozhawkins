/**
 * Curated Unsplash images for quiz cards (hair, scalp, clinical).
 * Keep in sync with admin uploads / marketing choices.
 */
export const quizCardImages = {
  knowledgeCheck:
    "https://images.unsplash.com/photo-1612817288484-6f916006741a?auto=format&fit=crop&w=960&q=80",
  hairAnatomy:
    "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=960&q=80&auto=format&fit=crop",
  femalePattern:
    "https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?auto=format&fit=crop&w=960&q=80",
  telogen:
    "https://images.unsplash.com/photo-1595476108010-b4d1f102b1b1?auto=format&fit=crop&w=960&q=80",
  scalpInflammation:
    "https://images.unsplash.com/photo-1519699047748-de8e457a634e?auto=format&fit=crop&w=960&q=80",
  traction:
    "https://images.unsplash.com/photo-1580618672591-eb180b1a973f?auto=format&fit=crop&w=960&q=80",
  consultation:
    "https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=960&q=80",
  nutrition:
    "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=960&q=80",
  productCare:
    "https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?auto=format&fit=crop&w=960&q=80",
  structuredAssessment:
    "https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?auto=format&fit=crop&w=960&q=80",
  multiDisciplinaryPractice:
    "https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=960&q=80",
  complexCaseManagement:
    "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=960&q=80",
  trichoscopy:
    "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=960&q=80",
  clientRelationships:
    "https://images.unsplash.com/photo-1580618672591-eb180b1a973f?auto=format&fit=crop&w=960&q=80",
  emotionalConsultations:
    "https://images.unsplash.com/photo-1595476108010-b4d1f102b1b1?auto=format&fit=crop&w=960&q=80",
  scalpExamination:
    "https://images.unsplash.com/photo-1612817288484-6f916006741a?auto=format&fit=crop&w=960&q=80",
  scalpConcerns:
    "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=960&q=80",
  hairLossConditions:
    "https://images.unsplash.com/photo-1595476108010-b4d1f102b1b1?auto=format&fit=crop&w=960&q=80",
  diagnosisAssessment:
    "https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=960&q=80",
  consultationSkills:
    "https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?auto=format&fit=crop&w=960&q=80",
  practiceDevelopment:
    "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=960&q=80",
} as const;

export type QuizCardImageLookupInput = {
  slug?: string | null;
  title?: string | null;
  description?: string | null;
};

const quizSlugImageMap: Record<string, string> = {
  "trichology-knowledge-check": quizCardImages.knowledgeCheck,
  "hair-growth-anatomy": quizCardImages.hairAnatomy,
  "female-pattern-hair-loss": quizCardImages.femalePattern,
  "telogen-effluvium": quizCardImages.telogen,
  "scalp-dermatitis-inflammation": quizCardImages.scalpInflammation,
  "scalp-health-check": quizCardImages.scalpInflammation,
  "traction-alopecia": quizCardImages.traction,
  "consultation-workflow": quizCardImages.consultation,
  "nutrition-hair-health": quizCardImages.nutrition,
  "product-ingredient-literacy": quizCardImages.productCare,
};

const titleKeywordImageRules: Array<{
  keywords: string[];
  image: string;
}> = [
  {
    keywords: ["multi-disciplinary practice", "multi disciplinary practice"],
    image: quizCardImages.multiDisciplinaryPractice,
  },
  {
    keywords: ["systematic scalp examination"],
    image: quizCardImages.scalpExamination,
  },
  {
    keywords: ["recognising common scalp concerns"],
    image: quizCardImages.scalpConcerns,
  },
  {
    keywords: ["day 5 common hair loss conditions"],
    image: quizCardImages.hairLossConditions,
  },
  {
    keywords: ["day 4 diagnosis assessment techniques"],
    image: quizCardImages.diagnosisAssessment,
  },
  {
    keywords: ["day 7 client consultation skills"],
    image: quizCardImages.consultationSkills,
  },
  {
    keywords: ["day 8 business practice development"],
    image: quizCardImages.practiceDevelopment,
  },
  {
    keywords: ["complex case management"],
    image: quizCardImages.complexCaseManagement,
  },
  {
    keywords: ["advanced trichoscopy", "microscopy assessment"],
    image: quizCardImages.trichoscopy,
  },
  {
    keywords: ["building long term client relationships"],
    image: quizCardImages.clientRelationships,
  },
  {
    keywords: ["communication in emotional consultations"],
    image: quizCardImages.emotionalConsultations,
  },
  {
    keywords: ["structured hair loss assessment", "hair loss assessment assessment"],
    image: quizCardImages.structuredAssessment,
  },
  {
    keywords: [
      "female pattern",
      "pattern hair loss",
      "androgenetic",
      "miniaturisation",
    ],
    image: quizCardImages.femalePattern,
  },
  {
    keywords: [
      "telogen",
      "shedding",
      "postpartum",
      "stress hair loss",
      "trigger mapping",
    ],
    image: quizCardImages.telogen,
  },
  {
    keywords: [
      "traction",
      "hair practices",
      "tight styling",
      "protective styling",
    ],
    image: quizCardImages.traction,
  },
  {
    keywords: [
      "nutrition",
      "deficiencies",
      "ferritin",
      "vitamin",
      "nutrient",
    ],
    image: quizCardImages.nutrition,
  },
  {
    keywords: [
      "product",
      "ingredient",
      "scalp care plan",
      "ketoconazole",
      "niacinamide",
    ],
    image: quizCardImages.productCare,
  },
  {
    keywords: [
      "scalp",
      "dermatitis",
      "inflammation",
      "psoriasis",
      "seborrhoeic",
      "seborrheic",
      "itch",
      "conditions",
      "disorders",
    ],
    image: quizCardImages.scalpInflammation,
  },
  {
    keywords: [
      "consultation",
      "client",
      "communication",
      "diagnosis",
      "hair loss assessment",
      "assessment techniques",
      "trichoscopy",
      "differential diagnosis",
      "referral",
      "complex case",
      "multi-disciplinary",
      "multi disciplinary",
      "multidisciplinary",
      "clinical practice",
      "documentation",
      "practice development",
      "boundaries",
    ],
    image: quizCardImages.consultation,
  },
  {
    keywords: [
      "anatomy",
      "biology",
      "hair growth",
      "hair cycle",
      "follicle",
    ],
    image: quizCardImages.hairAnatomy,
  },
  {
    keywords: [
      "knowledge check",
      "phase 1 exam",
      "ph1 exam",
      "introduction to trichology",
      "foundation",
    ],
    image: quizCardImages.knowledgeCheck,
  },
];

function normalizeQuizText(value: string | null | undefined) {
  return (value ?? "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function resolveQuizCardImage(
  input: QuizCardImageLookupInput,
): string | null {
  const slug = normalizeQuizText(input.slug).replace(/\s+/g, "-");
  if (slug && quizSlugImageMap[slug]) {
    return quizSlugImageMap[slug]!;
  }

  const combined = normalizeQuizText(
    [input.title, input.description].filter(Boolean).join(" "),
  );
  if (!combined) {
    return null;
  }

  for (const rule of titleKeywordImageRules) {
    if (rule.keywords.some((keyword) => combined.includes(keyword))) {
      return rule.image;
    }
  }

  return null;
}

/** Same URLs in stable order for rotating fallbacks (empty quizzes, backfill). */
export const QUIZ_CARD_IMAGE_POOL: readonly string[] =
  Object.values(quizCardImages);
