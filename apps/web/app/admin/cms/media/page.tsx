import { AdminShell } from "../../AdminShell";

export const metadata = { title: "CMS media library" };

export default function CmsMedia() {
  return <AdminShell tabs={["media"]} defaultTab="media" />;
}
