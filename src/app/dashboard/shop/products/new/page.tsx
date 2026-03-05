import { getAdminShopCategories } from "@/app/actions/shop";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { ShopProductForm } from "@/components/dashboard/shop/ShopProductForm";

export default async function NewShopProductPage() {
  const categories = await getAdminShopCategories();

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="New Shop Product"
        subtitle="Create a product listing for the storefront and academy."
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Shop", href: "/dashboard/shop" },
          { label: "Products", href: "/dashboard/shop/products" },
          { label: "New" },
        ]}
      />
      <ShopProductForm categories={categories.map((c: any) => ({ id: c.id, name: c.name }))} />
    </div>
  );
}

