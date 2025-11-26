import { listCollections, listEntries } from "@/server/modules/cms/service";
import { Surface } from "@/components/layout/Surface";

export default async function CmsDashboard() {
  const [collections, entries] = await Promise.all([
    listCollections(),
    listEntries(undefined),
  ]);

  return (
    <div className="space-y-6">
      <Surface variant="glass" padding="lg" className="space-y-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-black/40">
            Content architecture
          </p>
          <h1 className="text-2xl font-semibold text-black">Collections & Publishing</h1>
          <p className="text-sm text-black/60">
            Keep your education hub, blog, and sales assets organised. Entries stay versioned and
            ready for AI-assisted updates.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {collections.map((collection) => (
            <div
              key={collection.id}
              className="rounded-lg border border-black/5 bg-white/70 p-5 shadow-sm"
            >
              <p className="text-xs uppercase tracking-[0.2em] text-[#bf7c00]">
                {collection.slug}
              </p>
              <h3 className="mt-2 text-lg font-semibold text-black">{collection.name}</h3>
              <p className="mt-2 text-sm text-black/60">
                {collection.description ?? "Structured content ready for publishing."}
              </p>
            </div>
          ))}
          {collections.length === 0 ? (
            <div className="rounded-lg border border-dashed border-black/10 bg-white/40 p-6 text-sm text-black/60">
              No collections yet. Use the API to register your first collection to unlock the editor.
            </div>
          ) : null}
        </div>
      </Surface>

      <Surface variant="card" padding="lg" className="space-y-4 bg-white/80">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-black/40">Latest entries</p>
            <h2 className="text-xl font-semibold text-black">Editorial queue</h2>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full border-separate border-spacing-y-2 text-left text-sm">
            <thead className="text-xs uppercase tracking-[0.2em] text-black/40">
              <tr>
                <th className="px-3 py-2">Title</th>
                <th className="px-3 py-2">Collection</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Updated</th>
              </tr>
            </thead>
            <tbody>
              {entries.slice(0, 12).map((entry) => (
                <tr key={entry.id} className="rounded-lg bg-white/65 text-black">
                  <td className="px-3 py-2 font-medium">{entry.title}</td>
                  <td className="px-3 py-2 text-black/70">{entry.collection.name}</td>
                  <td className="px-3 py-2 text-xs uppercase tracking-[0.2em] text-[#bf7c00]">
                    {entry.status}
                  </td>
                  <td className="px-3 py-2 text-black/60">
                    {entry.updatedAt.toLocaleDateString()}
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
    </div>
  );
}

