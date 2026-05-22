import { getSiteSettings } from "@/lib/data/settings";
import { SettingsForm } from "@/components/admin/settings-form";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Settings · Admin",
};

export default async function AdminSettingsPage() {
  const settings = await getSiteSettings();
  return <SettingsForm initialSettings={settings} />;
}
