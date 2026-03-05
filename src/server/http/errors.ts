import { NextResponse } from "next/server";
import { isQueueUnavailableError } from "@/server/jobs/errors";

export const apiErrorResponse = (error: unknown, fallbackMessage: string) => {
  const message = error instanceof Error ? error.message : fallbackMessage;
  const status = isQueueUnavailableError(error) ? 503 : 400;
  return NextResponse.json({ error: message }, { status });
};
