"use client";

type Props = {
  weeklyStats: { thisWeek: number; lastWeek: number };
  quizMetrics: {
    bestScore: number | null;
    bestQuizTitle: string | null;
    avgScore: number | null;
  };
  streak: number;
  nextMilestone: string | null;
  videosWatched: number;
  learningTimeMinutes: number;
};

function TrendArrow({ current, previous }: { current: number; previous: number }) {
  if (current === previous || (current === 0 && previous === 0)) return null;
  const up = current > previous;
  return (
    <span
      className={`ml-1.5 inline-flex items-center text-[10px] font-semibold ${
        up ? "text-emerald-500" : "text-red-400"
      }`}
    >
      <svg
        className={`h-3 w-3 ${up ? "" : "rotate-180"}`}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={3}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
      </svg>
      {up
        ? `+${current - previous}`
        : `${current - previous}`}
    </span>
  );
}

function formatTime(minutes: number) {
  if (minutes < 60) return `${minutes}m`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

export function LearningMetrics({
  weeklyStats,
  quizMetrics,
  streak,
  nextMilestone,
  videosWatched,
  learningTimeMinutes,
}: Props) {
  const cards = [
    {
      label: "This Week",
      value: weeklyStats.thisWeek,
      suffix: weeklyStats.thisWeek === 1 ? " lesson" : " lessons",
      extra: (
        <TrendArrow
          current={weeklyStats.thisWeek}
          previous={weeklyStats.lastWeek}
        />
      ),
      icon: (
        <svg className="h-5 w-5 text-[#fab826]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      label: "Best Quiz",
      value: quizMetrics.bestScore != null ? `${quizMetrics.bestScore}%` : "—",
      suffix: "",
      subtitle: quizMetrics.bestQuizTitle,
      icon: (
        <svg className="h-5 w-5 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
        </svg>
      ),
    },
    {
      label: "Streak",
      value: streak,
      suffix: streak === 1 ? " day" : " days",
      subtitle: streak === 0 ? "Start today!" : "Keep it up!",
      icon: (
        <svg className="h-5 w-5 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z" />
        </svg>
      ),
    },
    {
      label: "Learning Time",
      value: formatTime(learningTimeMinutes),
      suffix: "",
      icon: (
        <svg className="h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <circle cx="12" cy="12" r="9" />
          <path strokeLinecap="round" d="M12 7v5l3 3" />
        </svg>
      ),
    },
    {
      label: "Videos Watched",
      value: videosWatched,
      suffix: "",
      icon: (
        <svg className="h-5 w-5 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      label: "Avg Quiz Score",
      value: quizMetrics.avgScore != null ? `${quizMetrics.avgScore}%` : "—",
      suffix: "",
      icon: (
        <svg className="h-5 w-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
        {cards.map((card) => (
          <div
            key={card.label}
            className="rounded-xl border border-black/5 bg-white p-4 shadow-sm"
          >
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-black/[0.03]">
                {card.icon}
              </div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-black/40">
                {card.label}
              </p>
            </div>
            <div className="mt-3 flex items-baseline">
              <span className="text-2xl font-bold text-black leading-none">
                {card.value}
              </span>
              {card.suffix && (
                <span className="ml-1 text-xs text-black/40">{card.suffix}</span>
              )}
              {card.extra}
            </div>
            {card.subtitle && (
              <p className="mt-1 truncate text-xs text-black/40">
                {card.subtitle}
              </p>
            )}
          </div>
        ))}
      </div>

      {nextMilestone && (
        <div className="flex items-center gap-3 rounded-xl border border-[#fab826]/15 bg-[#fab826]/5 px-4 py-3">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#fab826]/15 text-sm">
            <svg className="h-4 w-4 text-[#fab826]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </span>
          <p className="text-sm font-medium text-[#b67400]">
            {nextMilestone}
          </p>
        </div>
      )}
    </div>
  );
}
