import { listGenerations, listPromptTemplates } from "@/server/modules/ai/service";
import { Surface } from "@/components/layout/Surface";
import { TemplateForm } from "@/components/dashboard/ai/TemplateForm";
import { GenerateForm } from "@/components/dashboard/ai/GenerateForm";

export default async function AiStudioPage() {
  const templates = await listPromptTemplates();
  const generations = await listGenerations(12);

  return (
    <div className="space-y-6">
      <Surface variant="glass" padding="lg" className="space-y-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-black/40">
            AI Studio
          </p>
          <h1 className="text-2xl font-semibold text-black">Content acceleration</h1>
          <p className="text-sm text-black/60">
            Calibrate on-brand prompts, draft copy, and enrich course materials faster. Every run is
            versioned with feedback loops for continuous refinement.
          </p>
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <Surface variant="card" padding="lg" className="bg-white/80">
            <h2 className="text-lg font-semibold text-black">Prompt template</h2>
            <p className="mt-1 text-xs text-black/60">
              Set reusable recipes for course teasers, lesson outlines, and campaign copy.
            </p>
            <div className="mt-4">
              <TemplateForm />
            </div>
          </Surface>
          <Surface variant="card" padding="lg" className="bg-white/80">
            <h2 className="text-lg font-semibold text-black">Generate draft</h2>
            <p className="mt-1 text-xs text-black/60">
              Queue content and review outputs below once the worker completes.
            </p>
            <div className="mt-4">
              <GenerateForm
                templates={templates.map((template) => ({
                  id: template.id,
                  name: template.name,
                }))}
              />
            </div>
          </Surface>
        </div>
      </Surface>

      <Surface variant="card" padding="lg" className="bg-white/80 space-y-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-black/40">Recent drafts</p>
          <h2 className="text-xl font-semibold text-black">Generation history</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {generations.map((generation) => (
            <div
              key={generation.id}
              className="rounded-lg border border-black/5 bg-white/70 p-5 shadow-sm"
            >
              <p className="text-xs uppercase tracking-[0.2em] text-[#bf7c00]">
                {generation.status}
              </p>
              <p className="mt-1 text-sm font-semibold text-black">
                {generation.template?.name ?? "Ad-hoc prompt"}
              </p>
              <p className="mt-2 text-xs text-black/50">
                {generation.createdAt.toLocaleString()}
              </p>
              {generation.output ? (
                <pre className="mt-3 max-h-48 overflow-auto rounded-md bg-black/5 p-3 text-xs text-black/80">
                  {JSON.stringify(generation.output, null, 2)}
                </pre>
              ) : (
                <p className="mt-3 text-xs text-black/50">
                  Awaiting worker completion. Refresh once the queue processes.
                </p>
              )}
            </div>
          ))}
          {generations.length === 0 ? (
            <div className="rounded-lg border border-dashed border-black/10 bg-white/60 p-6 text-sm text-black/60">
              Queue your first prompt above to see drafts appear here.
            </div>
          ) : null}
        </div>
      </Surface>
    </div>
  );
}

