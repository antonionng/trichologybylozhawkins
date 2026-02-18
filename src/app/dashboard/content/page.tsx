import { prisma } from "@/server/db/client";
import { ContentAutopilot } from "@/components/dashboard/content/ContentAutopilot";

export const dynamic = "force-dynamic";

type Props = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

const currentMonth = () => new Date().toISOString().slice(0, 7);

export default async function ContentDashboardPage({ searchParams }: Props) {
  const resolved = (await searchParams) ?? {};
  const planId =
    typeof resolved.planId === "string" ? resolved.planId : Array.isArray(resolved.planId) ? resolved.planId[0] : undefined;

  // Only show Autopilot months in the UX (plans are an internal container; users think in "months").
  const plans = await prisma.contentPlan.findMany({
    orderBy: { createdAt: "desc" },
    select: { id: true, name: true, timezone: true, tags: true },
    take: 50,
  });

  const autopilotPlans = plans.filter((plan) => {
    const tags = plan.tags as any;
    return Boolean(tags?.autopilot);
  });

  const requestedPlan = planId
    ? await prisma.contentPlan.findUnique({ where: { id: planId } })
    : null;
  const requestedIsAutopilot = Boolean((requestedPlan?.tags as any)?.autopilot);

  const activePlan = requestedPlan && requestedIsAutopilot
    ? requestedPlan
    : autopilotPlans[0]
      ? await prisma.contentPlan.findUnique({ where: { id: autopilotPlans[0].id } })
      : null;

  const activeMonth =
    (activePlan?.tags as any)?.month && typeof (activePlan?.tags as any)?.month === "string"
      ? ((activePlan?.tags as any).month as string)
      : currentMonth();

  const slots = activePlan
    ? await prisma.contentSlot.findMany({
        where: { planId: activePlan.id },
        orderBy: [{ scheduledFor: "asc" }, { createdAt: "asc" }],
        include: {
          assets: { select: { id: true } },
        },
      })
    : [];

  const posts = slots.map((slot) => ({
    id: slot.id,
    title: slot.title,
    status: slot.status,
    channel: slot.channel,
    scheduledFor: slot.scheduledFor ? slot.scheduledFor.toISOString() : null,
    assetsCount: slot.assets.length,
  }));

  return (
    <ContentAutopilot
      plans={autopilotPlans}
      activePlanId={activePlan?.id ?? null}
      activeMonth={activeMonth}
      posts={posts}
    />
  );
}