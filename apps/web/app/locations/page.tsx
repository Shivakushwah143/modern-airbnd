import Link from "next/link";
import { api } from "@/lib/api";
import { CityIcon } from "@/components/CityIcon";
import type { Location, Property } from "@modern-airbnd/contracts";
import { withSampleDestinations } from "@/lib/sample-destinations";

export const metadata = { title: "Destinations" };

export default async function Locations() {
  const [locationResult, propertyResult] = await Promise.allSettled([
    api<Location[]>("/locations"),
    api<Property[]>("/properties"),
  ]);
  const locations =
    locationResult.status === "fulfilled" ? locationResult.value : [];
  const properties =
    propertyResult.status === "fulfilled" ? propertyResult.value : [];
  const propertyLocations = Array.from(
    new Map(
      properties.map((property) => [property.location.id, property.location]),
    ).values(),
  );
  const availableLocations = locations.length ? locations : propertyLocations;
  const hasLoadError = propertyResult.status === "rejected";
  const hasPartialLocationError =
    propertyResult.status === "fulfilled" && locationResult.status === "rejected";
  const activeLocations = availableLocations.filter((location) =>
    properties.some((property) => property.location.id === location.id),
  );

  return (
    <div className="container section">
      <p className="eyebrow">Destinations</p>
      <h1>Explore our destinations.</h1>
      <p className="intro">
        Choose a city to see matching properties. Stay counts come from the
        current catalogue; sample destinations are marked as previews.
      </p>
      {hasLoadError && (
        <div className="notice error" role="alert">
          <h2>Destinations could not be loaded.</h2>
          <p>
            The property service is unavailable right now. Retry this page, or
            contact the team for help.
          </p>
          <Link href="/contact" className="text-link">
            Contact the team
          </Link>
        </div>
      )}
      {hasPartialLocationError && (
        <p className="notice">
          Destination details are being refreshed. Cities below are derived from
          currently published properties.
        </p>
      )}
      <div className="destination-grid">
        {withSampleDestinations(activeLocations.length ? activeLocations : availableLocations).map((location) => {
          const cityProperties = properties.filter(
            (property) => property.location.id === location.id,
          );
          return (
            <Link
              key={location.id}
              href={`/stays/${location.slug}`}
              className="destination-tile"
            >
              {/* QA-008: the approved city illustration, never a property cover. */}
              <span className="destination-tile-photo" aria-hidden="true">
                <CityIcon slug={location.slug} size={30} />
              </span>
              <div>
                <h2>{location.name}</h2>
                <p>{location.state}</p>
                {location.id.startsWith("sample-") && <small className="destination-sample-label">Sample destination</small>}
              </div>
              <strong>
                {cityProperties.length}{" "}
                {cityProperties.length === 1 ? "stay" : "stays"}
              </strong>
            </Link>
          );
        })}
      </div>
      {!hasLoadError && !activeLocations.length && (
        <div className="empty-state">
          <h2>No destinations are published yet.</h2>
          <p>Please check back once the property team publishes the first stay.</p>
        </div>
      )}
    </div>
  );
}
