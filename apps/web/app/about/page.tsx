import Link from "next/link";
import { api } from "@/lib/api";
import type { Settings } from "@modern-airbnd/contracts";
export const metadata = { title: "About" };
export default async function About() {
  const s = await api<Settings>("/settings/public");
  return (
    <div className="container section narrow">
      <p className="eyebrow">MODERN AIRBND</p>
      <h1>
        Know the space.
        <br />
        Know the details.
      </h1>
      <p className="intro">
        Explore properties, check availability and speak directly with the
        property team.
      </p>
      {s.operatorName && <h2>{s.operatorName}</h2>}
      <p className="prose">
        {s.aboutText ||
          "Property details and availability are maintained by the property team. Review each listing’s amenities and house rules, then start an enquiry when you’re ready."}
      </p>
      <Link href="/contact" className="button primary">
        Contact the team
      </Link>
    </div>
  );
}
