"use client";
import { useState } from "react";
const iso = (d: Date) => d.toISOString().slice(0, 10);
export function DateRange({
  start,
  end,
  onChange,
  today,
}: {
  start: string;
  end: string;
  onChange: (start: string, end: string) => void;
  today: string;
}) {
  const [month, setMonth] = useState((start || today).slice(0, 7));
  const [choosing, setChoosing] = useState<"start" | "end">(
    start && !end ? "end" : "start",
  );
  const first = new Date(month + "-01T00:00:00Z");
  const days = new Date(
    Date.UTC(first.getUTCFullYear(), first.getUTCMonth() + 1, 0),
  ).getUTCDate();
  function shift(n: number) {
    setMonth(
      iso(
        new Date(Date.UTC(first.getUTCFullYear(), first.getUTCMonth() + n, 1)),
      ).slice(0, 7),
    );
  }
  function select(date: string) {
    if (choosing === "start" || !start || date <= start) {
      onChange(date, "");
      setChoosing("end");
    } else {
      onChange(start, date);
      setChoosing("start");
    }
  }
  return (
    <div className="date-range">
      <div className="date-choice">
        <button
          type="button"
          aria-pressed={choosing === "start"}
          onClick={() => setChoosing("start")}
        >
          <small>Check-in</small>
          <strong>{start || "Choose a date"}</strong>
        </button>
        <button
          type="button"
          aria-pressed={choosing === "end"}
          onClick={() => setChoosing("end")}
        >
          <small>Check-out</small>
          <strong>{end || "Choose a date"}</strong>
        </button>
      </div>
      <p className="small muted" aria-live="polite">
        {choosing === "start"
          ? "Choose your arrival date."
          : "Now choose your departure date."}
      </p>
      <div className="month-heading">
        <button
          type="button"
          className="icon-btn"
          aria-label="Previous month"
          disabled={month <= today.slice(0, 7)}
          onClick={() => shift(-1)}
        >
          ‹
        </button>
        <h3 aria-live="polite">
          {first.toLocaleDateString("en-IN", {
            month: "long",
            year: "numeric",
            timeZone: "UTC",
          })}
        </h3>
        <button
          type="button"
          className="icon-btn"
          aria-label="Next month"
          onClick={() => shift(1)}
        >
          ›
        </button>
      </div>
      <div
        className="range-calendar"
        onKeyDown={(e) => {
          const delta = (
            {
              ArrowLeft: -1,
              ArrowRight: 1,
              ArrowUp: -7,
              ArrowDown: 7,
            } as Record<string, number>
          )[e.key];
          if (!delta) return;
          const buttons = Array.from(
            e.currentTarget.querySelectorAll<HTMLButtonElement>(
              "button:not(:disabled)",
            ),
          );
          const index = buttons.indexOf(
            document.activeElement as HTMLButtonElement,
          );
          if (index >= 0) {
            e.preventDefault();
            buttons[
              Math.max(0, Math.min(buttons.length - 1, index + delta))
            ]?.focus();
          }
        }}
      >
        {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
          <span className="weekday" key={d}>
            {d}
          </span>
        ))}
        {Array.from({ length: first.getUTCDay() }, (_, i) => (
          <span key={"empty" + i} />
        ))}
        {Array.from({ length: days }, (_, i) => {
          const date = month + "-" + String(i + 1).padStart(2, "0");
          const selected = date === start || date === end;
          return (
            <button
              type="button"
              key={date}
              disabled={date < today}
              aria-label={date}
              aria-pressed={selected}
              aria-current={date === today ? "date" : undefined}
              className={`${selected ? "range-end" : ""} ${start && end && date > start && date < end ? "in-range" : ""}`}
              onClick={() => select(date)}
            >
              {i + 1}
            </button>
          );
        })}
      </div>
      {start && end && (
        <p className="selected-stay" role="status">
          {Math.round((Date.parse(end) - Date.parse(start)) / 86400000)} nights
          · {start} to {end}
        </p>
      )}
    </div>
  );
}
