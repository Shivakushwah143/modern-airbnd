"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import type { Availability } from "@modern-airbnd/contracts";
import { api } from "@/lib/api";
import { stayAction } from "@/lib/cta";
export function StayAction({
  status,
  propertyId,
  maxGuests,
  stayDates = {},
  mobile = false,
}: {
  status: Availability["status"];
  propertyId: string;
  maxGuests: number;
  stayDates?: { checkIn?: string; checkOut?: string };
  mobile?: boolean;
}) {
  const router = useRouter(),
    action = stayAction(status);
  const [adults, setAdults] = useState(1),
    [children, setChildren] = useState(0),
    [guestName, setGuestName] = useState(""),
    [phone, setPhone] = useState(""),
    [message, setMessage] = useState(""),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  function openDates() {
    document.getElementById("search")?.scrollIntoView({ block: "center" });
    window.dispatchEvent(new Event("modern-airbnd:dates"));
  }
  async function submit(e: FormEvent) {
    e.preventDefault();
    setError("");
    if (!stayDates.checkIn || !stayDates.checkOut) return openDates();
    if (adults + children > maxGuests)
      return setError(`This property allows up to ${maxGuests} guests.`);
    setBusy(true);
    try {
      const result = await api<{ whatsappUrl: string | null }>("/enquiries", {
        method: "POST",
        body: JSON.stringify({
          propertyId,
          checkIn: stayDates.checkIn,
          checkOut: stayDates.checkOut,
          adults,
          children,
          guestName,
          phone,
          message,
        }),
      });
      if (!result.whatsappUrl)
        throw new Error("WhatsApp is not configured for this property.");
      window.open(result.whatsappUrl, "_blank", "noopener,noreferrer");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to save enquiry.");
    } finally {
      setBusy(false);
    }
  }
  if (action.kind === "whatsapp")
    return (
      <form className={mobile ? "mobile-sticky enquiry-mini" : "desktop-enquiry enquiry-form"} onSubmit={submit}>
        {!mobile && (
          <>
            <div className="form-grid">
              <label>
                Adults
                <input type="number" min="1" max={maxGuests} value={adults} onChange={(e) => setAdults(Number(e.target.value))} required />
              </label>
              <label>
                Children
                <input type="number" min="0" max={maxGuests} value={children} onChange={(e) => setChildren(Number(e.target.value))} />
              </label>
            </div>
            <label>
              Guest name
              <input value={guestName} onChange={(e) => setGuestName(e.target.value)} required maxLength={120} />
            </label>
            <label>
              Phone
              <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91..." required />
            </label>
            <label>
              Message (optional)
              <textarea rows={3} value={message} onChange={(e) => setMessage(e.target.value)} maxLength={1000} />
            </label>
          </>
        )}
        {mobile && (
          <>
            <input aria-label="Adults" type="number" min="1" max={maxGuests} value={adults} onChange={(e) => setAdults(Number(e.target.value))} />
            <input aria-label="Name" value={guestName} onChange={(e) => setGuestName(e.target.value)} placeholder="Name" required />
            <input aria-label="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91..." required />
          </>
        )}
        {error && <p className="field-error">{error}</p>}
        <button className="button primary" disabled={busy}>
          {busy ? "Saving..." : action.label}
        </button>
      </form>
    );
  return (
    <div className={mobile ? "mobile-sticky" : "desktop-enquiry"}>
      <button
        className="button primary"
        onClick={action.kind === "retry" ? () => router.refresh() : openDates}
      >
        {action.label}
      </button>
      {status === "UNKNOWN" && (
        <Link href="/contact" className="text-link">
          Contact Us
        </Link>
      )}
    </div>
  );
}
