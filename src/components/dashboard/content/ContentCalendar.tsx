"use client";

import clsx from "clsx";
import { useMemo } from "react";
import { ContentChannel, ContentSlotStatus } from "@prisma/client";

export type CalendarPost = {
  id: string;
  title: string;
  status: ContentSlotStatus;
  channel: ContentChannel;
  scheduledFor: string | null;
  assetsCount: number;
};

type ContentCalendarProps = {
  month: string; // YYYY-MM
  timezone: string;
  posts: CalendarPost[];
  onSelectPost?: (postId: string) => void;
};

const startOfMonth = (month: string) => new Date(`${month}-01T00:00:00Z`);

const formatDayKey = (date: Date) => date.toISOString().slice(0, 10);

const buildMonthGrid = (month: string) => {
  const first = startOfMonth(month);
  const year = first.getUTCFullYear();
  const mon = first.getUTCMonth();
  const firstWeekday = first.getUTCDay(); // 0-6, Sunday-based
  const gridStart = new Date(Date.UTC(year, mon, 1 - firstWeekday));

  const days: Date[] = [];
  for (let i = 0; i < 42; i += 1) {
    days.push(new Date(Date.UTC(gridStart.getUTCFullYear(), gridStart.getUTCMonth(), gridStart.getUTCDate() + i)));
  }

  return {
    monthIndex: mon,
    year,
    days,
  };
};

const statusLabel: Record<ContentSlotStatus, string> = {
  DRAFT: "Needs changes",
  NEEDS_REVIEW: "Needs review",
  APPROVED: "Approved",
  SCHEDULED: "Scheduled",
  PUBLISHED: "Published",
  ARCHIVED: "Archived",
};

const statusClasses: Record<ContentSlotStatus, string> = {
  DRAFT: "border-black/10 text-black/60 bg-white",
  NEEDS_REVIEW: "border-[#fab826]/30 text-[#7d4e00] bg-[#fab826]/10",
  APPROVED: "border-[#c1d780]/40 text-black/70 bg-[#c1d780]/20",
  SCHEDULED: "border-[#80ccdd]/40 text-black/70 bg-[#80ccdd]/20",
  PUBLISHED: "border-black/10 text-black/70 bg-black/5",
  ARCHIVED: "border-black/10 text-black/40 bg-black/5",
};

export function ContentCalendar({ month, timezone, posts, onSelectPost }: ContentCalendarProps) {
  const grid = useMemo(() => buildMonthGrid(month), [month]);

  const postsByDay = useMemo(() => {
    const map = new Map<string, CalendarPost[]>();
    for (const post of posts) {
      if (!post.scheduledFor) continue;
      const dayKey = post.scheduledFor.slice(0, 10);
      const existing = map.get(dayKey) ?? [];
      existing.push(post);
      map.set(dayKey, existing);
    }
    for (const value of map.values()) {
      value.sort((a, b) => (a.scheduledFor ?? "").localeCompare(b.scheduledFor ?? ""));
    }
    return map;
  }, [posts]);

  const monthName = useMemo(() => {
    const date = startOfMonth(month);
    return new Intl.DateTimeFormat(undefined, {
      month: "long",
      year: "numeric",
      timeZone: "UTC",
    }).format(date);
  }, [month]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[11px] uppercase tracking-[0.35em] text-black/40">Calendar</p>
          <h2 className="text-xl font-semibold text-black">{monthName}</h2>
          <p className="text-xs text-black/50">Timezone: {timezone}</p>
        </div>
        <div className="hidden sm:flex items-center gap-2 text-[11px] uppercase tracking-[0.3em] text-black/40">
          <span>Sun</span>
          <span>Mon</span>
          <span>Tue</span>
          <span>Wed</span>
          <span>Thu</span>
          <span>Fri</span>
          <span>Sat</span>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2">
        {grid.days.map((day) => {
          const inMonth = day.getUTCMonth() === grid.monthIndex;
          const dayKey = formatDayKey(day);
          const dayPosts = postsByDay.get(dayKey) ?? [];

          return (
            <div
              key={dayKey}
              className={clsx(
                "min-h-[112px] rounded-2xl border p-2",
                inMonth ? "border-black/5 bg-white/70" : "border-black/5 bg-white/40"
              )}
            >
              <div className="flex items-center justify-between">
                <span
                  className={clsx(
                    "text-xs font-semibold",
                    inMonth ? "text-black/70" : "text-black/35"
                  )}
                >
                  {day.getUTCDate()}
                </span>
                {dayPosts.length ? (
                  <span className="text-[10px] text-black/40">{dayPosts.length}</span>
                ) : null}
              </div>

              <div className="mt-2 space-y-2">
                {dayPosts.slice(0, 2).map((post) => (
                  <button
                    key={post.id}
                    type="button"
                    onClick={() => onSelectPost?.(post.id)}
                    className="w-full text-left"
                  >
                    <div className="rounded-xl border border-black/5 bg-white px-2 py-2 shadow-sm hover:bg-black/[0.01]">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-xs font-semibold text-black line-clamp-2">
                          {post.title}
                        </p>
                        <span
                          className={clsx(
                            "shrink-0 rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-[0.25em]",
                            statusClasses[post.status]
                          )}
                        >
                          {statusLabel[post.status]}
                        </span>
                      </div>
                      <div className="mt-1 flex items-center justify-between text-[10px] uppercase tracking-[0.25em] text-black/40">
                        <span>{post.channel}</span>
                        <span>{post.assetsCount} assets</span>
                      </div>
                    </div>
                  </button>
                ))}
                {dayPosts.length > 2 ? (
                  <p className="text-[11px] text-black/45">
                    + {dayPosts.length - 2} more
                  </p>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}


