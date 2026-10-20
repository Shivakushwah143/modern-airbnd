import type { Property, Availability } from "@modern-airbnd/contracts";
import { Icon } from "./Icon";
import { Photo } from "./Photo";
import { NavigationLink } from "./NavigationLink";

export function AvailabilityBadge({ value }: { value: Availability }) {
  const labels = {
    AVAILABLE: "Available for selected dates",
    UNAVAILABLE: "Unavailable for selected dates",
    NOT_EVALUATED: "Add dates to check availability",
    UNKNOWN: "Availability could not be confirmed",
  };
  return (
    <span className={`availability ${value.status.toLowerCase()}`}>
      <Icon
        name={value.status === "AVAILABLE" ? "check" : "calendar"}
        size={16}
      />
      {labels[value.status]}
    </span>
  );
}

export function PropertyCard({
  property: p,
  query = "",
  basePath = "/properties",
}: {
  property: Property;
  query?: string;
  basePath?: string;
}) {
  const href = `${basePath}/${p.slug}${query ? "?" + query : ""}`;
  return (
    <article
      className={`property-card ${p.availability.status === "UNAVAILABLE" ? "unavailable-card" : ""}`}
    >
      <NavigationLink
        className="card-image"
        href={href}
        tabIndex={-1}
        aria-hidden="true"
        showPending={false}
      >
        <Photo media={p.media[0]} demo={p.isDemo} />
        {p.isDemo && <span className="demo-tag">Demo stay</span>}
      </NavigationLink>
      <div className="card-content">
        <div className="eyebrow">
          <Icon name="pin" size={14} />
          {p.area || p.location.name}
          {p.area ? ` / ${p.location.name}` : ""}
        </div>
        <h3>
          <NavigationLink href={href}>{p.name}</NavigationLink>
        </h3>
        <p className="muted small card-summary">
          {p.shortDescription || p.propertyType}
        </p>
        <p className="facts">
          <Icon name="bed" size={18} />
          {p.bedrooms} bedrooms · {p.bathrooms} baths · {p.maxGuests} guests
        </p>
        {p.amenities.length > 0 && (
          <p className="amenity-line">
            {p.amenities.map((a) => a.name).join(" · ")}
          </p>
        )}
        <div className="card-foot">
          <AvailabilityBadge value={p.availability} />
          <NavigationLink className="card-link" href={href}>
            View property
          </NavigationLink>
        </div>
      </div>
    </article>
  );
}
