import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { api, ApiError, queryString } from "@/lib/api";
import { Search } from "@/components/Search";
import { PropertyCard } from "@/components/Property";
import { CityIcon } from "@/components/CityIcon";
import type { Location, Property } from "@modern-airbnd/contracts";

async function loadCity(slug: string) {
  const [locationResult, propertyResult] = await Promise.allSettled([
    api<Location[]>("/locations"),
    api<Property[]>("/properties"),
  ]);
  const locations =
    locationResult.status === "fulfilled" ? locationResult.value : [];
  const catalogue =
    propertyResult.status === "fulfilled" ? propertyResult.value : [];
  const derived = Array.from(
    new Map(catalogue.map((p) => [p.location.id, p.location])).values(),
  );
  const pool = locations.length ? locations : derived;
  const location = pool.find((l) => l.slug === slug);
  return {
    location,
    catalogue,
    loadError: propertyResult.status === "rejected",
  };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ city: string }>;
}): Promise<Metadata> {
  const { city } = await params;
  const { location } = await loadCity(city);
  const title = location ? `Stays in ${location.name}` : "City stays";
  return {
    title,
    alternates: { canonical: `/stays/${city}` },
    robots: location ? undefined : { index: false, follow: false },
  };
}

export default async function CityStays({
  params,
  searchParams,
}: {
  params: Promise<{ city: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const { city } = await params;
  const raw = await searchParams;
  // QA-009: validate the guest count before it reaches the server filter.
  const guestsRaw = Number(raw.guests);
  const guests =
    raw.guests &&
    Number.isInteger(guestsRaw) &&
    guestsRaw >= 1 &&
    guestsRaw <= 200
      ? raw.guests
      : undefined;
  const q = {
    checkIn: raw.checkIn,
    checkOut: raw.checkOut,
    guests,
  };
  const query = queryString({ location: city, ...q });

  const { location, catalogue, loadError } = await loadCity(city);
  if (!location) notFound();

  let properties: Property[] = [];
  let error = loadError
    ? "The property service is unavailable right now."
    : "";
  try {
    properties = query
      ? await api<Property[]>(`/properties?${query}`)
      : catalogue.filter((p) => p.location.id === location.id);
  } catch (e) {
    error =
      e instanceof ApiError && e.status === 400
        ? e.message
        : "The property service is unavailable right now.";
  }
  properties = properties.filter(
    (p) =>
      p.location.id === location.id &&
      // QA-009: capacity applies to the catalogue fallback too (no server query).
      (!guests || p.maxGuests >= Number(guests)),
  );

  const allUnavailable =
    properties.length > 0 &&
    properties.every((p) => p.availability.status === "UNAVAILABLE");

  return (
    <div className="container section">
      <div className="page-hero-band">
        <nav className="breadcrumb" aria-label="Breadcrumb">
          <Link href="/">Home</Link>
          <span aria-hidden="true">/</span>
          <Link href="/stays">Stays</Link>
          <span aria-hidden="true">/</span>
          <span aria-current="page">{location.name}</span>
        </nav>
        <p className="eyebrow">City results</p>
        <h1>Stays in {location.name}</h1>
        {location.state && <p className="intro">{location.state}</p>}
      </div>

      <Search
        key={query}
        locations={[location]}
        initial={{ location: location.slug, ...q }}
      />

      <p className="eyebrow" style={{ marginTop: 26 }}>
        <CityIcon slug={location.slug} size={16} />{" "}
        {properties.length} {properties.length === 1 ? "stay" : "stays"} listed
        {q.checkIn && q.checkOut ? ` / ${q.checkIn} to ${q.checkOut}` : ""}
        {guests ? ` / ${guests} ${Number(guests) === 1 ? "guest" : "guests"}` : ""}
      </p>

      {error && (
        <p className="notice error" role="alert">
          {error} Edit your search above to try again.
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
        <div className="property-grid">
          {properties.map((p) => (
            <PropertyCard
              key={p.id}
              property={p}
              query={queryString(q)}
              basePath={`/stays/${location.slug}`}
            />
          ))}
        </div>
      ) : (
        !error && (
          <div className="empty-state">
            <h2>No matching stays in {location.name} yet.</h2>
            <p>Try other dates, another city, or ask the team directly.</p>
            <Link className="button primary" href="/stays">
              Browse all cities
            </Link>
            <Link className="button secondary" href="/contact">
              Contact the team
            </Link>
          </div>
        )
      )}
    </div>
  );
}