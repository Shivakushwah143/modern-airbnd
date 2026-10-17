import { AdminShell } from "../AdminShell";

export const metadata = { title: "Portfolio workspace" };

export default function PortfolioWorkspace() {
  return <AdminShell tabs={["portfolio"]} defaultTab="portfolio" />;
}