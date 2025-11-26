import { prisma } from "@/server/db/client";
import { Surface } from "@/components/layout/Surface";

export const dynamic = 'force-dynamic';

const INTROS = [
  {
    title: "CRM Signals",
    description:
      "Monitor active deals, new leads, and follow-up momentum from the unified pipeline.",
  },
  {
    title: "Education Conversion",
    description:
      "Track course enquiries, enrollments, and seat availability to optimise revenue unlock.",
  },
  {
    title: "Content & Comms",
    description:
      "Coordinate CMS publishing, triggered automations, and AI assisted copy all in one place.",
  },
];

export default async function DashboardHome() {
  const [contactCount, dealCount, enrollmentCount, pendingTasks] = await Promise.all([
    prisma.contact.count(),
    prisma.deal.count(),
    prisma.enrollment.count(),
    prisma.task.count({ where: { status: "PENDING" } }),
  ]);

  const metrics = [
    { label: "Contacts", value: contactCount },
    { label: "Active Deals", value: dealCount },
    { label: "Enrollments", value: enrollmentCount },
    { label: "Open Tasks", value: pendingTasks },
  ];

  return (
    <div className="space-y-6">
      <Surface variant="glass" padding="lg" className="space-y-6">
        <div className="flex flex-col gap-2">
          <p className="text-xs uppercase tracking-[0.3em] text-black/40">
            Command overview
          </p>
          <h1 className="text-3xl font-semibold text-black">
            Welcome back to the control centre
          </h1>
          <p className="max-w-2xl text-sm text-black/70">
            Keep the Bunny at Home experience premium at every touchpoint. Review today&apos;s
            momentum, resolve blockers, and deploy fresh campaigns from this hub.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {metrics.map((metric) => (
            <div
              key={metric.label}
              className="rounded-lg border border-black/5 bg-white/60 p-5 shadow-sm"
            >
              <p className="text-xs uppercase tracking-[0.2em] text-black/40">
                {metric.label}
              </p>
              <p className="mt-2 text-3xl font-semibold text-[#bf7c00]">{metric.value}</p>
            </div>
          ))}
        </div>
      </Surface>

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2 space-y-4">
          {INTROS.map((intro) => (
            <Surface key={intro.title} variant="card" padding="lg" className="bg-white/80">
              <h2 className="text-xl font-semibold text-black">{intro.title}</h2>
              <p className="mt-2 text-sm text-black/60">{intro.description}</p>
            </Surface>
          ))}
        </div>
        <Surface variant="glass" padding="lg" className="bg-white/70">
          <h3 className="text-lg font-semibold text-black">Pro Tips</h3>
          <ul className="mt-3 space-y-3 text-sm text-black/70">
            <li>
              • Sync your Stripe webhook to `/api/education/fulfillment` to auto-enable course
              access on successful payments.
            </li>
            <li>
              • Use AI Studio templates to rapidly generate fresh lesson summaries and campaign
              subject lines.
            </li>
            <li>
              • Keep enquiries warm: log follow-ups in CRM to trigger personalised automations.
            </li>
          </ul>
        </Surface>
      </div>
    </div>
  );
}

