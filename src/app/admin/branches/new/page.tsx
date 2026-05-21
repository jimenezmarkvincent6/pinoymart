import { getBranches } from "@/lib/data/branches";
import { BranchForm } from "@/components/admin/branch-form";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Add branch · Admin",
};

export default async function NewBranchPage() {
  const branches = await getBranches();
  const existingIds = branches.map((b) => b.id);
  return <BranchForm existingIds={existingIds} />;
}
