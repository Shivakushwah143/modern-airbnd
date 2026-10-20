"use client";
import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { Location } from "@modern-airbnd/contracts";
import { DateRange } from "./DateRange";
import { Dialog } from "./Dialog";
import { Icon } from "./Icon";
import { AsyncButton } from "./AsyncButton";

export function Search({
  locations,
  initial = {},
  action = "/stays",
  compact = false,
  locationReadOnly = false,
  submitLabel = "Check availability",
}: {
  locations: Location[];
  initial?: {
    location?: string;
    checkIn?: string;
    checkOut?: string;
    guests?: string;
  };
  action?: string;
  compact?: boolean;
  /** Use on a property page, where destination is fixed by the listing. */
  locationReadOnly?: boolean;
  submitLabel?: string;
}) {
  const router = useRouter();
  const [location, setLocation] = useState(initial.location || "");
  const [start, setStart] = useState(initial.checkIn || "");
  const [end, setEnd] = useState(initial.checkOut || "");
  const [guests, setGuests] = useState(() => {
    const n = Number(initial.guests);
    return Number.isInteger(n) && n >= 1 && n <= 12 ? n : 2;
  });
  const [modal, setModal] = useState<"dates" | "location" | "guests" | null>(
    null,
  );
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
    if (start) {
      q.set("checkIn", start);
      q.set("checkOut", end);
    }
    if (guests > 1) q.set("guests", String(guests));
    const suffix = q.toString();
    startTransition(() => {
      // QA-007: guest search always lands on the canonical /stays journey —
      // city list, or the selected city's listing — never the legacy
      // /properties route. Dates and guest count travel with the URL.
      const target =
        action === "/stays"
          ? location
            ? `/stays/${location}${suffix ? `?${suffix}` : ""}`
            : `/stays${suffix ? `?${suffix}` : ""}`
          : `${action}${suffix ? `?${suffix}` : ""}`;
      router.push(target);
    });
  }

  const selectedLocation = locations.find((l) => l.slug === location);
  const datePreview = (date: string) =>
    new Intl.DateTimeFormat("en-IN", {
      day: "numeric",
      month: "short",
      timeZone: "Asia/Kolkata",
    }).format(new Date(`${date}T00:00:00+05:30`));
  const tripPreview = [
    selectedLocation?.name || "Any destination",
    start
      ? end
        ? `${datePreview(start)} – ${datePreview(end)}`
        : `${datePreview(start)} · choose check-out`
      : "Dates not selected",
    `${guests} ${guests === 1 ? "guest" : "guests"}`,
  ];

  return (
    <>
      <form
        onSubmit={submit}
        className={`search-card ${compact ? "compact" : ""}`}
        id="search"
      >
        <div className="search-fields">
          {locationReadOnly ? (
            <div className="search-field search-field-static">
              <Icon name="pin" />
              <span>
                <small>Destination</small>
                <strong>{selectedLocation?.name || "This stay's city"}</strong>
              </span>
            </div>
          ) : (
            <button
              type="button"
              className="search-field"
              onClick={() => locations.length && setModal("location")}
              disabled={!locations.length}
            >
              <Icon name="pin" />
              <span>
                <small>Where are you going?</small>
                <strong>
                  {selectedLocation?.name ||
                    (locations.length
                      ? "Choose city"
                      : "No cities published yet")}
                </strong>
              </span>
              <span className="chevron">v</span>
            </button>
          )}
          <button
            type="button"
            className="search-field"
            onClick={() => setModal("dates")}
          >
            <Icon name="calendar" />
            <span>
              <small>Dates</small>
              <strong>
                {start && end ? `${start} to ${end}` : "Add dates"}
              </strong>
            </span>
            <span className="chevron">v</span>
          </button>
          {!compact && (
            <button
              type="button"
              className="search-field guest-stepper"
              onClick={() => setModal("guests")}
              aria-haspopup="dialog"
            >
              <Icon name="home" />
              <span>
                <small>Guests</small>
                <strong>
                  {guests} {guests === 1 ? "guest" : "guests"}
                </strong>
              </span>
              <span className="chevron">v</span>
            </button>
          )}
        </div>
        <div className="search-selection-preview" aria-live="polite">
          <Icon name="check" size={16} />
          <span>
            <small>Your trip</small>
            <strong>{tripPreview.join(" · ")}</strong>
          </span>
        </div>
        <AsyncButton busy={busy} busyLabel="Finding stays…">
          {submitLabel}
        </AsyncButton>
        {error && (
          <p className="field-error" role="alert">
            {error}
          </p>
        )}
      </form>
      <Dialog
        open={modal === "location"}
        onClose={() => setModal(null)}
        title="Choose a destination"
      >
        <label>
          Find a city
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
            All destinations
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
          {!locations.length && (
            <p className="notice error">
              Destinations could not be loaded. Please try again shortly.
            </p>
          )}
        </div>
      </Dialog>
      <Dialog
        open={modal === "dates"}
        onClose={() => setModal(null)}
        title="When would you like to stay?"
      >
        <p className="muted">
          Choose check-in and check-out. You can also browse without dates.
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
            Apply dates
          </button>
        </div>
      </Dialog>
      <Dialog
        open={modal === "guests"}
        onClose={() => setModal(null)}
        title="How many guests?"
      >
        <div className="guest-picker">
          <div>
            <strong>Guests</strong>
            <p className="muted small">Choose up to 12 guests.</p>
          </div>
          <div className="guest-picker-controls" aria-live="polite">
            <button
              type="button"
              className="button secondary"
              aria-label="Remove guest"
              disabled={guests <= 1}
              onClick={() => setGuests((value) => Math.max(1, value - 1))}
            >
              −
            </button>
            <output aria-label={`${guests} ${guests === 1 ? "guest" : "guests"}`}>
              {guests}
            </output>
            <button
              type="button"
              className="button secondary"
              aria-label="Add guest"
              disabled={guests >= 12}
              onClick={() => setGuests((value) => Math.min(12, value + 1))}
            >
              +
            </button>
          </div>
        </div>
        <div className="dialog-actions">
          <button className="button primary" type="button" onClick={() => setModal(null)}>
            Done
          </button>
        </div>
      </Dialog>
    </>
  );
}
