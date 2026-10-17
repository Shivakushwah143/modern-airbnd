import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import type { Property, Settings } from "@modern-airbnd/contracts";
import { api, ApiError, emptySettings } from "@/lib/api";
import { EnquiryForm } from "@/components/EnquiryForm";
import { Photo } from "@/components/Photo";

async function loadProperty(slug: string): Promise<Property | null> {
  try {
    return await api<Property>(`/properties/${encodeURIComponent(slug)}`);
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) notFound();
    return null;
  }
}

export const metadata: Metadata = {
  title: "Booking enquiry",
  robots: { index: false, follow: false },
};

export default async function EnquirePage({
  params,
  searchParams,
}: {
  params: Promise<{ city: string; slug: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const { city, slug } = await params;
  const raw = await searchParams;
  const property = await loadProperty(slug);
  if (!property || property.location.slug !== city) notFound();

  let settings: Settings = emptySettings;
  try {
    settings = await api<Settings>("/settings/public");
  } catch {
    /* settings optional for the form */
  }

  const stayDates = { checkIn: raw.checkIn, checkOut: raw.checkOut };

  return (
    <div className="container section">
      <div className="page-hero-band">
        <nav className="breadcrumb" aria-label="Breadcrumb">
          <Link href="/stays">Stays</Link>
          <span aria-hidden="true">/</span>
          <Link href={`/stays/${city}`}>{property.location.name}</Link>
          <span aria-hidden="true">/</span>
          <Link href={`/stays/${city}/${slug}`}>{property.name}</Link>
          <span aria-hidden="true">/</span>
          <span aria-current="page">Enquire</span>
        </nav>
        <p className="eyebrow">Booking enquiry</p>
        <h1>Request {property.name}</h1>
        <p className="intro">
          Send your dates and details. The team replies on WhatsApp or by phone
          to confirm — an enquiry never blocks inventory on its own.
        </p>
      </div>

      <div className="enquiry-shell">
        <EnquiryForm
          propertyId={property.id}
          maxGuests={property.maxGuests}
          isDemo={property.isDemo}
          initial={stayDates}
        />
        <aside className="enquiry-summary" aria-label="Stay summary">
          <div className="portfolio-cover" style={{ borderRadius: 14, overflow: "hidden" }}>
            {property.media[0] ? (
              <Photo media={property.media[0]} />
            ) : (
              <span className="city-icon-art" aria-hidden="true" />
            )}
          </div>
          <h2 style={{ margin: 0, fontSize: "1.05rem" }}>{property.name}</h2>
          <p className="muted small" style={{ margin: 0 }}>
            {property.area ? `${property.area} · ` : ""}
            {property.location.name}
          </p>
          <p className="facts" style={{ margin: 0 }}>
            {property.bedrooms} bedrooms · {property.bathrooms} baths · up to{" "}
            {property.maxGuests} guests
          </p>
          {settings.supportPhone && (
            <p className="muted small" style={{ margin: 0 }}>
              Prefer to talk? Call the team at {settings.supportPhone}.
            </p>
          )}
          <Link className="text-link" href={`/stays/${city}/${slug}`}>
            Back to the stay
          </Link>
        </aside>
      </div>
    </div>
  );
}