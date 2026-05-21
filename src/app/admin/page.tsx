import { getProducts } from "@/lib/data/products";
import { DashboardView } from "./dashboard-view";

// Dashboard reads orders via onSnapshot client-side; products are public so
// we fetch them server-side and hand off.
export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const products = await getProducts();
  return <DashboardView products={products} />;
}
