import type { Property, Settings } from "@modern-airbnd/contracts";
import { Gallery } from "./Gallery";
import { Search } from "./Search";
import { AvailabilityBadge } from "./Property";
import { StayAction } from "./StayAction";
import {
  PropertyPassport,
  StayTruths,
  LocalLens,
  ExternalProof,
} from "./Trust";
export function PropertyBody({
  property: p,
  settings,
  dates = {},
  warning = "",
  preview = false,
}: {
  property: Property;
  settings: Settings;
  dates?: { checkIn?: string; checkOut?: string };
  warning?: string;
  preview?: boolean;
}) {
  return (
    <>
      <Gallery media={p.media} demo={p.isDemo} />
      <div className="pdp-remediated">
        <header className="property-identity">
          <p className="eyebrow">
            {p.location.name} {p.area && `/ ${p.area}`}
          </p>
          <h1>{p.name}</h1>
          <p>
            {p.propertyType} · {p.bedrooms} bedrooms · {p.bathrooms} bathrooms ·
            Up to {p.maxGuests} guests
          </p>
        </header>
        <aside className="enquiry-panel">
          <p className="eyebrow">YOUR STAY</p>
          <h2>Make room for your dates.</h2>
          {!preview && (
            <Search
              locations={[]}
              initial={dates}
              action={`/properties/${p.slug}`}
              compact
            />
          )}
          {warning && (
            <p role="alert" className="field-error">
              {warning}
            </p>
          )}
          <AvailabilityBadge value={p.availability} />
          {!preview && (
            <StayAction
              status={p.availability.status}
              propertyId={p.id}
              maxGuests={p.maxGuests}
              stayDates={dates}
            />
          )}
          <p className="small muted">
            Availability is maintained manually. An enquiry does not reserve
            your stay.
          </p>
          {p.availability.status === "AVAILABLE" && !p.whatsappUrl && (
            <p className="small">
              {p.isDemo
                ? "Demo enquiries are disabled."
                : "Contact information is currently unavailable."}
            </p>
          )}
        </aside>
        <div className="property-story">
          <PropertyPassport property={p} operator={settings.operatorName} />
          <section className="detail-section">
            <h2>Inside the space.</h2>
            <p className="prose">{p.description}</p>
          </section>
          {p.amenities.length > 0 && (
            <section className="detail-section">
              <h2>What’s here for you</h2>
              <ul className="amenities-grid">
                {p.amenities.map((a) => (
                  <li key={a.id}>{a.name}</li>
                ))}
              </ul>
            </section>
          )}
          <StayTruths property={p} />
          <LocalLens property={p} />
          <ExternalProof property={p} />
        </div>
      </div>
      {!preview && (
        <StayAction
          status={p.availability.status}
          propertyId={p.id}
          maxGuests={p.maxGuests}
          stayDates={dates}
          mobile
        />
      )}
    </>
  );
}
