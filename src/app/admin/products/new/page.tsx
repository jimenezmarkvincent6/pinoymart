import { getBranches } from "@/lib/data/branches";
import { getCategories } from "@/lib/data/categories";
import { ProductForm } from "@/components/admin/product-form";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Add product · Admin",
};

export default async function NewProductPage() {
  const [branches, categories] = await Promise.all([
    getBranches(),
    getCategories(),
  ]);
  return <ProductForm branches={branches} categories={categories} />;
}
