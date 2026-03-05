import { getServerEnv } from "../src/server/schema/env";
import { prisma } from "../src/server/db/client";

function assertPrismaDelegates() {
  const hasVideoProduct = "videoProduct" in (prisma as object);
  const hasVideoProductPrice = "videoProductPrice" in (prisma as object);

  if (!hasVideoProduct || !hasVideoProductPrice) {
    throw new Error(
      "Prisma Client is missing VideoProduct delegates. Run `npm run prisma:generate` before deploy."
    );
  }
}

function main() {
  getServerEnv();
  assertPrismaDelegates();
  console.log("Environment check passed.");
}

main();
