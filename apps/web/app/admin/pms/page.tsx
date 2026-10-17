import { AdminShell } from "../AdminShell";

export const metadata = { title: "PMS workspace" };

export default function PmsWorkspace() {
  return (
    <AdminShell
      tabs={[
        "enquiries",
        "reservations",
        "guests",
        "owners",
        "ownerLeads",
        "housekeeping",
        "maintenance",
      ]}
      defaultTab="enquiries"
    />
  );
}