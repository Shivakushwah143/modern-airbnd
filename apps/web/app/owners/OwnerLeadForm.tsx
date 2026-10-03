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
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(e: FormEvent) {
    e.preventDefault();
    setStatus("");
    setError("");
    setBusy(true);
    try {
      await api("/owner-leads", {
        method: "POST",
        body: JSON.stringify(form),
      });
      setForm({
        name: "",
        phone: "",
        email: "",
        city: "",
        propertyType: "",
        message: "",
      });
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
              type={key === "email" ? "email" : "text"}
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
      {error && <p className="field-error">{error}</p>}
      {status && <p className="notice success">{status}</p>}
      <button className="button primary" disabled={busy}>
        {busy ? "Saving..." : "Submit property lead"}
      </button>
    </form>
  );
}
