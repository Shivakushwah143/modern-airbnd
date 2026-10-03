import Link from "next/link";
import { api } from "@/lib/api";
import type { Location } from "@modern-airbnd/contracts";
export const metadata = { title: "Locations" };
export default async function Locations() {
  const data = await api<Location[]>("/locations");
  return (
    <div className="container section">
      <p className="eyebrow">A CHANGE OF SCENE</p>
      <h1>Explore our locations.</h1>
      <div className="location-grid">
        {data.map((l) => (
          <Link
            key={l.id}
            href={`/properties?location=${l.slug}`}
            className="location-tile"
          >
            <h2>{l.name}</h2>
            <p>{l.state}</p>
            <span>Explore properties</span>
          </Link>
        ))}
      </div>
      {!data.length && <p>No locations with published properties yet.</p>}
    </div>
  );
}
