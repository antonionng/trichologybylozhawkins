import { getAdminShopCategories } from "@/app/actions/shop";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { ShopCategoryManager } from "@/components/dashboard/shop/ShopCategoryManager";

export default async function ShopCategoriesPage() {
  const categories = await getAdminShopCategories();

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Shop Categories"
        subtitle="Organize product categories shown in the storefront."
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Shop", href: "/dashboard/shop" },
          { label: "Categories" },
        ]}
      />
      <ShopCategoryManager
        categories={categories.map((category: any) => ({
          id: category.id,
          name: category.name,
          slug: category.slug,
          description: category.description,
          status: category.status,
          position: category.position,
        }))}
      />
    </div>
  );
}

