export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import { prisma } from "@/server/db/client";
import { ConditionEditor } from "@/components/dashboard/education/ConditionEditor";

interface Props {
  params: { conditionId: string };
}

async function getCondition(id: string) {
  return prisma.conditionReference.findUnique({
    where: { id },
    include: {
      courses: {
        include: {
          course: { select: { id: true, title: true, slug: true } },
        },
      },
    },
  });
}

export default async function ConditionEditorPage({ params }: Props) {
  const condition = await getCondition(params.conditionId);

  if (!condition) {
    notFound();
  }

  return <ConditionEditor condition={condition} />;
}

