import { api } from "@/lib/api";
import type { Settings } from "@modern-airbnd/contracts";
export const metadata = { title: "Contact the property team" };
export default async function Contact() {
  const s = await api<Settings>("/settings/public");
  return (
    <div className="container section narrow">
      <p className="eyebrow">LET’S TALK</p>
      <h1>A conversation away.</h1>
      <p className="intro">
        Ask about a property, explore alternative dates, or get the details you
        need before your stay.
      </p>
      <div className="contact-options">
        {s.defaultWhatsappNumber && (
          <a
            className="button primary"
            href={`https://wa.me/${s.defaultWhatsappNumber.slice(1)}?text=${encodeURIComponent("Hi, I would like to enquire about a stay with Modern Airbnd.")}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            Enquire on WhatsApp
          </a>
        )}
        {s.supportPhone && (
          <a className="button secondary" href={`tel:${s.supportPhone}`}>
            {s.supportPhone}
          </a>
        )}
        {s.supportEmail && (
          <a className="button secondary" href={`mailto:${s.supportEmail}`}>
            {s.supportEmail}
          </a>
        )}
        {!s.defaultWhatsappNumber && !s.supportPhone && !s.supportEmail && (
          <p className="notice">
            Contact details have not been published yet. Please check back soon.
          </p>
        )}
      </div>
      {s.operatorName && <h2>{s.operatorName}</h2>}
      {s.businessAddress && <p>{s.businessAddress}</p>}
      <p className="muted">
        Enquiries do not reserve accommodation. The property team will confirm
        arrangements directly.
      </p>
    </div>
  );
}
