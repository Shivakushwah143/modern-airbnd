"use client";
import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { Location } from "@modern-airbnd/contracts";
import { DateRange } from "./DateRange";
import { Dialog } from "./Dialog";
import { Icon } from "./Icon";

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
      router.refresh();
    });
  }

  const selectedLocation = locations.find((l) => l.slug === location);

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
              <strong>{start && end ? `${start} to ${end}` : "Add dates"}</strong>
            </span>
            <span className="chevron">v</span>
          </button>
          {!compact && (
            <div className="search-field guest-stepper">
              <Icon name="home" />
              <span>
                <small>Guests</small>
                <strong>
                  {guests} {guests === 1 ? "guest" : "guests"}
                </strong>
              </span>
              <button
                type="button"
                aria-label="Remove guest"
                onClick={() => setGuests((v) => Math.max(1, v - 1))}
              >
                -
              </button>
              <button
                type="button"
                aria-label="Add guest"
                onClick={() => setGuests((v) => Math.min(12, v + 1))}
              >
                +
              </button>
            </div>
          )}
        </div>
        <button className="button primary" disabled={busy}>
          {busy ? "Checking..." : submitLabel}
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
    </>
  );
}
