import { PrismaClient } from "@prisma/client";
import { unpublishTestCatalogItems } from "../src/server/modules/catalog/unpublishTestCatalog";

const prisma = new PrismaClient();

async function main() {
  const unpublished = await unpublishTestCatalogItems(prisma);
  console.log("Unpublished TEST Live catalog items:", unpublished);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
