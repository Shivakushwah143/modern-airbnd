import { api } from "@/lib/api";
import type { Settings } from "@modern-airbnd/contracts";
export const metadata = { title: "Terms" };
export default async function Page() {
  const s = await api<Settings>("/settings/public");
  return (
    <div className="container section narrow">
      <h1>Terms</h1>
      <p className="prose">
        {s.termsText ||
          "The property team has not yet published this policy. Please contact the team before sharing information or making stay arrangements."}
      </p>
    </div>
  );
}
