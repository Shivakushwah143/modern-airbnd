import { AdminShell } from "../../AdminShell";

export const metadata = { title: "PMS operations" };

export default function PmsOperations() {
  return (
    <AdminShell tabs={["housekeeping", "maintenance"]} defaultTab="housekeeping" />
  );
}
