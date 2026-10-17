import { AdminShell, ALL_TABS } from "./AdminShell";

export default function Admin() {
  return <AdminShell tabs={ALL_TABS} defaultTab="dashboard" />;
}