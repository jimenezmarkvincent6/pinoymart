import { Suspense } from "react";
import { ProductsView } from "./products-view";
import { getProducts } from "@/lib/data/products";
import { getCategories } from "@/lib/data/categories";

export const revalidate = 60;

export const metadata = {
  title: "Shop all products",
};

export default async function ProductsPage() {
  const [products, categories] = await Promise.all([
    getProducts(),
    getCategories(),
  ]);

  return (
    <Suspense fallback={null}>
      <ProductsView products={products} categories={categories} />
    </Suspense>
  );
}
