import Link from "next/link";
import type { Property, Settings, Location } from "@modern-airbnd/contracts";

export function PropertyPassport({
  property: p,
  operator,
}: {
  property: Property;
  operator?: string;
}) {
  return (
    <section className="property-passport" aria-label="Property passport">
      <div className="passport-title">
        <span>MODERN AIRBND</span>
        <h2>Property passport</h2>
      </div>
      <dl>
        <div>
          <dt>The space</dt>
          <dd>{p.name}</dd>
        </div>
        <div>
          <dt>The neighbourhood</dt>
          <dd>{[p.area, p.location.name].filter(Boolean).join(", ")}</dd>
        </div>
        <div>
          <dt>Offered as</dt>
          <dd>
            {p.inventoryMode === "MULTI_UNIT"
              ? "Individual rooms"
              : p.propertyType}
          </dd>
        </div>
        <div>
          <dt>At a glance</dt>
          <dd>
            {p.bedrooms} bedrooms · {p.bathrooms} bathrooms · Up to{" "}
            {p.maxGuests} guests
          </dd>
        </div>
        {operator && (
          <div>
            <dt>Managed by</dt>
            <dd>{operator}</dd>
          </div>
        )}
        <div>
          <dt>Availability</dt>
          <dd>Maintained manually by the property team</dd>
        </div>
      </dl>
    </section>
  );
}

export function StayTruths({ property: p }: { property: Property }) {
  const facts = [
    ...p.houseRules,
    p.checkInInfo && `Check-in: ${p.checkInInfo}`,
    p.checkOutInfo && `Check-out: ${p.checkOutInfo}`,
  ].filter(Boolean);
  if (!facts.length && !p.propertyNotes) return null;
  return (
    <section className="detail-section stay-truths">
      <p className="eyebrow">STAY TRUTHS</p>
      <h2>Good to know before you stay</h2>
      <ul>
        {facts.map((f, i) => (
          <li key={i}>{f}</li>
        ))}
      </ul>
      {p.propertyNotes && <p className="prose">{p.propertyNotes}</p>}
    </section>
  );
}

export function LocalLens({ property: p }: { property: Property }) {
  return (
    <section className="detail-section local-lens">
      <p className="eyebrow">LOCAL LENS</p>
      <h2>{p.area || p.location.name}</h2>
      <p>
        {p.addressLine ||
          [p.location.name, p.location.state].filter(Boolean).join(", ")}
      </p>
      {p.localHighlights?.length > 0 && (
        <dl>
          {p.localHighlights.map((h, i) => (
            <div key={i}>
              <dt>{h.name}</dt>
              <dd>{h.detail}</dd>
            </div>
          ))}
        </dl>
      )}
      {p.suitedFor?.length > 0 && (
        <p>
          <strong>Best suited for</strong>
          <br />
          {p.suitedFor.join(" · ")}
        </p>
      )}
      {p.latitude !== null && p.longitude !== null && (
        <a
          className="text-link"
          href={`https://www.google.com/maps/search/?api=1&query=${p.latitude},${p.longitude}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          Open location in maps
        </a>
      )}
    </section>
  );
}

export function ExternalProof({ property: p }: { property: Property }) {
  const sources =
    p.externalListings?.filter((s) => s.isVisible && s.verifiedAt) || [];
  if (!sources.length) return null;
  return (
    <section className="detail-section">
      <p className="eyebrow">OUTSIDE OUR PAGES</p>
      <h2>See the original sources</h2>
      {sources.map((s) => (
        <div className="proof" key={s.id}>
          <div>
            <strong>{s.provider}</strong>
            {s.rating !== null && (
              <p>
                {s.rating} / 5
                {s.reviewCount !== null
                  ? ` · ${s.reviewCount} external reviews`
                  : ""}
              </p>
            )}
            <small>Source checked {s.verifiedAt?.slice(0, 10)}</small>
          </div>
          <a
            href={s.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-link"
          >
            View listing
          </a>
        </div>
      ))}
    </section>
  );
}

export function Operator({
  settings: s,
  locations = [],
}: {
  settings: Settings;
  locations?: Location[];
}) {
  if (
    !s.operatorName &&
    !s.aboutText &&
    !s.supportPhone &&
    !s.supportEmail &&
    !s.defaultWhatsappNumber
  )
    return null;
  return (
    <section className="operator-section">
      <div>
        <p className="eyebrow">THE PEOPLE BEHIND THE STAY</p>
        <h2>Meet Modern Airbnd</h2>
        {s.operatorName && <h3>{s.operatorName}</h3>}
        {s.aboutText && <p className="prose">{s.aboutText}</p>}
        {locations.length > 0 && (
          <p>
            <strong>Our locations</strong>
            <br />
            {locations.map((l) => l.name).join(" · ")}
          </p>
        )}
        {s.businessAddress && <p>{s.businessAddress}</p>}
      </div>
      <div className="operator-contact">
        <h3>Talk to the property team</h3>
        {s.supportPhone && (
          <a href={`tel:${s.supportPhone}`}>{s.supportPhone}</a>
        )}
        {s.supportEmail && (
          <a href={`mailto:${s.supportEmail}`}>{s.supportEmail}</a>
        )}
        {s.defaultWhatsappNumber && (
          <a
            className="button primary"
            href={`https://wa.me/${s.defaultWhatsappNumber.slice(1)}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            Contact on WhatsApp
          </a>
        )}
        <p className="small muted">
          Availability is maintained manually. Enquire directly to confirm
          arrangements.
        </p>
        <Link href="/contact" className="text-link">
          All contact details
        </Link>
      </div>
    </section>
  );
}
