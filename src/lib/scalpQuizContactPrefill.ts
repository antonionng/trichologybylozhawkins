type PrefillUrgency = "low" | "normal" | "high";
type PrefillEnquiryType = "clinic" | "education" | "press" | "other";

export type ScalpQuizContactPrefill = {
  shouldAutoOpen: boolean;
  enquiryType: PrefillEnquiryType;
  urgency: PrefillUrgency;
  source: string;
  message: string;
};

export function buildContactPagePrefill(params: URLSearchParams): ScalpQuizContactPrefill | null {
  const quizPrefill = buildScalpQuizContactPrefill(params);
  if (quizPrefill) return quizPrefill;

  if (params.get("service") !== "clinic") return null;

  return {
    shouldAutoOpen: true,
    enquiryType: "clinic",
    urgency: "normal",
    source: params.get("source")?.trim() || "clinic-page",
    message: "I would like to book a trichology consultation in Knutsford.",
  };
}

export function buildScalpQuizContactPrefill(params: URLSearchParams): ScalpQuizContactPrefill | null {
  const source = params.get("source");
  if (source !== "scalp-health-check") return null;

  const concern = params.get("concern");
  const urgency = normalizeUrgency(params.get("urgency"));

  return {
    shouldAutoOpen: true,
    enquiryType: "clinic",
    urgency,
    source,
    message: concern
      ? [
          "I completed the scalp health check and would like to book with Lorraine.",
          "",
          `Likely concern: ${concern}`,
        ].join("\n")
      : "I completed the scalp health check and would like to book with Lorraine.",
  };
}

function normalizeUrgency(value: string | null): PrefillUrgency {
  if (value === "high") return "high";
  if (value === "low") return "low";
  return "normal";
}
