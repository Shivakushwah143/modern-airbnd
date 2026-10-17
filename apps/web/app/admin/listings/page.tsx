import { AdminShell } from "../AdminShell";

export const metadata = { title: "Listings workspace" };

export default function ListingsWorkspace() {
  return (
    <AdminShell
      tabs={["properties", "locations"]}
      defaultTab="properties"
    />
  );
}