import { getBranches } from "@/lib/data/branches";
import { OrdersView } from "./orders-view";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Orders · Admin",
};

export default async function AdminOrdersPage() {
  // Branches are public-read, so fetch them server-side. Orders need auth and
  // are loaded client-side via onSnapshot for live updates.
  const branches = await getBranches();
  return <OrdersView branches={branches} />;
}
