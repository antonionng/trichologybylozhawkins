"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { photography } from "@/lib/visualAssets";

type Heading = { id: string; label: string };
type Resource = { title: string; type: string };

type LessonSidebarProps = {
  headings: Heading[];
  tips: string[];
  resources: Resource[];
  readingTime: number;
  lessonType: string;
};

export function LessonSidebar({
  headings,
  tips,
  resources,
  readingTime,
  lessonType,
}: LessonSidebarProps) {
  const [activeId, setActiveId] = useState<string>("");
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    const ids = headings.map((h) => h.id);
    if (ids.length === 0) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible.length > 0) {
          setActiveId(visible[0].target.id);
        }
      },
      { rootMargin: "-80px 0px -60% 0px", threshold: 0.1 },
    );

    const elements = ids
      .map((id) => document.getElementById(id))
      .filter(Boolean) as HTMLElement[];
    elements.forEach((el) => observerRef.current!.observe(el));

    return () => observerRef.current?.disconnect();
  }, [headings]);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <aside className="hidden lg:block">
      <div className="sticky top-6 space-y-6">
        {/* Lorraine Card */}
        <div className="rounded-2xl border border-black/5 bg-white p-5 shadow-[0_10px_25px_-18px_rgba(15,23,42,0.3)]">
          <div className="flex items-center gap-3">
            <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full border-2 border-[#fab826]/30">
              <Image
                src={photography.hero.src}
                alt={photography.hero.alt}
                fill
                className="object-cover"
              />
            </div>
            <div className="min-w-0">
              <p className="font-display text-sm font-semibold text-black">
                Lorraine Hawkins
              </p>
              <p className="text-[11px] text-black/40">
                Clinical Trichologist &amp; Educator
              </p>
            </div>
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            <span className="rounded-full bg-[#fab826]/12 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#b67400]">
              {lessonType}
            </span>
            <span className="rounded-full bg-black/5 px-2.5 py-1 text-[10px] font-medium text-black/45">
              {readingTime} min read
            </span>
          </div>
        </div>

        {/* Table of Contents */}
        {headings.length > 0 && (
          <div className="rounded-2xl border border-black/5 bg-white p-5 shadow-[0_10px_25px_-18px_rgba(15,23,42,0.15)]">
            <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-black/35">
              In This Lesson
            </p>
            <nav className="space-y-0.5">
              {headings.map((h) => {
                const isActive = activeId === h.id;
                return (
                  <button
                    key={h.id}
                    onClick={() => scrollTo(h.id)}
                    className="relative flex w-full items-center rounded-lg px-3 py-1.5 text-left text-[13px] transition-colors hover:bg-black/[0.03]"
                  >
                    {isActive && (
                      <motion.div
                        layoutId="toc-active"
                        className="absolute inset-0 rounded-lg bg-[#fab826]/10"
                        transition={{
                          type: "spring",
                          stiffness: 350,
                          damping: 30,
                        }}
                      />
                    )}
                    <span
                      className={`relative z-10 line-clamp-1 ${
                        isActive
                          ? "font-medium text-[#b67400]"
                          : "text-black/50"
                      }`}
                    >
                      {h.label}
                    </span>
                  </button>
                );
              })}
            </nav>
          </div>
        )}

        {/* Lorraine's Quick Tips */}
        {tips.length > 0 && (
          <div className="rounded-2xl border border-[#fab826]/15 bg-gradient-to-br from-[#fab826]/6 to-transparent p-5">
            <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#b67400]/60">
              Lorraine&apos;s Tips
            </p>
            <div className="space-y-3">
              {tips.map((tip, i) => (
                <div key={i} className="relative pl-4">
                  <div className="absolute left-0 top-0 bottom-0 w-0.5 rounded-full bg-[#fab826]/30" />
                  <p className="text-[13px] italic leading-relaxed text-black/60">
                    &ldquo;{tip}&rdquo;
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Resource Quick Links */}
        {resources.length > 0 && (
          <div className="rounded-2xl border border-black/5 bg-white p-5 shadow-[0_10px_25px_-18px_rgba(15,23,42,0.1)]">
            <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-black/35">
              Resources
            </p>
            <div className="space-y-2">
              {resources.map((r, i) => (
                <a
                  key={i}
                  href="#lesson-resources"
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-[13px] text-black/55 transition hover:bg-black/[0.03] hover:text-black/80"
                >
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-emerald-50 text-[10px] font-bold text-emerald-600">
                    {r.type === "checklist"
                      ? "✓"
                      : r.type === "template"
                        ? "T"
                        : r.type === "worksheet"
                          ? "W"
                          : "◈"}
                  </span>
                  <span className="line-clamp-1">{r.title}</span>
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
