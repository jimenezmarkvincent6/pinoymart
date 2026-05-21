import { getCategories } from "@/lib/data/categories";
import { getProducts } from "@/lib/data/products";
import { CategoriesListView } from "./categories-list-view";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Categories · Admin",
};

export default async function AdminCategoriesPage() {
  const [categories, products] = await Promise.all([
    getCategories(),
    getProducts(),
  ]);

  // Pre-count products per category so the list view can warn before delete.
  const productCounts: Record<string, number> = {};
  for (const p of products) {
    productCounts[p.category] = (productCounts[p.category] ?? 0) + 1;
  }

  return (
    <CategoriesListView
      categories={categories}
      productCounts={productCounts}
    />
  );
}
