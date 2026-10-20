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
export function TestimonialGallery({
  items,
  demo = false,
}: {
  items: Testimonial[];
  demo?: boolean;
}) {
  const [filter, setFilter] = useState<Filter>("ALL");
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const lightboxRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number | null>(null);

  const visible = items.filter(
    (item) => filter === "ALL" || item.mediaType === filter,
  );
  const screenshots = visible.filter((item) => item.mediaType === "IMAGE");

  useEffect(() => {
    if (openIndex === null) return;
    const previous = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpenIndex(null);
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        setOpenIndex((index) =>
          index === null
            ? null
            : (index - 1 + screenshots.length) % screenshots.length,
        );
      }
      if (e.key === "ArrowRight") {
        e.preventDefault();
        setOpenIndex((index) =>
          index === null ? null : (index + 1) % screenshots.length,
        );
      }
      if (e.key === "Tab") {
        const controls = lightboxRef.current?.querySelectorAll<HTMLElement>(
          'button:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])',
        );
        if (!controls?.length) return;
        const first = controls[0];
        const last = controls[controls.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
      previous?.focus?.();
    };
  }, [openIndex, screenshots.length]);

  const opened = openIndex === null ? null : (screenshots[openIndex] ?? null);

  return (
    <>
      <div
        className="testimonial-filters"
        role="group"
        aria-label="Filter testimonials by media type"
      >
        {(
          [
            ["ALL", `All (${items.length})`],
            [
              "IMAGE",
              `Screenshots (${items.filter((i) => i.mediaType === "IMAGE").length})`,
            ],
            [
              "VIDEO",
              `Videos (${items.filter((i) => i.mediaType === "VIDEO").length})`,
            ],
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
        {visible.length === 0 && (
          <p className="testimonial-filter-empty" role="status">
            No {filter === "VIDEO" ? "videos" : "screenshots"} are published
            yet. Choose All to see the other testimonials.
          </p>
        )}
        {visible.map((item) => {
          const label = demo
            ? `Demo ${item.mediaType === "VIDEO" ? "video" : "screenshot"}: ${item.ownerName}; not a real review`
            : `${item.ownerName} uploaded ${item.mediaType === "VIDEO" ? "a short video" : "a screenshot"}`;
          return (
            <figure className="testimonial-card" key={item.id}>
              {demo && (
                <span className="portfolio-demo-badge">
                  Sample testimonial · not a real review
                </span>
              )}
              {item.mediaUrl && (
                <div className="testimonial-media">
                  {item.mediaType === "VIDEO" ? (
                    <video
                      controls
                      playsInline
                      preload="metadata"
                      aria-label={label}
                    >
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
                      onClick={() =>
                        setOpenIndex(
                          screenshots.findIndex(
                            (image) => image.id === item.id,
                          ),
                        )
                      }
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
              {item.quote.trim() && (
                <blockquote>
                  <p>{item.quote}</p>
                </blockquote>
              )}
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
                {demo ? "Illustrative example" : "Owner-uploaded"}{" "}
                {item.mediaType === "VIDEO" ? "video" : "screenshot"}
              </p>
            </figure>
          );
        })}
      </div>

      {opened && (
        <div
          ref={lightboxRef}
          className="media-lightbox"
          role="dialog"
          aria-modal="true"
          aria-label={`Screenshot from ${opened.ownerName}`}
          onClick={(e) => {
            if (e.target === e.currentTarget) setOpenIndex(null);
          }}
          onTouchStart={(e) => {
            touchStartX.current = e.changedTouches[0]?.clientX ?? null;
          }}
          onTouchEnd={(e) => {
            const startX = touchStartX.current;
            const endX = e.changedTouches[0]?.clientX;
            touchStartX.current = null;
            if (startX === null || endX === undefined || screenshots.length < 2)
              return;
            const delta = endX - startX;
            if (Math.abs(delta) < 48) return;
            setOpenIndex((index) =>
              index === null
                ? null
                : (index + (delta < 0 ? 1 : -1) + screenshots.length) %
                  screenshots.length,
            );
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
            <div className="lightbox-image-wrap">
              {screenshots.length > 1 && (
                <button
                  type="button"
                  className="lightbox-step lightbox-previous"
                  aria-label="Previous owner screenshot"
                  onClick={() =>
                    setOpenIndex((index) =>
                      index === null
                        ? null
                        : (index - 1 + screenshots.length) % screenshots.length,
                    )
                  }
                >
                  Previous
                </button>
              )}
              <img
                src={opened.mediaUrl}
                alt={`Screenshot shared by ${opened.ownerName}`}
              />
              {screenshots.length > 1 && (
                <button
                  type="button"
                  className="lightbox-step lightbox-next"
                  aria-label="Next owner screenshot"
                  onClick={() =>
                    setOpenIndex((index) =>
                      index === null ? null : (index + 1) % screenshots.length,
                    )
                  }
                >
                  Next
                </button>
              )}
            </div>
            <p className="small" style={{ color: "#e9efec", margin: 0 }}>
              {opened.quote ||
                `${opened.ownerName}${opened.city ? ` · ${opened.city}` : ""}`}
            </p>
          </div>
        </div>
      )}
    </>
  );
}
