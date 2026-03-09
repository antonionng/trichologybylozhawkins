import {
  FEATURED_PUBLIC_QUIZ_HREF,
  FEATURED_PUBLIC_QUIZ_RESULT_LABEL,
  FEATURED_PUBLIC_QUIZ_SLUG,
} from "@/lib/publicQuiz";
import { QuestionType } from "@prisma/client";

export type PublicScalpQuizQuestionKey =
  | "mainConcern"
  | "scalpFeel"
  | "visibleChanges"
  | "onset"
  | "triggers"
  | "severity"
  | "redFlags";

export type PublicScalpQuizConcernKey =
  | "flakingInflammation"
  | "oilBuildUp"
  | "drySensitive"
  | "stressShedding"
  | "patternThinning"
  | "tractionTension"
  | "patchyLoss";

export type PublicScalpQuizOptionValue =
  | "flakes_itch"
  | "greasy_scalp"
  | "dry_tight"
  | "sudden_shedding"
  | "gradual_thinning"
  | "patchy_loss"
  | "tight_styles"
  | "itch"
  | "oily"
  | "dry"
  | "sore_burning"
  | "tender_hairline"
  | "no_scalp_symptoms"
  | "yellow_scale"
  | "powdery_flakes"
  | "more_hair_in_shower"
  | "widening_part"
  | "temple_or_crown_loss"
  | "round_patches"
  | "broken_hairs_hairline"
  | "crusting_or_pus"
  | "last_few_weeks"
  | "2_3_months_after_trigger"
  | "gradual_over_months"
  | "comes_and_goes"
  | "rapid_or_sudden"
  | "illness_stress_postpartum"
  | "new_products_buildup"
  | "winter_or_weather"
  | "none"
  | "mild"
  | "moderate"
  | "rapid_or_worsening"
  | "eyebrow_or_eyelash_loss";

type PublicScalpQuizAnswerMap = Partial<Record<PublicScalpQuizQuestionKey, PublicScalpQuizOptionValue>>;

type ConcernDefinition = {
  label: string;
  summary: string;
  nextSteps: string[];
  possibleConditions: string[];
};

type ConcernScoreMap = Partial<Record<PublicScalpQuizConcernKey, number>>;

type OptionDefinition = {
  value: PublicScalpQuizOptionValue;
  label: string;
  weights?: ConcernScoreMap;
  redFlags?: string[];
};

export type PublicScalpQuizDefinition = {
  key: PublicScalpQuizQuestionKey;
  questionText: string;
  options: OptionDefinition[];
};

export type FeaturedPublicScalpQuizContent = {
  slug: string;
  title: string;
  description: string;
  passingScore: number;
  resultsCopy: {
    low: { headline: string; body: string };
    medium: { headline: string; body: string };
    high: { headline: string; body: string };
  };
  questions: Array<{
    questionText: string;
    questionType: QuestionType;
    options: string[];
    correctAnswer: number;
    points: number;
  }>;
};

export type PublicScalpQuizResult = {
  headline: string;
  summary: string;
  triage: "routine" | "prompt";
  primaryConcern: {
    key: PublicScalpQuizConcernKey;
    label: string;
    possibleConditions: string[];
  };
  secondaryConcern: {
    key: PublicScalpQuizConcernKey;
    label: string;
  } | null;
  nextSteps: string[];
  redFlags: string[];
  bookingCta: {
    href: string;
    label: string;
  };
  scoreBreakdown: Record<PublicScalpQuizConcernKey, number>;
};

type StoredQuizQuestion = {
  id: string;
  position: number;
  questionText: string;
};

type StoredQuizAnswerInput = {
  questionId: string;
  answer: string | number | string[];
};

export type PublicScalpQuizSubmission = {
  attemptAnswers: Array<{
    questionId: string;
    answer: string | number | string[] | null;
    answerLabel: string | null;
    optionValue: PublicScalpQuizOptionValue | null;
    isCorrect: false;
  }>;
  result: PublicScalpQuizResult & {
    resultMode: "consumer_scalp";
    secondaryCta: { href: string; label: string };
  };
};

const concernDefinitions: Record<PublicScalpQuizConcernKey, ConcernDefinition> = {
  flakingInflammation: {
    label: "Flaking and inflammation pattern",
    summary:
      "Your answers most closely match a flaking and irritation pattern, often seen when the scalp barrier is unsettled or when dandruff-like inflammation is active.",
    nextSteps: [
      "Keep washing gentle but regular so flakes and excess scale do not build up.",
      "Pause heavy oils or strongly fragranced scalp products until the scalp settles.",
      "Book a scalp consultation if the irritation is persistent, sore, or spreading.",
    ],
    possibleConditions: ["Dandruff", "Seborrheic dermatitis pattern"],
  },
  oilBuildUp: {
    label: "Oiliness and build-up pattern",
    summary:
      "Your answers suggest a scalp environment with excess oil or product build-up, which can leave the scalp feeling heavy, itchy, or difficult to keep comfortable.",
    nextSteps: [
      "Clarify your wash routine and avoid layering multiple heavy scalp products at once.",
      "Track whether symptoms improve after simplifying products for two to three weeks.",
      "Book a scalp consultation if oiliness is paired with soreness, heavy scaling, or recurring flare-ups.",
    ],
    possibleConditions: ["Build-up", "Seborrheic dermatitis pattern"],
  },
  drySensitive: {
    label: "Dry and sensitive scalp pattern",
    summary:
      "Your answers suggest a dry or sensitive scalp pattern, where tightness, comfort changes, or product sensitivity may be playing a bigger role than excess oil.",
    nextSteps: [
      "Avoid harsh exfoliants and simplify to a gentle, non-irritating scalp routine.",
      "Notice whether weather changes, over-washing, or new products make the scalp feel tighter.",
      "Book a scalp consultation if the scalp stays uncomfortable or the skin looks inflamed.",
    ],
    possibleConditions: ["Dry scalp", "Barrier disruption"],
  },
  stressShedding: {
    label: "Stress or trigger-related shedding pattern",
    summary:
      "Your answers suggest a shedding pattern that may follow a recent internal or external trigger rather than a purely scalp-surface issue.",
    nextSteps: [
      "Note any illness, stress, medication change, or postpartum timing from the last two to three months.",
      "Keep the scalp routine simple while the shedding pattern is assessed.",
      "Book a scalp consultation if shedding feels sudden, prolonged, or worrying.",
    ],
    possibleConditions: ["Telogen effluvium pattern"],
  },
  patternThinning: {
    label: "Gradual thinning pattern",
    summary:
      "Your answers suggest a gradual thinning pattern, where reduced density over time may matter more than immediate scalp irritation.",
    nextSteps: [
      "Take clear photos in consistent light so changes in density are easier to track over time.",
      "Pay attention to widening through the parting, temple recession, or reduced ponytail thickness.",
      "Book a scalp consultation for a closer assessment and a personalised plan.",
    ],
    possibleConditions: ["Female pattern hair loss pattern", "Male pattern hair loss pattern"],
  },
  tractionTension: {
    label: "Tension or styling-related hairline stress",
    summary:
      "Your answers suggest repeated tension may be irritating the scalp or stressing the hairline, especially if tight styles are worn often.",
    nextSteps: [
      "Loosen high-tension styles and reduce repeated pulling on the same areas.",
      "Give the hairline and crown more recovery time between braids, ponytails, or extensions.",
      "Book a scalp consultation if the hairline is thinning, sore, or not improving.",
    ],
    possibleConditions: ["Traction alopecia pattern"],
  },
  patchyLoss: {
    label: "Patchy hair loss pattern",
    summary:
      "Your answers suggest a patchy hair loss pattern rather than simple shedding, which is worth assessing professionally because several different causes can look similar at first.",
    nextSteps: [
      "Avoid scratching, picking, or applying harsh treatments while the area is being assessed.",
      "Take note of any eyebrow, eyelash, or body hair changes as well.",
      "Book a scalp consultation promptly so the pattern can be assessed early.",
    ],
    possibleConditions: ["Alopecia areata pattern", "Scarring hair loss needs ruling out"],
  },
};

const redFlagPriority = [
  "Scalp pain, burning, or visible inflammation",
  "Patchy hair loss or clearly defined bare areas",
  "Crusting, oozing, or signs of infection",
  "Rapid change or worsening symptoms",
  "Loss affecting eyebrows or eyelashes",
] as const;

export const publicScalpQuizDefinition: PublicScalpQuizDefinition[] = [
  {
    key: "mainConcern",
    questionText: "What best describes your main concern right now?",
    options: [
      {
        value: "flakes_itch",
        label: "Flaking, itch, or irritation",
        weights: { flakingInflammation: 3, drySensitive: 1 },
      },
      {
        value: "greasy_scalp",
        label: "Greasy scalp or product build-up",
        weights: { oilBuildUp: 3, flakingInflammation: 1 },
      },
      {
        value: "dry_tight",
        label: "Dryness, tightness, or sensitivity",
        weights: { drySensitive: 3 },
      },
      {
        value: "sudden_shedding",
        label: "Sudden increase in shedding",
        weights: { stressShedding: 3, patternThinning: 1 },
      },
      {
        value: "gradual_thinning",
        label: "Gradual thinning or reduced density",
        weights: { patternThinning: 3 },
      },
      {
        value: "patchy_loss",
        label: "Patchy hair loss or bare areas",
        weights: { patchyLoss: 4 },
        redFlags: ["Patchy hair loss or clearly defined bare areas"],
      },
      {
        value: "tight_styles",
        label: "Hairline soreness or loss around tight styles",
        weights: { tractionTension: 4 },
      },
    ],
  },
  {
    key: "scalpFeel",
    questionText: "How does your scalp feel most often?",
    options: [
      {
        value: "itch",
        label: "Itchy or irritated",
        weights: { flakingInflammation: 2, oilBuildUp: 1 },
      },
      {
        value: "oily",
        label: "Greasy quickly after washing",
        weights: { oilBuildUp: 2 },
      },
      {
        value: "dry",
        label: "Dry, tight, or easily irritated",
        weights: { drySensitive: 2 },
      },
      {
        value: "sore_burning",
        label: "Sore, burning, or inflamed",
        weights: { patchyLoss: 2, flakingInflammation: 1 },
        redFlags: ["Scalp pain, burning, or visible inflammation"],
      },
      {
        value: "tender_hairline",
        label: "Tender around the hairline or where styles pull",
        weights: { tractionTension: 3 },
      },
      {
        value: "no_scalp_symptoms",
        label: "The scalp feels normal but the hair is shedding or thinning",
        weights: { stressShedding: 1, patternThinning: 1 },
      },
    ],
  },
  {
    key: "visibleChanges",
    questionText: "What are you noticing most clearly?",
    options: [
      {
        value: "yellow_scale",
        label: "Yellow or stuck-on scale",
        weights: { flakingInflammation: 3, oilBuildUp: 2 },
      },
      {
        value: "powdery_flakes",
        label: "Fine dry flakes",
        weights: { drySensitive: 2, flakingInflammation: 1 },
      },
      {
        value: "more_hair_in_shower",
        label: "More hair than usual in the shower or brush",
        weights: { stressShedding: 3 },
      },
      {
        value: "widening_part",
        label: "Widening through the parting",
        weights: { patternThinning: 3 },
      },
      {
        value: "temple_or_crown_loss",
        label: "More recession at the temples or crown",
        weights: { patternThinning: 3 },
      },
      {
        value: "round_patches",
        label: "Round or well-defined patches",
        weights: { patchyLoss: 4 },
        redFlags: ["Patchy hair loss or clearly defined bare areas"],
      },
      {
        value: "broken_hairs_hairline",
        label: "Broken hairs or thinning around the hairline",
        weights: { tractionTension: 3 },
      },
      {
        value: "crusting_or_pus",
        label: "Crusting, oozing, or pus",
        weights: { flakingInflammation: 1, patchyLoss: 2 },
        redFlags: ["Crusting, oozing, or signs of infection"],
      },
    ],
  },
  {
    key: "onset",
    questionText: "How did this start?",
    options: [
      {
        value: "last_few_weeks",
        label: "Within the last few weeks",
        weights: { flakingInflammation: 1, oilBuildUp: 1, drySensitive: 1 },
      },
      {
        value: "2_3_months_after_trigger",
        label: "A couple of months after stress, illness, or another big change",
        weights: { stressShedding: 4 },
      },
      {
        value: "gradual_over_months",
        label: "Slowly over several months",
        weights: { patternThinning: 2, tractionTension: 1 },
      },
      {
        value: "comes_and_goes",
        label: "It flares up on and off",
        weights: { flakingInflammation: 2, oilBuildUp: 1, drySensitive: 1 },
      },
      {
        value: "rapid_or_sudden",
        label: "It changed quickly or feels like it is worsening fast",
        weights: { patchyLoss: 2, stressShedding: 1 },
        redFlags: ["Rapid change or worsening symptoms"],
      },
    ],
  },
  {
    key: "triggers",
    questionText: "Which of these feels closest to a trigger for you?",
    options: [
      {
        value: "illness_stress_postpartum",
        label: "Stress, illness, medication changes, or postpartum recovery",
        weights: { stressShedding: 4 },
      },
      {
        value: "tight_styles",
        label: "Tight styles, extensions, braids, or repeated tension",
        weights: { tractionTension: 4 },
      },
      {
        value: "new_products_buildup",
        label: "Heavy products, oils, or changes to my scalp routine",
        weights: { oilBuildUp: 3, drySensitive: 1 },
      },
      {
        value: "winter_or_weather",
        label: "Weather changes or seasonal flare-ups",
        weights: { flakingInflammation: 2, drySensitive: 1 },
      },
      {
        value: "none",
        label: "No obvious trigger",
        weights: { patternThinning: 1, patchyLoss: 1 },
      },
    ],
  },
  {
    key: "severity",
    questionText: "How would you describe it right now?",
    options: [
      {
        value: "mild",
        label: "Mild and manageable",
        weights: { drySensitive: 1, oilBuildUp: 1, flakingInflammation: 1 },
      },
      {
        value: "moderate",
        label: "Noticeable and bothering me",
        weights: { flakingInflammation: 1, stressShedding: 1, patternThinning: 1, tractionTension: 1 },
      },
      {
        value: "rapid_or_worsening",
        label: "It is worsening quickly or feels urgent",
        weights: { patchyLoss: 2, stressShedding: 1 },
        redFlags: ["Rapid change or worsening symptoms"],
      },
    ],
  },
  {
    key: "redFlags",
    questionText: "Are any of these happening too?",
    options: [
      {
        value: "none",
        label: "None of these",
      },
      {
        value: "eyebrow_or_eyelash_loss",
        label: "I am also noticing eyebrow or eyelash loss",
        weights: { patchyLoss: 3 },
        redFlags: ["Loss affecting eyebrows or eyelashes"],
      },
      {
        value: "crusting_or_pus",
        label: "There is crusting, oozing, or signs of infection",
        weights: { patchyLoss: 2, flakingInflammation: 1 },
        redFlags: ["Crusting, oozing, or signs of infection"],
      },
      {
        value: "sore_burning",
        label: "The scalp feels painful, hot, or burning",
        weights: { patchyLoss: 2, flakingInflammation: 1 },
        redFlags: ["Scalp pain, burning, or visible inflammation"],
      },
    ],
  },
];

function addConcernWeights(
  scoreBreakdown: Record<PublicScalpQuizConcernKey, number>,
  weights?: ConcernScoreMap
) {
  if (!weights) return;
  for (const key of Object.keys(weights) as PublicScalpQuizConcernKey[]) {
    scoreBreakdown[key] += weights[key] ?? 0;
  }
}

function getConcernRanking(scoreBreakdown: Record<PublicScalpQuizConcernKey, number>) {
  return (Object.entries(scoreBreakdown) as Array<[PublicScalpQuizConcernKey, number]>).sort((a, b) => {
    if (b[1] !== a[1]) return b[1] - a[1];
    return a[0].localeCompare(b[0]);
  });
}

function orderRedFlags(redFlags: Set<string>) {
  return Array.from(redFlags).sort((a, b) => {
    const aIndex = redFlagPriority.indexOf(a as (typeof redFlagPriority)[number]);
    const bIndex = redFlagPriority.indexOf(b as (typeof redFlagPriority)[number]);
    return (aIndex === -1 ? redFlagPriority.length : aIndex) - (bIndex === -1 ? redFlagPriority.length : bIndex);
  });
}

export function evaluatePublicScalpQuiz(answers: PublicScalpQuizAnswerMap): PublicScalpQuizResult {
  const scoreBreakdown: Record<PublicScalpQuizConcernKey, number> = {
    flakingInflammation: 0,
    oilBuildUp: 0,
    drySensitive: 0,
    stressShedding: 0,
    patternThinning: 0,
    tractionTension: 0,
    patchyLoss: 0,
  };
  const redFlags = new Set<string>();

  for (const question of publicScalpQuizDefinition) {
    const value = answers[question.key];
    if (!value) continue;
    const selectedOption = question.options.find((option) => option.value === value);
    if (!selectedOption) continue;
    addConcernWeights(scoreBreakdown, selectedOption.weights);
    for (const redFlag of selectedOption.redFlags ?? []) {
      redFlags.add(redFlag);
    }
  }

  const [primaryEntry, secondaryEntry] = getConcernRanking(scoreBreakdown);
  const primaryConcernKey = primaryEntry?.[1] ? primaryEntry[0] : "drySensitive";
  const secondaryConcernKey = secondaryEntry?.[1] ? secondaryEntry[0] : null;
  const primaryConcern = concernDefinitions[primaryConcernKey];
  const triage = redFlags.size > 0 ? "prompt" : "routine";

  return {
    headline:
      triage === "prompt"
        ? "Your answers suggest this needs prompt professional assessment."
        : `Your answers most closely match a ${primaryConcern.label.toLowerCase()}.`,
    summary:
      `${primaryConcern.summary} This quiz offers guidance only and is not a medical diagnosis.`,
    triage,
    primaryConcern: {
      key: primaryConcernKey,
      label: primaryConcern.label,
      possibleConditions: primaryConcern.possibleConditions,
    },
    secondaryConcern: secondaryConcernKey
      ? {
          key: secondaryConcernKey,
          label: concernDefinitions[secondaryConcernKey].label,
        }
      : null,
    nextSteps: primaryConcern.nextSteps.slice(0, 3),
    redFlags: orderRedFlags(redFlags),
    bookingCta: {
      href:
        triage === "prompt"
          ? `/contact?service=clinic&source=${encodeURIComponent(FEATURED_PUBLIC_QUIZ_SLUG)}&urgency=high&concern=${encodeURIComponent(
              primaryConcern.label
            )}`
          : `/contact?service=clinic&source=${encodeURIComponent(FEATURED_PUBLIC_QUIZ_SLUG)}&concern=${encodeURIComponent(
              primaryConcern.label
            )}`,
      label:
        triage === "prompt"
          ? "Book a priority scalp consultation"
          : FEATURED_PUBLIC_QUIZ_RESULT_LABEL,
    },
    scoreBreakdown,
  };
}

export function getPublicScalpQuizLeadSummary(result: PublicScalpQuizResult) {
  const followUpStep =
    result.nextSteps.find((step) => step.toLowerCase().includes("book a scalp consultation")) ??
    result.nextSteps[1] ??
    result.nextSteps[0] ??
    "";

  return [
    "Quiz source: scalp health check",
    `Likely concern: ${result.primaryConcern.label}`,
    `Triage: ${result.triage}`,
    "Top next steps:",
    result.nextSteps[0] ? `- ${result.nextSteps[0]}` : null,
    followUpStep && followUpStep !== result.nextSteps[0] ? `- ${followUpStep}` : null,
  ]
    .filter(Boolean)
    .join("\n");
}

export function getPublicScalpQuizSecondaryCta(result: PublicScalpQuizResult) {
  const likelyCondition = result.primaryConcern.possibleConditions[0] ?? "Scalp concerns";
  return {
    href: "/education/conditions",
    label: `Learn about ${likelyCondition}`,
  };
}

export function isFeaturedPublicScalpQuiz(slug: string) {
  return slug === FEATURED_PUBLIC_QUIZ_SLUG;
}

export function getPublicScalpQuizStartCta() {
  return {
    href: FEATURED_PUBLIC_QUIZ_HREF,
    label: "Start scalp health check",
  };
}

export function buildPublicScalpQuizSubmission(input: {
  quizQuestions: StoredQuizQuestion[];
  answers: StoredQuizAnswerInput[];
}): PublicScalpQuizSubmission {
  const answerMap: PublicScalpQuizAnswerMap = {};

  const attemptAnswers = input.quizQuestions
    .slice()
    .sort((a, b) => a.position - b.position)
    .map((quizQuestion, index) => {
      const definition = publicScalpQuizDefinition[index];
      const submitted = input.answers.find((answer) => answer.questionId === quizQuestion.id);
      const answerIndex = typeof submitted?.answer === "number" ? submitted.answer : -1;
      const option = definition?.options[answerIndex] ?? null;

      if (definition?.key && option?.value) {
        answerMap[definition.key] = option.value;
      }

      return {
        questionId: quizQuestion.id,
        answer: submitted?.answer ?? null,
        answerLabel: option?.label ?? null,
        optionValue: option?.value ?? null,
        isCorrect: false as const,
      };
    });

  const result = evaluatePublicScalpQuiz(answerMap);

  return {
    attemptAnswers,
    result: {
      ...result,
      resultMode: "consumer_scalp",
      secondaryCta: getPublicScalpQuizSecondaryCta(result),
    },
  };
}

export function getFeaturedPublicScalpQuizContent(): FeaturedPublicScalpQuizContent {
  return {
    slug: FEATURED_PUBLIC_QUIZ_SLUG,
    title: "Scalp Health Check",
    description:
      "A guided quiz for non-professionals who want clearer next steps around scalp discomfort, shedding, or thinning. It offers guidance only and is not a medical diagnosis.",
    passingScore: 0,
    resultsCopy: {
      low: {
        headline: "You have a useful starting picture of your scalp symptoms.",
        body: "Once you complete the quiz, you will see guidance built around likely concern patterns and next steps, not right or wrong answers.",
      },
      medium: {
        headline: "You have a useful starting picture of your scalp symptoms.",
        body: "Once you complete the quiz, you will see guidance built around likely concern patterns and next steps, not right or wrong answers.",
      },
      high: {
        headline: "You have a useful starting picture of your scalp symptoms.",
        body: "Once you complete the quiz, you will see guidance built around likely concern patterns and next steps, not right or wrong answers.",
      },
    },
    questions: publicScalpQuizDefinition.map((question) => ({
      questionText: question.questionText,
      questionType: QuestionType.MULTIPLE_CHOICE,
      options: question.options.map((option) => option.label),
      correctAnswer: 0,
      points: 1,
    })),
  };
}
