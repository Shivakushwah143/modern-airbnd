import { AdminShell } from "../../AdminShell";

export const metadata = {
  title: "PMS finance",
  robots: { index: false, follow: false },
};

export default function PmsFinance() {
  return <AdminShell tabs={["finance"]} defaultTab="finance" />;
}
