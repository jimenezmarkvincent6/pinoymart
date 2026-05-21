import { notFound } from "next/navigation";
import { getCategories, getCategoryBySlug } from "@/lib/data/categories";
import { CategoryForm } from "@/components/admin/category-form";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  return {
    title: category
      ? `Edit ${category.name} · Admin`
      : "Edit category · Admin",
  };
}

export default async function EditCategoryPage({ params }: PageProps) {
  const { slug } = await params;
  const [category, all] = await Promise.all([
    getCategoryBySlug(slug),
    getCategories(),
  ]);
  if (!category) notFound();

  return (
    <CategoryForm
      initialCategory={category}
      existingSlugs={all.map((c) => c.slug)}
    />
  );
}
