"use client";
import { useEffect, useRef, useState } from "react";
import type { Testimonial } from "@modern-airbnd/contracts";

type Filter = "ALL" | "IMAGE" | "VIDEO";

/**
 * QA-017: mixed screenshot/video testimonial gallery.
 * - filter between all / screenshots / videos
 * - images open in an accessible lightbox (Escape, backdrop and close button;
 *   the expanded screenshot is never cropped)
 * - videos play only on explicit user action, with captions track and an
 *   optional transcript.
 */
export function TestimonialGallery({ items }: { items: Testimonial[] }) {
  const [filter, setFilter] = useState<Filter>("ALL");
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  const visible = items.filter(
    (item) => filter === "ALL" || item.mediaType === filter,
  );

  useEffect(() => {
    if (openIndex === null) return;
    const previous = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpenIndex(null);
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      previous?.focus?.();
    };
  }, [openIndex]);

  const opened = openIndex === null ? null : visible[openIndex] ?? null;

  return (
    <>
      <div className="testimonial-filters" role="group" aria-label="Filter testimonials by media type">
        {(
          [
            ["ALL", `All (${items.length})`],
            [
              "IMAGE",
              `Screenshots (${items.filter((i) => i.mediaType === "IMAGE").length})`,
            ],
            ["VIDEO", `Videos (${items.filter((i) => i.mediaType === "VIDEO").length})`],
          ] as const
        ).map(([value, label]) => (
          <button
            key={value}
            type="button"
            className={`button ${filter === value ? "primary" : "secondary"}`}
            aria-pressed={filter === value}
            onClick={() => {
              setFilter(value);
              setOpenIndex(null);
            }}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="testimonial-grid">
        {visible.map((item, index) => {
          const label = `${item.ownerName} uploaded ${item.mediaType === "VIDEO" ? "a short video" : "a screenshot"}`;
          return (
            <figure className="testimonial-card" key={item.id}>
              {item.mediaUrl && (
                <div className="testimonial-media">
                  {item.mediaType === "VIDEO" ? (
                    <video controls playsInline preload="metadata" aria-label={label}>
                      <source src={item.mediaUrl} />
                      {item.captionsUrl ? (
                        <track
                          kind="captions"
                          src={item.captionsUrl}
                          srcLang="en"
                          label="Captions"
                          default
                        />
                      ) : null}
                    </video>
                  ) : (
                    <button
                      type="button"
                      className="lightbox-trigger"
                      onClick={() => setOpenIndex(index)}
                      aria-label={`View full screenshot: ${label}`}
                    >
                      <img
                        src={item.mediaUrl}
                        alt={label}
                        loading="lazy"
                        width={640}
                        height={480}
                      />
                      <span aria-hidden="true">⤢ enlarge</span>
                    </button>
                  )}
                </div>
              )}
              <blockquote>
                <p>{item.quote || "Owner-shared media from their property."}</p>
              </blockquote>
              <figcaption>
                <cite>
                  <strong>{item.ownerName}</strong>
                  {item.city && <> · {item.city}</>}
                </cite>
              </figcaption>
              {item.mediaType === "VIDEO" && item.transcript && (
                <details className="media-transcript">
                  <summary>Video transcript</summary>
                  <p>{item.transcript}</p>
                </details>
              )}
              <p className="small muted">
                Owner-uploaded {item.mediaType === "VIDEO" ? "video" : "screenshot"}
              </p>
            </figure>
          );
        })}
      </div>

      {opened && (
        <div
          className="media-lightbox"
          role="dialog"
          aria-modal="true"
          aria-label={`Screenshot from ${opened.ownerName}`}
          onClick={(e) => {
            if (e.target === e.currentTarget) setOpenIndex(null);
          }}
        >
          <div className="lightbox-inner">
            <button
              ref={closeRef}
              type="button"
              className="button secondary lightbox-close"
              onClick={() => setOpenIndex(null)}
            >
              Close screenshot
            </button>
            {/* Expanded screenshots use `object-fit: contain` (see globals.css)
                so any text inside the image stays legible — never cropped. */}
            <img src={opened.mediaUrl} alt={`Screenshot from ${opened.ownerName}`} />
            <p className="small" style={{ color: "#e9efec", margin: 0 }}>
              {opened.quote || `${opened.ownerName}${opened.city ? ` · ${opened.city}` : ""}`}
            </p>
          </div>
        </div>
      )}
    </>
  );
}