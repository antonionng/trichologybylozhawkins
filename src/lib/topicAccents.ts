/**
 * Topic-specific colour accents for visual variety across the marketing site.
 *
 * Usage:
 *   import { getTopicAccent } from "@/lib/topicAccents";
 *   const accent = getTopicAccent("Hormonal Health");
 *   <div className={`bg-gradient-to-br ${accent.gradient}`}>
 */

export type TopicAccent = {
  /** Light background tint, e.g. "bg-rose-100/80" */
  bg: string;
  /** Text colour, e.g. "text-rose-600" */
  text: string;
  /** Gradient stops for card hero placeholders */
  gradient: string;
  /** Dot / bullet colour */
  dot: string;
  /** Border accent */
  border: string;
};

const ACCENTS: Record<string, TopicAccent> = {
  menopause: {
    bg: "bg-rose-50",
    text: "text-rose-600",
    gradient: "from-rose-50 via-rose-100/50 to-brand-sand/20",
    dot: "bg-rose-400",
    border: "border-rose-200",
  },
  hormonal: {
    bg: "bg-rose-50",
    text: "text-rose-600",
    gradient: "from-rose-50 via-rose-100/50 to-brand-sand/20",
    dot: "bg-rose-400",
    border: "border-rose-200",
  },
  postpartum: {
    bg: "bg-amber-50",
    text: "text-amber-700",
    gradient: "from-amber-50 via-amber-100/40 to-brand-sand/20",
    dot: "bg-amber-400",
    border: "border-amber-200",
  },
  stress: {
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    gradient: "from-emerald-50 via-brand-sage/15 to-brand-sand/20",
    dot: "bg-emerald-400",
    border: "border-emerald-200",
  },
  recovery: {
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    gradient: "from-emerald-50 via-brand-sage/15 to-brand-sand/20",
    dot: "bg-emerald-400",
    border: "border-emerald-200",
  },
  scalp: {
    bg: "bg-sky-50",
    text: "text-sky-600",
    gradient: "from-sky-50 via-sky-100/40 to-brand-sand/20",
    dot: "bg-sky-400",
    border: "border-sky-200",
  },
  sensitive: {
    bg: "bg-sky-50",
    text: "text-sky-600",
    gradient: "from-sky-50 via-sky-100/40 to-brand-sand/20",
    dot: "bg-sky-400",
    border: "border-sky-200",
  },
  inflammation: {
    bg: "bg-sky-50",
    text: "text-sky-600",
    gradient: "from-sky-50 via-sky-100/40 to-brand-sand/20",
    dot: "bg-sky-400",
    border: "border-sky-200",
  },
  "hair loss": {
    bg: "bg-rose-50",
    text: "text-rose-600",
    gradient: "from-rose-50 via-rose-100/50 to-brand-sand/20",
    dot: "bg-rose-400",
    border: "border-rose-200",
  },
  dermatitis: {
    bg: "bg-amber-50",
    text: "text-amber-700",
    gradient: "from-amber-50 via-amber-100/40 to-brand-sand/20",
    dot: "bg-amber-400",
    border: "border-amber-200",
  },
  infection: {
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    gradient: "from-emerald-50 via-brand-sage/15 to-brand-sand/20",
    dot: "bg-emerald-400",
    border: "border-emerald-200",
  },
  professional: {
    bg: "bg-brand-sage/10",
    text: "text-brand-sage",
    gradient: "from-brand-sage/10 via-brand-sage/5 to-brand-sand/20",
    dot: "bg-brand-sage",
    border: "border-brand-sage/30",
  },
};

const DEFAULT_ACCENT: TopicAccent = {
  bg: "bg-brand-salmon/8",
  text: "text-brand-salmon",
  gradient: "from-brand-salmon/10 via-brand-clay/8 to-brand-sand/20",
  dot: "bg-brand-salmon",
  border: "border-brand-salmon/20",
};

/**
 * Get colour accent based on a topic string (title, category, slug, etc.).
 * Matches the first keyword found in the input.
 */
export function getTopicAccent(topic: string | null | undefined): TopicAccent {
  if (!topic) return DEFAULT_ACCENT;
  const lower = topic.toLowerCase();
  for (const [keyword, accent] of Object.entries(ACCENTS)) {
    if (lower.includes(keyword)) return accent;
  }
  return DEFAULT_ACCENT;
}

export { DEFAULT_ACCENT };
