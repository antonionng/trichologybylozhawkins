import { PrismaClient, ShopCategoryStatus, ShopProductStatus } from "@prisma/client";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";

const prisma = new PrismaClient();
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false, autoRefreshToken: false } },
);
const bucket = process.env.SUPABASE_STORAGE_BUCKET || "knowledge-source";

const asset = (name: string) =>
  path.resolve(
    "/Users/ant/.cursor/projects/Users-ant-Documents-LorraineHawkin/assets",
    name,
  );

const IMAGE_MAP = {
  revitalize: asset("WhatsApp_Image_2026-03-02_at_13.52.22__3_-d1a74f06-e929-4603-b7b9-738958d76d12.png"),
  color: asset("WhatsApp_Image_2026-03-02_at_13.52.22__1_-1e562e3a-480f-4549-ab10-1981c3539348.png"),
  densifying: asset("WhatsApp_Image_2026-03-02_at_13.52.22__6_-b5abe68c-9615-4532-b576-7328d73cb5c5.png"),
  hydrating: asset("WhatsApp_Image_2026-03-02_at_13.52.22__5_-30da4ec7-2f44-494b-9e42-d002308cd189.png"),
  masks: asset("WhatsApp_Image_2026-03-02_at_13.52.22__4_-8c05a3f0-beab-45b9-8cd6-d0b5ec1fbb94.png"),
};

const categories = [
  { name: "Shampoo", slug: "shampoo", position: 0 },
  { name: "Conditioner", slug: "conditioner", position: 1 },
  { name: "Masks", slug: "masks", position: 2 },
  { name: "Treatment Styling", slug: "treatment-styling", position: 3 },
];

const products = [
  {
    slug: "revitalize-shampoo",
    name: "Revitalize Shampoo",
    categorySlug: "shampoo",
    price: 19,
    shortDescription: "Gently cleanses and revitalizes scalp and hair.",
    description:
      "This advanced Superfood formula gently cleanses and stimulates the scalp, leaving it feeling both refreshed and soothed.",
    perfectFor: "all hair types",
    keyIngredients: ["Amla Fruit Extract", "Wheatgrass Extract", "Horsetail Extract"],
    imageKey: "revitalize" as const,
  },
  {
    slug: "revitalize-conditioner",
    name: "Revitalize Conditioner",
    categorySlug: "conditioner",
    price: 19,
    shortDescription: "Refreshing partner to Revitalize Shampoo.",
    description:
      "Perfectly partnered to the shampoo, this conditioner is designed to further refresh the scalp using nourishing combinations of Amla Horsetail and Wheatgrass.",
    perfectFor: "all hair types",
    keyIngredients: ["Amla Fruit Extract", "Wheatgrass Extract", "Horsetail Extract"],
    imageKey: "revitalize" as const,
  },
  {
    slug: "color-shampoo",
    name: "Color Shampoo",
    categorySlug: "shampoo",
    price: 20,
    shortDescription: "Protects color depth and vibrancy.",
    description:
      "This unique blend of Quinoa seed extract, Sunflower seed oil and Amla fruit extract helps shield your hair from color fade, preserving both color depth and vibrancy.",
    perfectFor: "bleached & coloured hair",
    keyIngredients: ["Amla Fruit Extract", "Hydrolysed Quinoa Protein", "Zinc Gloconate"],
    imageKey: "color" as const,
  },
  {
    slug: "color-conditioner",
    name: "Color Conditioner",
    categorySlug: "conditioner",
    price: 20,
    shortDescription: "Nourishes while helping protect color vibrancy.",
    description:
      "Complimenting the nourishing benefits of Color Shampoo, this Conditioner also contains a unique blend of Amla fruit and Quinoa seed extracts combined with Sunflower seed oil.",
    perfectFor: "bleached & coloured hair",
    keyIngredients: ["Amla Fruit Extract", "Hydrolysed Quinoa Protein", "Zinc Gloconate"],
    imageKey: "color" as const,
  },
  {
    slug: "densifying-shampoo",
    name: "Densifying Shampoo",
    categorySlug: "shampoo",
    price: 22,
    shortDescription: "Deep-cleansing support for fine and thinning hair.",
    description:
      "An advanced technology complex, perfect for fine and thinning hair. This Superfood formula deeply cleanses both hair and scalp to promote hair growth and leave hair feeling thicker and stronger.",
    perfectFor: "fine, limp and thinning hair",
    keyIngredients: ["Amla", "Biotin", "Saw Palmetto"],
    imageKey: "densifying" as const,
  },
  {
    slug: "densifying-conditioner",
    name: "Densifying Conditioner",
    categorySlug: "conditioner",
    price: 22,
    shortDescription: "Light nourishment for fine and thinning hair.",
    description:
      "A similarly advanced technology, this Superfood complex is perfect for fine and thinning hair. Enriched with Amla, Biotin and Saw Palmetto extract to densify the hair whilst lightly nourishing both hair and scalp.",
    perfectFor: "fine, limp and thinning hair",
    keyIngredients: ["Amla", "Biotin", "Saw Palmetto"],
    imageKey: "densifying" as const,
  },
  {
    slug: "hydrating-shampoo",
    name: "Hydrating Shampoo",
    categorySlug: "shampoo",
    price: 21,
    shortDescription: "Rich moisture for dry, course or brittle hair.",
    description:
      "This unique formula, richly infused with Certified Organic Samoa and Babassu Oils delivers instant moisture to dry, course or brittle hair.",
    perfectFor: "dry and course hair",
    keyIngredients: ["Hydrolysed Pea Protein", "Organic Samoa Oil", "Organic Babassu Oil"],
    imageKey: "hydrating" as const,
  },
  {
    slug: "hydrating-conditioner",
    name: "Hydrating Conditioner",
    categorySlug: "conditioner",
    price: 21,
    shortDescription: "Moisture-rich conditioner for dry lengths.",
    description:
      "A Superfood conditioner enriched with the same Certified Organic Samoa (Coconut) and Babassu Oils incorporated in the shampoo, delivers moisture to nurture dry, course and brittle lengths.",
    perfectFor: "dry, course and brittle hair",
    keyIngredients: ["Hydrolysed Pea Protein", "Organic Samoa Oil", "Organic Babassu Oil"],
    imageKey: "hydrating" as const,
  },
  {
    slug: "intense-repair-mask",
    name: "Intense Repair Mask",
    categorySlug: "masks",
    price: 38,
    shortDescription: "Deep treatment for very damaged hair.",
    description:
      "A richly deep and luxurious conditioning treatment for very damaged hair in need of repair. A blend of advanced Superfood proteins transform extremely damaged hair into weightless, sleek strands.",
    perfectFor: "hair in need of rescue",
    keyIngredients: ["Silk Amino Acid", "Horsetail Extract", "Wheatgrass Extract"],
    imageKey: "masks" as const,
  },
  {
    slug: "intense-hydrating-mask",
    name: "Intense Hydrating Mask",
    categorySlug: "masks",
    price: 39,
    shortDescription: "Superfood hydration with botanical oils.",
    description:
      "Full of Superfood Proteins, and formulated from naturally derived ingredients to provide intense hydration. This moisturising treatment is infused with Organic Samoa and Babassu Oils.",
    perfectFor: "dry and thirsty hair",
    keyIngredients: [
      "Silk Amino Acid",
      "Horsetail Extract",
      "Wheatgrass Extract",
      "Certified Organic Samoa (Coconut) Oil",
      "Hydrolysed Pea Protein",
      "Wheat Protein",
      "Pineapple Enzyme Extract",
    ],
    imageKey: "masks" as const,
  },
];

async function ensureMediaForProduct(slug: string, imagePath: string) {
  const storagePath = `shop-catalog/${slug}/hero.png`;
  const bytes = new Uint8Array(await readFile(imagePath));
  const { error } = await supabase.storage.from(bucket).upload(storagePath, bytes, {
    contentType: "image/png",
    upsert: true,
  });
  if (error) {
    throw error;
  }

  return prisma.mediaAsset.upsert({
    where: { path: storagePath },
    update: {
      title: `${slug} hero`,
      mimeType: "image/png",
      sizeBytes: bytes.length,
    },
    create: {
      title: `${slug} hero`,
      path: storagePath,
      mimeType: "image/png",
      sizeBytes: bytes.length,
    },
  });
}

async function main() {
  const categoryMap = new Map<string, string>();

  for (const category of categories) {
    const created = await prisma.shopCategory.upsert({
      where: { slug: category.slug },
      update: {
        name: category.name,
        position: category.position,
        status: ShopCategoryStatus.ACTIVE,
      },
      create: {
        ...category,
        status: ShopCategoryStatus.ACTIVE,
      },
    });
    categoryMap.set(category.slug, created.id);
  }

  for (const product of products) {
    const media = await ensureMediaForProduct(product.slug, IMAGE_MAP[product.imageKey]);
    await prisma.shopProduct.upsert({
      where: { slug: product.slug },
      update: {
        name: product.name,
        categoryId: categoryMap.get(product.categorySlug),
        price: product.price,
        currency: "GBP",
        shortDescription: product.shortDescription,
        description: product.description,
        perfectFor: product.perfectFor,
        keyIngredients: product.keyIngredients,
        status: ShopProductStatus.PUBLISHED,
        stockQuantity: 100,
        heroMediaId: media.id,
      },
      create: {
        slug: product.slug,
        name: product.name,
        categoryId: categoryMap.get(product.categorySlug),
        price: product.price,
        currency: "GBP",
        shortDescription: product.shortDescription,
        description: product.description,
        perfectFor: product.perfectFor,
        keyIngredients: product.keyIngredients,
        status: ShopProductStatus.PUBLISHED,
        stockQuantity: 100,
        trackInventory: true,
        heroMediaId: media.id,
      },
    });
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

