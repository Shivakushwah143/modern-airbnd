import { AdminShell } from "../AdminShell";

export const metadata = { title: "Admin settings" };

export default function AdminSettings() {
  return <AdminShell tabs={["settings"]} defaultTab="settings" />;
}
