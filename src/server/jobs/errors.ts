export type QueueUnavailableReason =
  | "build_time_disabled"
  | "redis_unreachable"
  | "connection_missing";

export class QueueUnavailableError extends Error {
  readonly queueName: string;
  readonly reason: QueueUnavailableReason;

  constructor(queueName: string, reason: QueueUnavailableReason, message?: string) {
    super(
      message ??
        `Queue '${queueName}' is unavailable (${reason.replaceAll("_", " ")}).`
    );
    this.name = "QueueUnavailableError";
    this.queueName = queueName;
    this.reason = reason;
  }
}

export const isQueueUnavailableError = (
  error: unknown
): error is QueueUnavailableError =>
  error instanceof QueueUnavailableError ||
  (typeof error === "object" &&
    error !== null &&
    "name" in error &&
    (error as { name?: string }).name === "QueueUnavailableError");
