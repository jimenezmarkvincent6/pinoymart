import { notFound } from "next/navigation";
import { getProductById } from "@/lib/data/products";
import { getBranches } from "@/lib/data/branches";
import { getCategories } from "@/lib/data/categories";
import { ProductForm } from "@/components/admin/product-form";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  const product = await getProductById(id);
  return {
    title: product ? `Edit ${product.name} · Admin` : "Edit product · Admin",
  };
}

export default async function EditProductPage({ params }: PageProps) {
  const { id } = await params;
  const [product, branches, categories] = await Promise.all([
    getProductById(id),
    getBranches(),
    getCategories(),
  ]);
  if (!product) notFound();

  return (
    <ProductForm
      branches={branches}
      categories={categories}
      initialProduct={product}
    />
  );
}
