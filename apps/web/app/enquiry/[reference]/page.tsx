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

  // QA-018: verify the reference against the server instead of asserting that
  // any well-formed UUID is a saved enquiry. The receipt carries no PII.
  let verified = false;
  try {
    const receipt = await api<{ reference: string }>(
      `/enquiries/${encodeURIComponent(reference)}/receipt`,
    );
    verified = receipt.reference === reference;
  } catch {
    verified = false;
  }

  let settings: Settings = emptySettings;
  try {
    settings = await api<Settings>("/settings/public");
  } catch {
    /* contact details optional */
  }

  return (
    <div className="container section empty-state" role="status">
      <p className="eyebrow">
        {verified ? "ENQUIRY LOGGED" : "REFERENCE NOT CONFIRMED"}
      </p>
      <h1>
        {verified
          ? "Your enquiry is with the property team."
          : "We couldn't match this reference to a saved enquiry."}
      </h1>
      <p>
        {verified
          ? "Keep this reference for your records. The team reviews each request personally and replies on WhatsApp or by phone to confirm availability and next steps."
          : "If you submitted an enquiry moments ago it may still be processing — every enquiry reaches the team either way. You can contact them directly for confirmation."}
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