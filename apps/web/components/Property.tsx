import Link from "next/link";
import type { Property, Availability } from "@modern-airbnd/contracts";
import { Icon } from "./Icon";
import { Photo } from "./Photo";
export function AvailabilityBadge({ value }: { value: Availability }) {
  const labels = {
    AVAILABLE: "Available for your selected dates",
    UNAVAILABLE: "Unavailable for your selected dates",
    NOT_EVALUATED: "Select dates to check availability",
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
}: {
  property: Property;
  query?: string;
}) {
  return (
    <article
      className={`property-card ${p.availability.status === "UNAVAILABLE" ? "unavailable-card" : ""}`}
    >
      <Link
        className="card-image"
        href={`/properties/${p.slug}${query ? "?" + query : ""}`}
        tabIndex={-1}
        aria-hidden="true"
      >
        <Photo media={p.media[0]} demo={p.isDemo} />
        {p.isDemo && <span className="demo-tag">Demo property</span>}
      </Link>
      <div className="card-content">
        <div className="eyebrow">
          <Icon name="pin" size={14} />
          {p.location.name}
          {p.area ? ` · ${p.area}` : ""}
        </div>
        <h3>
          <Link href={`/properties/${p.slug}${query ? "?" + query : ""}`}>
            {p.name}
          </Link>
        </h3>
        <p className="muted small">{p.propertyType}</p>
        <p className="facts">
          <Icon name="bed" size={18} />
          {p.bedrooms} bedrooms · {p.bathrooms} baths · {p.maxGuests} guests
        </p>
        <p className="amenity-line">
          {p.amenities.map((a) => a.name).join(" · ")}
        </p>
        <AvailabilityBadge value={p.availability} />
        <Link
          className="card-link"
          href={`/properties/${p.slug}${query ? "?" + query : ""}`}
        >
          View Property
        </Link>
      </div>
    </article>
  );
}
