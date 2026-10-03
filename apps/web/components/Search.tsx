"use client";
import { useState, useTransition, useEffect } from "react";
import { DateRange } from "./DateRange";
import { useRouter } from "next/navigation";
import type { Location } from "@modern-airbnd/contracts";
import { Dialog } from "./Dialog";
import { Icon } from "./Icon";
export function Search({
  locations,
  initial = {},
  action = "/properties",
  compact = false,
}: {
  locations: Location[];
  initial?: { location?: string; checkIn?: string; checkOut?: string };
  action?: string;
  compact?: boolean;
}) {
  const router = useRouter();
  const [location, setLocation] = useState(initial.location || "");
  const [start, setStart] = useState(initial.checkIn || "");
  const [end, setEnd] = useState(initial.checkOut || "");
  const [modal, setModal] = useState<"dates" | "location" | null>(null);
  const [error, setError] = useState("");
  const [busy, startTransition] = useTransition();
  const [locationFilter, setLocationFilter] = useState("");
  useEffect(() => {
    const open = () => setModal("dates");
    window.addEventListener("modern-airbnd:dates", open);
    return () => window.removeEventListener("modern-airbnd:dates", open);
  }, []);
  const today = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
  function validate() {
    if ((start && !end) || (!start && end))
      return "Choose both check-in and check-out.";
    if (start && start < today) return "Check-in cannot be in the past.";
    if (start && end <= start) return "Check-out must be after check-in.";
    return "";
  }
  function submit(e: React.FormEvent) {
    e.preventDefault();
    const err = validate();
    setError(err);
    if (err) {
      setModal("dates");
      return;
    }
    const q = new URLSearchParams();
    if (location) q.set("location", location);
    if (start) {
      q.set("checkIn", start);
      q.set("checkOut", end);
    }
    startTransition(() => {
      router.push(`${action}?${q}`);
      router.refresh();
    });
  }
  return (
    <>
      <form
        onSubmit={submit}
        className={`search-card ${compact ? "compact" : ""}`}
        id="search"
      >
        <div className="search-fields">
          {locations.length > 0 && (
            <button
              type="button"
              className="search-field"
              onClick={() => setModal("location")}
            >
              <Icon name="pin" />
              <span>
                <small>Where would you like to stay?</small>
                <strong>
                  {locations.find((l) => l.slug === location)?.name ||
                    "Explore all locations"}
                </strong>
              </span>
              <span className="chevron">⌄</span>
            </button>
          )}
          <button
            type="button"
            className="search-field"
            onClick={() => setModal("dates")}
          >
            <Icon name="calendar" />
            <span>
              <small>Check-in · Check-out</small>
              <strong>
                {start && end ? `${start} — ${end}` : "Add your dates"}
              </strong>
            </span>
            <span className="chevron">⌄</span>
          </button>
        </div>
        <button className="button primary" disabled={busy}>
          {busy ? "Checking…" : "Check Availability"}
        </button>
        {error && (
          <p className="field-error" role="alert">
            {error}
          </p>
        )}
      </form>
      <Dialog
        open={modal === "location"}
        onClose={() => setModal(null)}
        title="Choose a location"
      >
        <label>
          Find a location
          <input
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
            placeholder="City or region"
          />
        </label>
        <div className="location-options">
          <button
            onClick={() => {
              setLocation("");
              setModal(null);
            }}
          >
            All locations
          </button>
          {locations
            .filter((l) =>
              (l.name + " " + l.state)
                .toLowerCase()
                .includes(locationFilter.toLowerCase()),
            )
            .map((l) => (
              <button
                aria-pressed={location === l.slug}
                key={l.id}
                onClick={() => {
                  setLocation(l.slug);
                  setModal(null);
                }}
              >
                <Icon name="pin" />
                <span>
                  {l.name}
                  <small>{l.state}</small>
                </span>
                {location === l.slug && <Icon name="check" />}
              </button>
            ))}
        </div>
      </Dialog>
      <Dialog
        open={modal === "dates"}
        onClose={() => setModal(null)}
        title="When would you like to stay?"
      >
        <p className="muted">
          Choose your check-in and check-out. You can also browse without dates.
        </p>
        <DateRange
          start={start}
          end={end}
          today={today}
          onChange={(s, e) => {
            setStart(s);
            setEnd(e);
            setError("");
          }}
        />
        {error && (
          <p className="field-error" role="alert">
            {error}
          </p>
        )}
        <div className="dialog-actions">
          <button
            className="button secondary"
            onClick={() => {
              setStart("");
              setEnd("");
              setError("");
              setModal(null);
            }}
          >
            Clear dates
          </button>
          <button
            className="button primary"
            onClick={() => {
              const err = validate();
              setError(err);
              if (!err) setModal(null);
            }}
          >
            Apply Dates
          </button>
        </div>
      </Dialog>
    </>
  );
}
