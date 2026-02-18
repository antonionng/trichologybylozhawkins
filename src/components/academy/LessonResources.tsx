"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type Resource = {
  title: string;
  type: string;
  content: string;
};

const TYPE_LABELS: Record<string, string> = {
  checklist: "Checklist",
  template: "Template",
  framework: "Framework",
  worksheet: "Worksheet",
  "quick-reference": "Quick Reference",
};

function ResourceCard({ resource }: { resource: Resource }) {
  const [expanded, setExpanded] = useState(false);
  const label = TYPE_LABELS[resource.type] ?? resource.type;

  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    printWindow.document.write(`<!DOCTYPE html>
<html><head><title>${resource.title}</title>
<style>
  body { font-family: Georgia, serif; max-width: 700px; margin: 2rem auto; padding: 0 1rem; color: #1a1a1a; line-height: 1.6; }
  h1 { font-size: 1.4rem; border-bottom: 2px solid #fab826; padding-bottom: 0.5rem; }
  h2 { font-size: 1.1rem; margin-top: 1.5rem; }
  h3 { font-size: 1rem; }
  table { width: 100%; border-collapse: collapse; margin: 1rem 0; font-size: 0.85rem; }
  th, td { border: 1px solid #ccc; padding: 6px 10px; text-align: left; }
  th { background: #f5f5f5; }
  ul, ol { padding-left: 1.5rem; }
  li { margin-bottom: 0.3rem; }
  @media print { body { margin: 1cm; } }
</style></head><body>
<h1>${resource.title}</h1>
<div>${printWindow.document.createElement("div").innerHTML}</div>
</body></html>`);
    const container = printWindow.document.querySelector("div");
    if (container) {
      container.innerHTML = resource.content
        .replace(/^## /gm, "<h2>")
        .replace(/^### /gm, "<h3>")
        .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
        .replace(/\n/g, "<br>");
    }
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <div className="rounded-2xl border border-black/5 bg-white shadow-[0_4px_12px_-6px_rgba(15,23,42,0.15)]">
      <button
        onClick={() => setExpanded((v) => !v)}
        className="flex w-full items-center justify-between gap-3 px-6 py-4 text-left transition hover:bg-black/[0.02]"
      >
        <div className="flex items-center gap-3">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#fab826]/15 text-sm font-bold text-[#b67400]">
            {resource.type === "checklist" ? "✓" : resource.type === "template" ? "T" : resource.type === "worksheet" ? "W" : "◈"}
          </span>
          <div>
            <p className="font-semibold text-black">{resource.title}</p>
            <p className="text-xs text-black/40">{label}</p>
          </div>
        </div>
        <span className="text-sm text-black/30">{expanded ? "▲" : "▼"}</span>
      </button>

      {expanded && (
        <div className="border-t border-black/5 px-6 py-5">
          <div className="prose prose-sm max-w-none prose-headings:text-black/90 prose-p:text-black/70 prose-strong:text-black/85 prose-th:text-black/70 prose-td:text-black/60 prose-li:marker:text-[#fab826]">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {resource.content}
            </ReactMarkdown>
          </div>
          <div className="mt-4 flex justify-end">
            <button
              onClick={handlePrint}
              className="rounded-xl border border-black/10 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.15em] text-black/50 transition hover:border-[#fab826]/40 hover:text-[#b67400]"
            >
              Print Resource
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export function LessonResources({ resources }: { resources: Resource[] }) {
  if (resources.length === 0) return null;

  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-black/40">
          Practical Resources
        </p>
        <h2 className="text-xl font-semibold text-black">
          Templates & Tools
        </h2>
        <p className="mt-1 text-sm text-black/50">
          Printable resources to use in your practice
        </p>
      </div>
      <div className="space-y-3">
        {resources.map((r, i) => (
          <ResourceCard key={i} resource={r} />
        ))}
      </div>
    </div>
  );
}
