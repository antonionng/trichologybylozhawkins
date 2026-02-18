"use client";

import { useState } from "react";
import { VideoNotepad } from "./VideoNotepad";

type Tab = "notes" | "overview";

interface VideoRightPanelProps {
  videoProductId: string;
  learningOutcomes: string[];
  takeaways: string[];
  nextSteps: string[];
}

export function VideoRightPanel({
  videoProductId,
  learningOutcomes,
  takeaways,
  nextSteps,
}: VideoRightPanelProps) {
  const [tab, setTab] = useState<Tab>("notes");
  const hasOverview =
    learningOutcomes.length > 0 || takeaways.length > 0 || nextSteps.length > 0;

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-brand-graphite/8 bg-white shadow-sm">
      {/* Tab bar */}
      <div className="flex border-b border-brand-graphite/8">
        <button
          onClick={() => setTab("notes")}
          className={`flex-1 px-4 py-3 text-xs font-semibold uppercase tracking-[0.15em] transition-colors ${
            tab === "notes"
              ? "border-b-2 border-brand-sage text-brand-graphite"
              : "text-brand-graphite/40 hover:text-brand-graphite/60"
          }`}
        >
          My Notes
        </button>
        <button
          onClick={() => setTab("overview")}
          className={`flex-1 px-4 py-3 text-xs font-semibold uppercase tracking-[0.15em] transition-colors ${
            tab === "overview"
              ? "border-b-2 border-brand-sage text-brand-graphite"
              : "text-brand-graphite/40 hover:text-brand-graphite/60"
          }`}
        >
          Overview
        </button>
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto p-5">
        {tab === "notes" ? (
          <VideoNotepad videoProductId={videoProductId} />
        ) : hasOverview ? (
          <div className="space-y-6">
            {/* Learning Outcomes */}
            {learningOutcomes.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-sage/15">
                    <svg
                      className="h-3.5 w-3.5 text-brand-sage"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.8}
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342"
                      />
                    </svg>
                  </div>
                  <h3 className="text-sm font-semibold text-brand-graphite">
                    What You&apos;ll Learn
                  </h3>
                </div>
                <ul className="space-y-2">
                  {learningOutcomes.map((item, i) => (
                    <li key={i} className="flex gap-2">
                      <svg
                        className="mt-0.5 h-3.5 w-3.5 flex-none text-brand-sage"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={2.5}
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="m4.5 12.75 6 6 9-13.5"
                        />
                      </svg>
                      <span className="text-[13px] leading-relaxed text-brand-graphite/65">
                        {item}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Key Takeaways */}
            {takeaways.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-salmon/15">
                    <svg
                      className="h-3.5 w-3.5 text-brand-salmon"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.8}
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 18v-5.25m0 0a6.01 6.01 0 0 0 1.5-.189m-1.5.189a6.01 6.01 0 0 1-1.5-.189m3.75 7.478a12.06 12.06 0 0 1-4.5 0m3.75 2.383a14.406 14.406 0 0 1-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 1 0-7.517 0c.85.493 1.509 1.333 1.509 2.316V18"
                      />
                    </svg>
                  </div>
                  <h3 className="text-sm font-semibold text-brand-graphite">
                    Key Takeaways
                  </h3>
                </div>
                <ol className="space-y-2">
                  {takeaways.map((t, i) => (
                    <li key={i} className="flex gap-2.5">
                      <span className="flex h-5 w-5 flex-none items-center justify-center rounded-full bg-brand-salmon/10 text-[10px] font-bold text-brand-salmon">
                        {i + 1}
                      </span>
                      <span className="text-[13px] leading-relaxed text-brand-graphite/65">
                        {t}
                      </span>
                    </li>
                  ))}
                </ol>
              </div>
            )}

            {/* Next Steps */}
            {nextSteps.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-mist/20">
                    <svg
                      className="h-3.5 w-3.5 text-brand-mist"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.8}
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3 8.689c0-.864.933-1.406 1.683-.977l7.108 4.061a1.125 1.125 0 0 1 0 1.954l-7.108 4.061A1.125 1.125 0 0 1 3 16.811V8.69ZM12.75 8.689c0-.864.933-1.406 1.683-.977l7.108 4.061a1.125 1.125 0 0 1 0 1.954l-7.108 4.061a1.125 1.125 0 0 1-1.683-.977V8.69Z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-sm font-semibold text-brand-graphite">
                    Next Steps
                  </h3>
                </div>
                <div className="space-y-2">
                  {nextSteps.map((step, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-2.5 rounded-lg border border-brand-graphite/5 bg-brand-sand/40 p-3"
                    >
                      <svg
                        className="mt-0.5 h-3.5 w-3.5 flex-none text-brand-mist"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={2}
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="m8.25 4.5 7.5 7.5-7.5 7.5"
                        />
                      </svg>
                      <span className="text-[13px] leading-relaxed text-brand-graphite/65">
                        {step}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <svg
              className="h-8 w-8 text-brand-graphite/15"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25"
              />
            </svg>
            <p className="mt-3 text-xs text-brand-graphite/35">
              Overview content will appear once available.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
