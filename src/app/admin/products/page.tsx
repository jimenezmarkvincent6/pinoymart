import { getProducts } from "@/lib/data/products";
import { getCategories } from "@/lib/data/categories";
import { ProductsListView } from "./products-list-view";

// No revalidate — admin reads should be fresh; router.refresh() handles cache busts.
export const dynamic = "force-dynamic";

export const metadata = {
  title: "Products · Admin",
};

export default async function AdminProductsPage() {
  const [products, categories] = await Promise.all([
    getProducts(),
    getCategories(),
  ]);
  return <ProductsListView products={products} categories={categories} />;
}
