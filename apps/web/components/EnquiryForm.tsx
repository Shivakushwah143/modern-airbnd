"use client";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

type EnquiryCreated = {
  enquiry: { id: string };
  whatsappUrl: string | null;
};

export function EnquiryForm({
  propertyId,
  maxGuests = 2,
  isDemo = false,
  initial = {},
}: {
  propertyId: string;
  maxGuests?: number;
  isDemo?: boolean;
  initial?: { checkIn?: string; checkOut?: string; guests?: string };
}) {
  const router = useRouter();
  const [checkIn, setCheckIn] = useState(initial.checkIn || "");
  const [checkOut, setCheckOut] = useState(initial.checkOut || "");
  const [adults, setAdults] = useState(() => {
    const n = Number(initial.guests);
    return Number.isInteger(n) && n >= 1 ? Math.min(n, maxGuests) : 1;
  });
  const [children, setChildren] = useState(0);
  const [guestName, setGuestName] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const today = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());

  function validate() {
    if (isDemo) return "Demonstration stays cannot be enquired.";
    if (!checkIn || !checkOut) return "Choose check-in and check-out dates.";
    if (checkIn < today) return "Check-in cannot be in the past.";
    if (checkOut <= checkIn) return "Check-out must be after check-in.";
    if (adults + children > maxGuests)
      return `This stay allows up to ${maxGuests} guests.`;
    if (guestName.trim().length < 2) return "Enter your name.";
    if (!/^\+?[0-9\s-]{7,18}$/.test(phone.trim()))
      return "Enter a valid phone number, e.g. +91 followed by the number.";
    if (!consent)
      return "Please agree to be contacted so the team can reply to your enquiry.";
    return "";
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    const problem = validate();
    setError(problem);
    if (problem) return;
    setBusy(true);
    try {
      const result = await api<EnquiryCreated>("/enquiries", {
        method: "POST",
        body: JSON.stringify({
          propertyId,
          checkIn,
          checkOut,
          adults,
          children,
          guestName: guestName.trim(),
          phone: phone.trim(),
          message: message.trim(),
          consentAccepted: consent,
        }),
      });
      router.push(`/enquiry/${result.enquiry.id}`);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to send your enquiry.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="enquiry-form" onSubmit={submit} noValidate>
      <div className="form-grid">
        <label>
          Check-in
          <input
            type="date"
            value={checkIn}
            min={today}
            onChange={(e) => setCheckIn(e.target.value)}
            required
          />
        </label>
        <label>
          Check-out
          <input
            type="date"
            value={checkOut}
            min={checkIn || today}
            onChange={(e) => setCheckOut(e.target.value)}
            required
          />
        </label>
      </div>
      <div className="form-grid">
        <label>
          Adults
          <input
            type="number"
            min={1}
            max={maxGuests}
            value={adults}
            onChange={(e) => setAdults(Number(e.target.value))}
            required
          />
        </label>
        <label>
          Children
          <input
            type="number"
            min={0}
            max={maxGuests}
            value={children}
            onChange={(e) => setChildren(Number(e.target.value))}
          />
        </label>
      </div>
      <label>
        Your name
        <input
          value={guestName}
          maxLength={120}
          onChange={(e) => setGuestName(e.target.value)}
          required
          autoComplete="name"
        />
      </label>
      <label>
        Phone
        <input
          value={phone}
          placeholder="+91..."
          maxLength={18}
          onChange={(e) => setPhone(e.target.value)}
          required
          autoComplete="tel"
        />
      </label>
      <label>
        Message (optional)
        <textarea
          rows={4}
          value={message}
          maxLength={1000}
          onChange={(e) => setMessage(e.target.value)}
        />
      </label>
      <label className="checkbox">
        <input
          type="checkbox"
          checked={consent}
          onChange={(e) => setConsent(e.target.checked)}
          required
        />
        {/* QA-019: placeholder for the business-approved copy; links to the
            site's own Privacy Notice instead of inventing legal terms. */}
        I agree that the Modern Stayz team may contact me about this enquiry
        and process my details as described in the{" "}
        <a href="/privacy">Privacy Notice</a>.
      </label>
      {error && (
        <p className="field-error" role="alert">
          {error}
        </p>
      )}
      <p className="muted small">
        Sending an enquiry does not reserve the stay. The team confirms
        availability with you directly.
      </p>
      <button className="button primary" disabled={busy}>
        {busy ? "Sending enquiry..." : "Send booking enquiry"}
      </button>
    </form>
  );
}