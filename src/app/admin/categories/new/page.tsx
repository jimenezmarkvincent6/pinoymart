import { getCategories } from "@/lib/data/categories";
import { CategoryForm } from "@/components/admin/category-form";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Add category · Admin",
};

export default async function NewCategoryPage() {
  const categories = await getCategories();
  return <CategoryForm existingSlugs={categories.map((c) => c.slug)} />;
}
