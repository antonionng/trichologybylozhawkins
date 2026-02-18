"use client";

import { useState } from "react";
import Link from "next/link";
import { Surface } from "@/components/layout/Surface";
import { Modal } from "@/components/ui/Modal";
import { CollectionForm } from "./collections/CollectionForm";

type CmsCollection = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
};

type CmsEntry = {
  id: string;
  title: string;
  status: string;
  updatedAt: string;
  collection: {
    name: string;
  };
};

type CmsManagerProps = {
  collections: CmsCollection[];
  entries: CmsEntry[];
};

export function CmsManager({ collections, entries }: CmsManagerProps) {
  const [isCollectionModalOpen, setIsCollectionModalOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-3">
        <Surface variant="card" padding="md">
          <p className="text-[11px] uppercase tracking-[0.35em] text-black/40">Collections</p>
          <h2 className="mt-2 text-3xl font-semibold text-brand-graphite">
            {collections.length}
          </h2>
          <p className="text-xs text-black/50">Structured groups powering the public site.</p>
        </Surface>
        <Surface variant="card" padding="md">
          <p className="text-[11px] uppercase tracking-[0.35em] text-black/40">Entries</p>
          <h2 className="mt-2 text-3xl font-semibold text-brand-graphite">
            {entries.length}
          </h2>
          <p className="text-xs text-black/50">Draft + published content items.</p>
        </Surface>
        <Surface variant="card" padding="md">
          <p className="text-[11px] uppercase tracking-[0.35em] text-black/40">Ready to publish</p>
          <h2 className="mt-2 text-3xl font-semibold text-brand-graphite">
            {entries.filter((entry) => entry.status === "APPROVED").length}
          </h2>
          <p className="text-xs text-black/50">Approved entries awaiting go-live.</p>
        </Surface>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <Surface variant="card" padding="md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] uppercase tracking-[0.35em] text-black/40">
                Content architecture
              </p>
              <h1 className="text-2xl font-semibold text-black">Collections overview</h1>
            </div>
            <button
              onClick={() => setIsCollectionModalOpen(true)}
              className="text-xs font-semibold text-brand-salmon hover:text-brand-salmon/80"
            >
              + New Collection
            </button>
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {collections.map((collection) => (
              <div
                key={collection.id}
                className="rounded-2xl border border-black/5 bg-brand-ivory/70 px-4 py-3 text-sm text-black/70"
              >
                <p className="text-[11px] uppercase tracking-[0.3em] text-black/40">
                  {collection.slug}
                </p>
                <h3 className="text-base font-semibold text-black">{collection.name}</h3>
                <p className="text-xs text-black/50">
                  {collection.description ?? "Structured content ready for publishing."}
                </p>
              </div>
            ))}
            {collections.length === 0 ? (
              <div className="flex flex-col items-start gap-3 col-span-full rounded-xl border border-dashed border-black/10 bg-black/5 p-6">
                <div>
                  <h4 className="font-semibold text-black">No collections yet</h4>
                  <p className="mt-1 max-w-md text-sm text-black/60">
                    Collections define the structure of your content (e.g. &quot;Blog Posts&quot;,
                    &quot;Case Studies&quot;, &quot;Services&quot;). Create your first collection to
                    start adding content entries.
                  </p>
                </div>
                <button
                  onClick={() => setIsCollectionModalOpen(true)}
                  className="rounded-full bg-[#fab826] px-5 py-2 text-xs font-bold uppercase tracking-widest text-[#7d4e00] shadow-sm hover:bg-[#e5a720]"
                >
                  Create First Collection
                </button>
              </div>
            ) : null}
          </div>
        </Surface>
        <Surface variant="card" padding="md">
          <p className="text-[11px] uppercase tracking-[0.35em] text-black/40">Workflows</p>
          <h2 className="text-xl font-semibold text-black">Publishing checklist</h2>
          <ul className="mt-4 space-y-3 text-sm text-black/70">
            <li>• Attach hero media and alt text to CMS entries.</li>
            <li>• Sync approved entries to the marketing site.</li>
            <li>• Trigger AI copy refresh for stale content (&gt;60 days).</li>
            <li>• Export approved slots to scheduling tools.</li>
          </ul>
        </Surface>
      </div>

      <Surface variant="card" padding="md" className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-[0.35em] text-black/40">Editorial queue</p>
            <h2 className="text-xl font-semibold text-black">Latest entries</h2>
          </div>
          <span className="text-xs text-black/50">
            Showing {Math.min(12, entries.length)} of {entries.length}
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full border-separate border-spacing-y-2 text-left text-sm">
            <thead className="text-xs uppercase tracking-[0.3em] text-black/40">
              <tr>
                <th className="px-3 py-2">Title</th>
                <th className="px-3 py-2">Collection</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Updated</th>
              </tr>
            </thead>
            <tbody>
              {entries.slice(0, 12).map((entry) => (
                <tr key={entry.id} className="rounded-2xl bg-white/80 text-black">
                  <td className="px-3 py-2 font-semibold">{entry.title}</td>
                  <td className="px-3 py-2 text-black/70">{entry.collection.name}</td>
                  <td className="px-3 py-2">
                    <span className="rounded-full border border-brand-salmon/30 px-2 py-0.5 text-[11px] uppercase tracking-[0.3em] text-brand-salmon">
                      {entry.status}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-black/60">
                    {new Date(entry.updatedAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {entries.length === 0 ? (
            <p className="mt-4 text-sm text-black/60">
              Draft articles, course descriptions, and FAQs will surface here once created.
            </p>
          ) : null}
        </div>
      </Surface>

      <Modal
        isOpen={isCollectionModalOpen}
        onClose={() => setIsCollectionModalOpen(false)}
        size="md"
      >
        <div className="mb-6">
          <p className="text-[11px] uppercase tracking-[0.35em] text-black/40">
            Content Architecture
          </p>
          <h2 className="text-xl font-semibold text-black">New Collection</h2>
        </div>
        <CollectionForm
          onSuccess={() => setIsCollectionModalOpen(false)}
          onCancel={() => setIsCollectionModalOpen(false)}
        />
      </Modal>
    </div>
  );
}
