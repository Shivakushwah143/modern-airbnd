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
  dates?: { checkIn?: string; checkOut?: string; guests?: string };
  warning?: string;
  preview?: boolean;
}) {
  const hasDates = Boolean(dates.checkIn && dates.checkOut);
  const datesAvailable = p.availability.status === "AVAILABLE";
  const availabilityMessage = datesAvailable
    ? "Your dates are available. Share your details and the team will confirm final arrangements."
    : p.availability.status === "UNAVAILABLE"
      ? "These dates are unavailable. Update your dates to check again."
      : p.availability.status === "UNKNOWN"
        ? "Availability could not be confirmed. Update your dates to try again."
        : "Choose dates to unlock the enquiry form.";

  return (
    <>
      <Gallery media={p.media} demo={p.isDemo} />
      <div className="pdp-remediated">
        <header className="property-identity">
          <p className="eyebrow">
            {p.area || p.location.name} {p.area && `/ ${p.location.name}`}
          </p>
          <h1>{p.name}</h1>
          <p>
            {p.propertyType} · {p.bedrooms} bedrooms · {p.bathrooms} bathrooms ·
            Up to {p.maxGuests} guests
          </p>
        </header>
        <aside className="enquiry-panel">
          <p className="eyebrow">STEP 1 OF 2 · AVAILABILITY</p>
          <h2>
            {datesAvailable
              ? "Your dates are available."
              : "Choose dates to check availability."}
          </h2>
          {!preview && (
            <Search
              locations={[p.location]}
              initial={{ location: p.location.slug, ...dates }}
              action={`/stays/${p.location.slug}/${p.slug}`}
              compact
              locationReadOnly
              submitLabel={hasDates ? "Update availability" : "Check availability"}
            />
          )}
          {warning && (
            <p role="alert" className="field-error">
              {warning}
            </p>
          )}
          <div className="availability-result" aria-live="polite">
            <AvailabilityBadge value={p.availability} />
            <p className="small muted">{availabilityMessage}</p>
          </div>
          {!preview && datesAvailable && (
            <section className="enquiry-step" aria-labelledby="enquiry-details-heading">
              <p className="eyebrow">STEP 2 OF 2 · YOUR DETAILS</p>
              <h3 id="enquiry-details-heading">Send your enquiry</h3>
              <StayAction
                status={p.availability.status}
                propertyId={p.id}
                maxGuests={p.maxGuests}
                stayDates={dates}
              />
            </section>
          )}
          <p className="small muted">
            Your enquiry is saved before WhatsApp opens. The team confirms final
            arrangements directly.
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
            <h2>Inside the space</h2>
            <p className="prose">{p.description}</p>
          </section>
          {p.amenities.length > 0 && (
            <section className="detail-section">
              <h2>What is here for you</h2>
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
      {!preview && datesAvailable && (
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
