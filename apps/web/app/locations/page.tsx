import Link from "next/link";
import { api } from "@/lib/api";
import { Photo } from "@/components/Photo";
import { Icon } from "@/components/Icon";
import type { Location, Property } from "@modern-airbnd/contracts";

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
      <h1>Browse cities with published properties.</h1>
      <p className="intro">
        Property counts are derived from the current catalogue. Choose a city to
        see only matching properties.
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
        {(activeLocations.length ? activeLocations : availableLocations).map((location) => {
          const cityProperties = properties.filter(
            (property) => property.location.id === location.id,
          );
          const cover = cityProperties.find((property) => property.media.length);
          return (
            <Link
              key={location.id}
              href={`/properties?location=${location.slug}`}
              className="destination-tile"
            >
              <span className="destination-tile-photo">
                {cover ? <Photo media={cover.media[0]} /> : <Icon name="pin" />}
              </span>
              <div>
                <h2>{location.name}</h2>
                <p>{location.state}</p>
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
