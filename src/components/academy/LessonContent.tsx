"use client";

import type { ReactNode } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function HeadingWithId({
  level,
  children,
}: {
  level: 2 | 3;
  children: ReactNode;
}) {
  const text =
    typeof children === "string"
      ? children
      : Array.isArray(children)
        ? children
            .map((c) => (typeof c === "string" ? c : ""))
            .join("")
        : "";
  const id = slugify(text);
  const Tag = level === 2 ? "h2" : "h3";
  return <Tag id={id}>{children}</Tag>;
}

export function LessonContent({ text }: { text: string }) {
  return (
    <div className="prose prose-lg max-w-none prose-headings:font-display prose-headings:text-black/90 prose-h2:text-xl prose-h2:mt-8 prose-h2:mb-3 prose-h3:text-lg prose-h3:mt-6 prose-h3:mb-2 prose-p:text-black/75 prose-p:leading-relaxed prose-strong:text-black/90 prose-ul:text-black/75 prose-ol:text-black/75 prose-li:marker:text-[#fab826] prose-blockquote:border-l-[#fab826] prose-blockquote:text-black/60 prose-blockquote:not-italic">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h2: ({ children }) => (
            <HeadingWithId level={2}>{children}</HeadingWithId>
          ),
          h3: ({ children }) => (
            <HeadingWithId level={3}>{children}</HeadingWithId>
          ),
        }}
      >
        {text}
      </ReactMarkdown>
    </div>
  );
}
