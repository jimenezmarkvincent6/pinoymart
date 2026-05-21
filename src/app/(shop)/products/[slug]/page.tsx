import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ProductImage } from "@/components/shop/product-image";
import { ProductGrid } from "@/components/shop/product-grid";
import { AddToCartControls } from "@/components/shop/add-to-cart-controls";
import {
  getProductBySlug,
  getProducts,
  getProductsByCategory,
} from "@/lib/data/products";
import { getCategories } from "@/lib/data/categories";
import { formatPrice } from "@/lib/format";

export const revalidate = 60;

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const products = await getProducts();
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Product not found" };
  return {
    title: product.name,
    description: product.description,
  };
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const [allCategories, sameCategoryProducts] = await Promise.all([
    getCategories(),
    getProductsByCategory(product.category),
  ]);
  const category = allCategories.find((c) => c.slug === product.category);
  const related = sameCategoryProducts
    .filter((p) => p.id !== product.id)
    .slice(0, 4);

  return (
    <div className="mx-auto max-w-6xl space-y-10 px-4 pb-40 pt-6 sm:px-6 sm:pb-10 sm:pt-10">
      <Link
        href="/products"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ChevronLeft className="h-4 w-4" /> All products
      </Link>

      <div className="grid gap-8 md:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
          <ProductImage
            emoji={product.image}
            name={product.name}
            size="lg"
            className="aspect-square"
          />
        </div>

        <div className="flex flex-col">
          <div className="flex flex-wrap items-center gap-2">
            {category && (
              <Link
                href={`/products?cat=${category.slug}`}
                className="inline-flex items-center gap-1 text-xs font-medium uppercase tracking-wider text-primary hover:underline"
              >
                {category.emoji} {category.name}
              </Link>
            )}
            {product.tags?.includes("bestseller") && (
              <Badge variant="soft">★ Bestseller</Badge>
            )}
            {product.oldPrice && <Badge variant="accent">Promo</Badge>}
            {product.tags?.includes("new") && (
              <Badge variant="success">New</Badge>
            )}
          </div>

          <h1 className="mt-3 text-3xl font-bold leading-tight tracking-tight">
            {product.name}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {product.brand ?? "Pinoy Mart"} · {product.unit}
          </p>

          <div className="mt-5 flex items-baseline gap-3">
            <span className="text-3xl font-bold">
              {formatPrice(product.price)}
            </span>
            {product.oldPrice && (
              <span className="text-base text-muted-foreground line-through">
                {formatPrice(product.oldPrice)}
              </span>
            )}
          </div>

          <p className="mt-4 max-w-prose text-sm leading-relaxed text-muted-foreground">
            {product.description}
          </p>

          <div className="mt-6 grid grid-cols-2 gap-3 text-sm sm:max-w-sm">
            <Info label="Stock" value={`${product.stock} units`} />
            <Info label="Unit" value={product.unit} />
            {product.rating && (
              <Info label="Rating" value={`★ ${product.rating} / 5`} />
            )}
            <Info label="Origin" value="Philippines" />
          </div>

          <div className="mt-8">
            <AddToCartControls product={product} />
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section>
          <h2 className="mb-4 text-xl font-bold sm:text-2xl">
            More from {category?.name}
          </h2>
          <ProductGrid products={related} />
        </section>
      )}
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-secondary/40 px-3 py-2">
      <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      <div className="mt-0.5 font-medium">{value}</div>
    </div>
  );
}
