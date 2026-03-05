import { QueueUnavailableError, isQueueUnavailableError } from "@/server/jobs/errors";

describe("queue errors", () => {
  it("detects queue-unavailable errors", () => {
    const err = new QueueUnavailableError("email", "redis_unreachable");
    expect(isQueueUnavailableError(err)).toBe(true);
  });

  it("does not misclassify normal errors", () => {
    expect(isQueueUnavailableError(new Error("boom"))).toBe(false);
  });
});
