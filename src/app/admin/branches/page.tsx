import { getBranches } from "@/lib/data/branches";
import { BranchesListView } from "./branches-list-view";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Branches · Admin",
};

export default async function AdminBranchesPage() {
  const branches = await getBranches();
  return <BranchesListView branches={branches} />;
}
