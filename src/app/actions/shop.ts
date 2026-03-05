"use server";

import * as shopService from "@/server/modules/shop/service";
import { requireUserOrRedirect } from "@/server/security/auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function getShopProducts(filters?: {
  categorySlug?: string;
  query?: string;
  limit?: number;
  offset?: number;
}) {
  return shopService.listPublishedProducts(filters);
}

export async function getShopProductBySlug(slug: string) {
  return shopService.getProductBySlug(slug);
}

export async function getShopCategories() {
  return shopService.listCategories();
}

export async function getAdminShopCategories() {
  await requireUserOrRedirect({ role: "ADMIN", next: "/dashboard/shop/categories" });
  return shopService.listAllCategories();
}

export async function getAdminShopProducts() {
  await requireUserOrRedirect({ role: "ADMIN", next: "/dashboard/shop/products" });
  return shopService.listPublishedProducts({ includeDrafts: true, limit: 200 });
}

export async function getShopStats() {
  await requireUserOrRedirect({ role: "ADMIN", next: "/dashboard/shop" });
  return shopService.getShopDashboardStats();
}

export async function getAdminOrders() {
  await requireUserOrRedirect({ role: "ADMIN", next: "/dashboard/shop/orders" });
  return shopService.listOrders({ limit: 100 });
}

export async function getAdminOrder(id: string) {
  await requireUserOrRedirect({ role: "ADMIN", next: `/dashboard/shop/orders/${id}` });
  return shopService.getOrder(id);
}

export async function saveShopProduct(input: Record<string, unknown>) {
  await requireUserOrRedirect({ role: "ADMIN", next: "/dashboard/shop/products" });
  const product = await shopService.createProduct(input as any);
  revalidatePath("/dashboard/shop");
  revalidatePath("/dashboard/shop/products");
  revalidatePath("/shop");
  if ((product as any).slug) {
    revalidatePath(`/shop/${(product as any).slug}`);
  }
  return product;
}

export async function removeShopProduct(id: string) {
  await requireUserOrRedirect({ role: "ADMIN", next: "/dashboard/shop/products" });
  await shopService.deleteProduct(id);
  revalidatePath("/dashboard/shop/products");
  revalidatePath("/shop");
}

export async function saveShopCategory(input: Record<string, unknown>) {
  await requireUserOrRedirect({ role: "ADMIN", next: "/dashboard/shop/categories" });
  const category = await shopService.createCategory(input as any);
  revalidatePath("/dashboard/shop/categories");
  revalidatePath("/shop");
  return category;
}

export async function removeShopCategory(id: string) {
  await requireUserOrRedirect({ role: "ADMIN", next: "/dashboard/shop/categories" });
  await shopService.deleteCategory(id);
  revalidatePath("/dashboard/shop/categories");
  revalidatePath("/shop");
}

export async function updateShopOrder(id: string, payload: {
  status: string;
  trackingNumber?: string;
  trackingUrl?: string;
  note?: string;
}) {
  await requireUserOrRedirect({ role: "ADMIN", next: `/dashboard/shop/orders/${id}` });
  await shopService.updateOrderStatus(id, payload as any);
  revalidatePath("/dashboard/shop/orders");
  revalidatePath(`/dashboard/shop/orders/${id}`);
}

export async function startShopCheckout(payload: Record<string, unknown>) {
  const session = await shopService.createShopCheckoutSession(payload as any);
  if (session.url) redirect(session.url);
}

