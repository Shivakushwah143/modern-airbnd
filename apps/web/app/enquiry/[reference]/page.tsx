import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { api, emptySettings, type Settings } from "@/lib/api";

export const metadata: Metadata = {
  title: "Enquiry received",
  robots: { index: false, follow: false },
};

const UUID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function EnquiryStatus({
  params,
}: {
  params: Promise<{ reference: string }>;
}) {
  const { reference } = await params;
  if (!UUID.test(reference)) notFound();

  let settings: Settings = emptySettings;
  try {
    settings = await api<Settings>("/settings/public");
  } catch {
    /* contact details optional */
  }

  return (
    <div className="container section empty-state" role="status">
      <p className="eyebrow">ENQUIRY LOGGED</p>
      <h1>Your enquiry is with the property team.</h1>
      <p>
        Keep this reference for your records. The team reviews each request
        personally and replies on WhatsApp or by phone to confirm availability
        and next steps.
      </p>
      <span className="reference-chip">{reference}</span>
      <p className="muted small">
        An enquiry is a conversation, not a reservation. Inventory is confirmed
        only when the team accepts the dates with you.
      </p>
      <div className="row-actions" style={{ justifyContent: "center" }}>
        <Link className="button primary" href="/stays">
          Browse more stays
        </Link>
        <Link className="button secondary" href="/contact">
          Contact the team
        </Link>
      </div>
      {settings.supportPhone && (
        <p className="muted small">
          Operations phone: {settings.supportPhone}
          {settings.supportEmail ? ` · ${settings.supportEmail}` : ""}
        </p>
      )}
    </div>
  );
}