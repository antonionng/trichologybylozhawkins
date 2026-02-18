import Link from "next/link";
import { prisma } from "@/server/db/client";
import { Surface } from "@/components/layout/Surface";
import { ContentWizard } from "@/components/dashboard/content/ContentWizard";

export const dynamic = "force-dynamic";

type Props = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function NewContentPage({ searchParams }: Props) {
  const resolved = (await searchParams) ?? {};
  const requestedPlanId =
    typeof resolved.planId === "string" ? resolved.planId : Array.isArray(resolved.planId) ? resolved.planId[0] : undefined;

  const plans = await prisma.contentPlan.findMany({
    orderBy: { createdAt: "desc" },
    select: { id: true, name: true, tags: true },
    take: 50,
  });

  const autopilotPlans = plans.filter((plan) => Boolean((plan.tags as any)?.autopilot));
  const planOptions = autopilotPlans.map((plan) => ({ id: plan.id, name: plan.name }));
  const defaultPlanId =
    (requestedPlanId && planOptions.some((p) => p.id === requestedPlanId) ? requestedPlanId : undefined) ??
    planOptions[0]?.id ??
    "";

  return (
    <div className="space-y-6">
      <Surface variant="glass" padding="lg" className="space-y-2">
        <p className="text-xs uppercase tracking-[0.3em] text-black/40">Content Factory</p>
        <h1 className="text-2xl font-semibold text-black">Create a single post</h1>
        <p className="max-w-2xl text-sm text-black/60">
          Generate one post (copy + optional image) without running Monthly Autopilot.
        </p>
        {autopilotPlans[0]?.name ? (
          <p className="text-xs text-black/45">
            This will add the post to <span className="font-semibold text-black/70">{autopilotPlans[0].name}</span>.
          </p>
        ) : null}
        <div className="pt-2">
          <Link
            href="/dashboard/content"
            className="inline-flex items-center rounded-full border border-black/10 bg-white px-4 py-2 text-xs font-bold uppercase tracking-widest text-black/60 hover:border-black/20"
          >
            Back to calendar
          </Link>
        </div>
      </Surface>

      <Surface variant="card" padding="lg" className="bg-white/80">
        <ContentWizard
          variant="single"
          planOptions={planOptions}
          defaultPlanId={defaultPlanId}
          redirectToCalendarOnSuccess
        />
      </Surface>
    </div>
  );
}

