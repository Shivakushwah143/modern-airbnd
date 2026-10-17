import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { api, queryString } from "@/lib/api";
import { Search } from "@/components/Search";
import { CityIcon } from "@/components/CityIcon";
import type { Location, Property } from "@modern-airbnd/contracts";

export const metadata: Metadata = {
  title: "Find a stay",
  description:
    "Choose a city, then compare published stays and enquire directly with the property team.",
  alternates: { canonical: "/stays" },
};

export default async function StaysHub({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const raw = await searchParams;
  const query = {
    location: raw.location,
    checkIn: raw.checkIn,
    checkOut: raw.checkOut,
    guests: raw.guests,
  };

  const [locationResult, propertyResult] = await Promise.allSettled([
    api<Location[]>("/locations"),
    api<Property[]>("/properties"),
  ]);

  const catalogue =
    propertyResult.status === "fulfilled" ? propertyResult.value : [];
  const derivedLocations = Array.from(
    new Map(
      catalogue.map((p) => [p.location.id, p.location]),
    ).values(),
  );
  const locations =
    locationResult.status === "fulfilled" && locationResult.value.length
      ? locationResult.value
      : derivedLocations;

  // Canonical city URLs: /stays?location=goa → /stays/goa (FR-037).
  // Dates and guest count travel along (QA-007).
  if (query.location) {
    const match = locations.find((l) => l.slug === query.location);
    if (match) {
      const qs = queryString({
        checkIn: query.checkIn,
        checkOut: query.checkOut,
        guests: query.guests,
      });
      redirect(`/stays/${match.slug}${qs ? `?${qs}` : ""}`);
    }
  }

  const loadError = propertyResult.status === "rejected";
  const cities = locations
    .map((location) => ({
      location,
      stays: catalogue.filter((p) => p.location.id === location.id),
    }))
    .filter((c) => c.stays.length > 0);

  return (
    <div className="container section stays-hub">
      <div className="page-hero-band">
        <p className="eyebrow">Guest stays</p>
        <h1>Choose a city, then pick your stay.</h1>
        <p className="intro">
          Every stay below is published by the property team. Pick your dates,
          send one enquiry, and continue the conversation directly.
        </p>
      </div>

      <Search key={JSON.stringify(query)} locations={locations} initial={query} />

      <section aria-labelledby="city-grid-heading">
        <p className="eyebrow" id="city-grid-heading">
          Cities with published stays
        </p>
        {loadError && (
          <p className="notice error" role="alert">
            The property service is unavailable right now. Retry this page, or{" "}
            <Link href="/contact" className="text-link">
              contact the team
            </Link>
            .
          </p>
        )}
        {cities.length > 0 ? (
          <div className="city-icon-grid">
            {cities.map(({ location, stays }) => {
              const cityQs = queryString({
                checkIn: query.checkIn,
                checkOut: query.checkOut,
                guests: query.guests,
              });
              return (
              <Link
                key={location.id}
                href={`/stays/${location.slug}${cityQs ? `?${cityQs}` : ""}`}
                className="city-icon-tile"
              >
                {/* QA-008: the approved city illustration is always used; property
                    cover photos never substitute for the city icon. */}
                <span className="city-icon-art" aria-hidden="true">
                  <CityIcon slug={location.slug} />
                </span>
                <strong>{location.name}</strong>
                <small>
                  {stays.length} {stays.length === 1 ? "stay" : "stays"}
                  {location.state ? ` · ${location.state}` : ""}
                </small>
              </Link>
              );
            })}
          </div>
        ) : (
          !loadError && (
            <div className="empty-state">
              <h2>No stays are published yet.</h2>
              <p>Check back soon, or contact the team for what’s coming next.</p>
              <Link className="button primary" href="/contact">
                Contact the team
              </Link>
            </div>
          )
        )}
      </section>
    </div>
  );
}