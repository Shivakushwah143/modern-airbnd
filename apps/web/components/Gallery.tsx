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
  const previewIndexes = Array.from(
    { length: Math.min(2, Math.max(count - 1, 0)) },
    (_, offset) => (index + offset + 1) % count,
  );

  const move = (offset: number) => {
    setIndex((current) => (current + offset + count) % count);
  };

  return (
    <>
      <div
        className="gallery"
        onTouchStart={(e) => {
          start.current = e.touches[0].clientX;
        }}
        onTouchEnd={(e) => {
          const d = e.changedTouches[0].clientX - start.current;
          if (Math.abs(d) > 50 && count) move(d < 0 ? 1 : -1);
        }}
      >
        <button
          className="gallery-main"
          disabled={!count}
          onClick={() => setOpen(true)}
          aria-label="Open full photo gallery"
        >
          <span className="gallery-main-frame" key={media[index]?.id}>
            <Photo media={media[index]} demo={demo} priority />
          </span>
        </button>
        {count > 1 && (
          <div className="gallery-thumbs">
            {previewIndexes.map((previewIndex) => {
              const preview = media[previewIndex];
              return (
                <button
                  key={preview.id}
                  onClick={() => {
                    setIndex(previewIndex);
                    setOpen(true);
                  }}
                  aria-label={`View photo ${previewIndex + 1}`}
                >
                  <span className="gallery-thumb-frame" key={preview.id}>
                    <Photo media={preview} />
                  </span>
                </button>
              );
            })}
          </div>
        )}
        {count > 0 && (
          <div className="gallery-controls">
            <button aria-label="Previous photo" onClick={() => move(-1)}>
              ‹
            </button>
            <span>
              {index + 1} / {count}
            </span>
            <button aria-label="Next photo" onClick={() => move(1)}>
              ›
            </button>
            <button onClick={() => setOpen(true)}>View all photos</button>
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
            if (Math.abs(d) > 50 && count) move(d < 0 ? 1 : -1);
          }}
        >
          <Photo media={media[index]} />
        </div>
        <div className="dialog-actions">
          <button className="button secondary" onClick={() => move(-1)}>
            Previous photo
          </button>
          <button className="button secondary" onClick={() => move(1)}>
            Next photo
          </button>
        </div>
      </Dialog>
    </>
  );
}
