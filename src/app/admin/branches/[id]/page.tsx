import { notFound } from "next/navigation";
import { getBranches, getBranchById } from "@/lib/data/branches";
import { BranchForm } from "@/components/admin/branch-form";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  const branch = await getBranchById(id);
  return {
    title: branch ? `Edit ${branch.name} · Admin` : "Edit branch · Admin",
  };
}

export default async function EditBranchPage({ params }: PageProps) {
  const { id } = await params;
  const [branch, branches] = await Promise.all([
    getBranchById(id),
    getBranches(),
  ]);
  if (!branch) notFound();

  return (
    <BranchForm
      initialBranch={branch}
      existingIds={branches.map((b) => b.id)}
    />
  );
}
