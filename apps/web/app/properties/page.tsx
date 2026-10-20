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
  // One canonical catalogue request per server render. The old implementation
  // loaded all properties, then loaded the filtered catalogue again.
  const propertyPath = query ? `/properties?${query}` : "/properties";
  const [locationResult, propertyResult] = await Promise.allSettled([
    api<Location[]>("/locations"),
    api<Property[]>(propertyPath),
  ]);
  const catalogue =
    propertyResult.status === "fulfilled" ? propertyResult.value : [];
  const propertyLocations = Array.from(
    new Map(
      catalogue.map((property) => [property.location.id, property.location]),
    ).values(),
  );
  const locations =
    locationResult.status === "fulfilled" && locationResult.value.length
      ? locationResult.value
      : propertyLocations;
  const properties = catalogue;
  const error =
    propertyResult.status === "rejected"
      ? propertyResult.reason instanceof ApiError && propertyResult.reason.status === 400
        ? propertyResult.reason.message
        : "The property service is unavailable right now."
      : "";
  const locationNotice =
    locationResult.status === "rejected" && !error
      ? "Destination details are being refreshed."
      : "";

  const name = locations.find((l) => l.slug === q.location)?.name;
  const allUnavailable =
    properties.length > 0 &&
    properties.every((p) => p.availability.status === "UNAVAILABLE");

  return (
    <div className="container section">
      <p className="eyebrow">{name ? "City results" : "All properties"}</p>
      <h1>
        {name ? `Properties in ${name}` : "Choose a city, then compare stays."}
      </h1>
      <Search key={query} locations={locations} initial={q} compact />
      <div className="results-summary">
        <span>
          {properties.length}{" "}
          {properties.length === 1 ? "property" : "properties"}
          {q.checkIn && q.checkOut ? ` / ${q.checkIn} to ${q.checkOut}` : ""}
        </span>
        <span className="muted">
          {q.checkIn
            ? "Available stays shown first"
            : "Select a city or browse all destinations."}
        </span>
      </div>
      {error && (
        <p className="notice error" role="alert">
          {error} Edit your search above to try again.
        </p>
      )}
      {locationNotice && (
        <p className="notice" role="status">
          {locationNotice}
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
            <h2>No matching properties are listed yet.</h2>
            <p>Choose another destination or contact the team for help.</p>
            <Link className="button primary" href="/properties">
              Explore all properties
            </Link>
            <Link className="button secondary" href="/locations">
              View destinations
            </Link>
          </div>
        )
      )}
    </div>
  );
}
