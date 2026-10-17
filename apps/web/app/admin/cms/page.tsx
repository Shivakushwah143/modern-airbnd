import { AdminShell } from "../AdminShell";

export const metadata = { title: "CMS workspace" };

export default function CmsWorkspace() {
  return <AdminShell tabs={["cms", "media", "settings"]} defaultTab="cms" />;
}
