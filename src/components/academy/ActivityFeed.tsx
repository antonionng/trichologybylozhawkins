"use client";

type ActivityItem = {
  type: "lesson" | "quiz";
  title: string;
  context: string;
  date: string;
  score?: number;
  passed?: boolean;
};

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days}d ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 4) return `${weeks}w ago`;
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
  });
}

export function ActivityFeed({ items }: { items: ActivityItem[] }) {
  if (items.length === 0) return null;

  return (
    <div className="rounded-2xl border border-black/5 bg-white shadow-sm">
      <div className="border-b border-black/5 px-5 py-3">
        <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-black/40">
          Recent Activity
        </p>
      </div>
      <div className="divide-y divide-black/[0.04]">
        {items.map((item, i) => (
          <div key={i} className="flex items-start gap-3 px-5 py-3.5">
            <div
              className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
                item.type === "lesson"
                  ? "bg-emerald-100 text-emerald-600"
                  : item.passed
                    ? "bg-purple-100 text-purple-600"
                    : "bg-red-50 text-red-400"
              }`}
            >
              {item.type === "lesson" ? (
                <svg
                  className="h-3.5 w-3.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              ) : (
                <svg
                  className="h-3.5 w-3.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-black leading-snug">
                {item.type === "lesson" ? "Completed: " : "Quiz: "}
                {item.title}
              </p>
              <p className="mt-0.5 text-xs text-black/45">
                {item.type === "lesson" ? (
                  item.context
                ) : (
                  <>
                    Score: {item.score}%
                    {item.passed != null && (
                      <span
                        className={`ml-1.5 font-semibold ${
                          item.passed ? "text-emerald-500" : "text-red-400"
                        }`}
                      >
                        {item.passed ? "Passed" : "Not passed"}
                      </span>
                    )}
                  </>
                )}
              </p>
            </div>

            <span className="shrink-0 text-[10px] text-black/30">
              {relativeTime(item.date)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
