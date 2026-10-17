import { AdminShell, ALL_TABS } from "../AdminShell";

export const metadata = {
  title: "Admin sign in",
  robots: { index: false, follow: false },
};

export default function AdminLogin() {
  // The current session API owns authentication and sign-in state.
  return <AdminShell tabs={ALL_TABS} defaultTab="dashboard" />;
}
