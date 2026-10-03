import Link from "next/link";
import { api, ApiError, queryString } from "@/lib/api";
import { Search } from "@/components/Search";
import { PropertyCard } from "@/components/Property";
import type { Property, Location } from "@modern-airbnd/contracts";
export const metadata = {
  title: "Explore properties",
  alternates: { canonical: "/properties" },
};
export default async function Properties({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const raw = await searchParams;
  const q = {
    location: raw.location,
    checkIn: raw.checkIn,
    checkOut: raw.checkOut,
  };
  const query = queryString(q);
  const locations = await api<Location[]>("/locations");
  let properties: Property[] = [];
  let error = "";
  try {
    properties = await api<Property[]>(`/properties?${query}`);
  } catch (e) {
    if (e instanceof ApiError && e.status === 400) error = e.message;
    else throw e;
  }
  const name = locations.find((l) => l.slug === q.location)?.name;
  const allUnavailable =
    properties.length > 0 &&
    properties.every((p) => p.availability.status === "UNAVAILABLE");
  return (
    <div className="container section">
      <p className="eyebrow">THE COLLECTION</p>
      <h1>{name ? `Stays in ${name}` : "Find a space for your stay."}</h1>
      <Search key={query} locations={locations} initial={q} compact />
      <div className="results-summary">
        <span>
          {properties.length}{" "}
          {properties.length === 1 ? "property" : "properties"}
          {q.checkIn && q.checkOut ? ` · ${q.checkIn} — ${q.checkOut}` : ""}
        </span>
        <span className="muted">
          {q.checkIn
            ? "Available stays shown first"
            : "Explore now. Choose dates when you’re ready."}
        </span>
      </div>
      {error && (
        <p className="notice error" role="alert">
          {error} Edit your dates above to try again.
        </p>
      )}
      {allUnavailable && (
        <div className="notice">
          <h3>No stays are available for these dates.</h3>
          <p>Change your dates above, or ask the team about alternatives.</p>
          <Link href="/contact" className="text-link">
            Ask about alternatives
          </Link>
        </div>
      )}
      {properties.length ? (
        <>
          {(q.checkIn ? ["AVAILABLE", "UNAVAILABLE"] : ["NOT_EVALUATED"]).map(
            (status) => {
              const group = properties.filter(
                (p) => p.availability.status === status,
              );
              return (
                group.length > 0 && (
                  <section className="result-group" key={status}>
                    {q.checkIn && (
                      <h2 className="result-group-title">
                        {status === "AVAILABLE"
                          ? "Available stays"
                          : "Unavailable for your dates"}
                      </h2>
                    )}
                    <div className="property-grid">
                      {group.map((p) => (
                        <PropertyCard key={p.id} property={p} query={query} />
                      ))}
                    </div>
                  </section>
                )
              );
            },
          )}
        </>
      ) : (
        !error && (
          <div className="empty-state">
            <h2>No properties are listed here yet.</h2>
            <p>Explore another location or contact the team for help.</p>
            <Link className="button primary" href="/properties">
              Explore all properties
            </Link>
          </div>
        )
      )}
    </div>
  );
}
