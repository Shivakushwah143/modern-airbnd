"use client";
import { useRef, useState } from "react";
import type { Media } from "@modern-airbnd/contracts";
import { Photo } from "./Photo";
import { Dialog } from "./Dialog";
export function Gallery({ media, demo }: { media: Media[]; demo: boolean }) {
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);
  const start = useRef(0);
  const count = media.length;
  return (
    <>
      <div
        className="gallery"
        onTouchStart={(e) => {
          start.current = e.touches[0].clientX;
        }}
        onTouchEnd={(e) => {
          const d = e.changedTouches[0].clientX - start.current;
          if (Math.abs(d) > 50 && count)
            setIndex((i) => (i + (d < 0 ? 1 : -1) + count) % count);
        }}
      >
        <button
          className="gallery-main"
          disabled={!count}
          onClick={() => setOpen(true)}
          aria-label="Open full photo gallery"
        >
          <Photo media={media[index]} demo={demo} priority />
        </button>
        {count > 1 && (
          <div className="gallery-thumbs">
            {media.slice(1, 3).map((m, i) => (
              <button
                key={m.id}
                onClick={() => {
                  setIndex(i + 1);
                  setOpen(true);
                }}
                aria-label={`View photo ${i + 2}`}
              >
                <Photo media={m} />
              </button>
            ))}
          </div>
        )}
        {count > 0 && (
          <div className="gallery-controls">
            <button
              aria-label="Previous photo"
              onClick={() => setIndex((i) => (i - 1 + count) % count)}
            >
              ‹
            </button>
            <span>
              {index + 1} / {count}
            </span>
            <button
              aria-label="Next photo"
              onClick={() => setIndex((i) => (i + 1) % count)}
            >
              ›
            </button>
          </div>
        )}
      </div>
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title={`Property photos · ${index + 1} of ${count}`}
      >
        <div
          className="full-photo"
          onTouchStart={(e) => {
            start.current = e.touches[0].clientX;
          }}
          onTouchEnd={(e) => {
            const d = e.changedTouches[0].clientX - start.current;
            if (Math.abs(d) > 50 && count)
              setIndex((i) => (i + (d < 0 ? 1 : -1) + count) % count);
          }}
        >
          <Photo media={media[index]} />
        </div>
        <div className="dialog-actions">
          <button
            className="button secondary"
            onClick={() => setIndex((i) => (i - 1 + count) % count)}
          >
            Previous photo
          </button>
          <button
            className="button secondary"
            onClick={() => setIndex((i) => (i + 1) % count)}
          >
            Next photo
          </button>
        </div>
      </Dialog>
    </>
  );
}
