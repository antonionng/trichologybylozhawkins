"use client";

import { useState } from "react";

type Lesson = {
  id: string;
  title: string;
  hasVideo: boolean;
  hasDownload: boolean;
};

type Module = {
  id: string;
  index: number;
  title: string;
  description: string | null;
  lessons: Lesson[];
};

const VideoIcon = () => (
  <svg className="h-3.5 w-3.5 text-[#b67400]/50" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z" />
  </svg>
);

const DownloadIcon = () => (
  <svg className="h-3.5 w-3.5 text-[#b67400]/50" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
  </svg>
);

const ChevronIcon = ({ open }: { open: boolean }) => (
  <svg
    className={`h-4 w-4 text-black/30 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={2}
    stroke="currentColor"
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
  </svg>
);

export function CurriculumAccordion({ modules }: { modules: Module[] }) {
  const [openModules, setOpenModules] = useState<Set<string>>(
    new Set(modules.length > 0 ? [modules[0].id] : [])
  );

  const toggle = (id: string) => {
    setOpenModules((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="space-y-3">
      {modules.map((m) => {
        const isOpen = openModules.has(m.id);
        return (
          <div
            key={m.id}
            className="rounded-2xl border border-black/5 bg-white/70 transition-all hover:border-[#fab826]/30"
          >
            <button
              type="button"
              onClick={() => toggle(m.id)}
              className="flex w-full items-start justify-between gap-4 px-5 py-4 text-left"
            >
              <div className="min-w-0">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#b67400]/60">
                  Module {String(m.index + 1).padStart(2, "0")}
                </span>
                <h3 className="text-base font-bold text-black">{m.title}</h3>
                {m.description && (
                  <p className="mt-1 text-sm text-black/60 line-clamp-2">{m.description}</p>
                )}
              </div>
              <div className="flex shrink-0 items-center gap-2 pt-1">
                {m.lessons.length > 0 && (
                  <span className="rounded-full bg-black/5 px-3 py-1 text-[10px] font-bold text-black/40">
                    {m.lessons.length} {m.lessons.length === 1 ? "Lesson" : "Lessons"}
                  </span>
                )}
                <ChevronIcon open={isOpen} />
              </div>
            </button>

            {isOpen && m.lessons.length > 0 && (
              <div className="border-t border-black/5 px-5 pb-4 pt-3">
                <ul className="space-y-2">
                  {m.lessons.map((lesson, li) => (
                    <li
                      key={lesson.id}
                      className="flex items-center gap-3 rounded-xl bg-black/[0.02] px-3 py-2.5"
                    >
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#fab826]/15 text-[10px] font-bold text-[#b67400]/70">
                        {li + 1}
                      </span>
                      <span className="flex-1 text-sm text-black/70">{lesson.title}</span>
                      <div className="flex items-center gap-1.5">
                        {lesson.hasVideo && <VideoIcon />}
                        {lesson.hasDownload && <DownloadIcon />}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
