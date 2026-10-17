"use client";
import { useState, type FormEvent } from "react";
import { api } from "@/lib/api";

export function OwnerLeadForm() {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    city: "",
    propertyType: "",
    message: "",
  });
  const [consent, setConsent] = useState(false);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(e: FormEvent) {
    e.preventDefault();
    setStatus("");
    setError("");
    if (!consent) {
      setError(
        "Please agree to be contacted so the team can reply about your property.",
      );
      return;
    }
    setBusy(true);
    try {
      await api("/owner-leads", {
        method: "POST",
        body: JSON.stringify({ ...form, consentAccepted: consent }),
      });
      setForm({
        name: "",
        phone: "",
        email: "",
        city: "",
        propertyType: "",
        message: "",
      });
      setConsent(false);
      setStatus("Lead saved. Team will contact you.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to save lead.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <form className="owner-lead-form" onSubmit={submit}>
      <div className="form-grid">
        {(
          [
            ["name", "Name", true],
            ["phone", "Phone", true],
            ["email", "Email", false],
            ["city", "Property city", false],
            ["propertyType", "Property type", false],
          ] as const
        ).map(([key, label, required]) => (
          <label key={key}>
            {label}
            <input
              required={required}
              type={key === "email" ? "email" : key === "phone" ? "tel" : "text"}
              autoComplete={
                key === "name"
                  ? "name"
                  : key === "phone"
                    ? "tel"
                    : key === "email"
                      ? "email"
                      : "off"
              }
              inputMode={key === "phone" ? "tel" : undefined}
              value={form[key]}
              onChange={(e) => setForm({ ...form, [key]: e.target.value })}
            />
          </label>
        ))}
      </div>
      <label>
        Tell us about the property
        <textarea
          rows={4}
          value={form.message}
          onChange={(e) => setForm({ ...form, message: e.target.value })}
        />
      </label>
      <label className="checkbox">
        <input
          type="checkbox"
          required
          checked={consent}
          onChange={(e) => setConsent(e.target.checked)}
        />
        {/* QA-019: placeholder for business-approved copy; links to the site's
            own Privacy Notice instead of inventing legal terms. */}
        I agree that the Modern Stayz team may contact me about this property
        enquiry and process my details as described in the{" "}
        <a href="/privacy">Privacy Notice</a>.
      </label>
      {error && <p className="field-error" role="alert">{error}</p>}
      {status && <p className="notice success" role="status">{status}</p>}
      <button className="button primary" disabled={busy}>
        {busy ? "Saving..." : "Submit property lead"}
      </button>
    </form>
  );
}
