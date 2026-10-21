"use client";

import { useEffect, useState, type RefObject } from "react";

/** Accessible pagination for a horizontally scrolling card rail. */
export function ScrollableCardDots({
  railRef,
  count,
  label,
}: {
  railRef: RefObject<HTMLDivElement | null>;
  count: number;
  label: string;
}) {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const rail = railRef.current;
    if (!rail) return;
    setActive(0);
    const updateActive = () => {
      const cards = Array.from(rail.children) as HTMLElement[];
      if (!cards.length) return;
      const next = cards.reduce(
        (closest, card, index) =>
          Math.abs(card.offsetLeft - rail.scrollLeft) <
          Math.abs(cards[closest]!.offsetLeft - rail.scrollLeft)
            ? index
            : closest,
        0,
      );
      setActive(next);
    };
    rail.addEventListener("scroll", updateActive, { passive: true });
    updateActive();
    return () => rail.removeEventListener("scroll", updateActive);
  }, [count, railRef]);

  if (count < 2) return null;
  return (
    <div className="scrollable-card-dots" aria-label={`${label} pagination`}>
      {Array.from({ length: count }, (_, index) => (
        <button
          type="button"
          key={index}
          className={index === active ? "is-active" : ""}
          aria-label={`Show ${label} ${index + 1} of ${count}`}
          aria-current={index === active ? "true" : undefined}
          onClick={() =>
            railRef.current?.children[index]?.scrollIntoView({
              behavior: window.matchMedia("(prefers-reduced-motion: reduce)")
                .matches
                ? "auto"
                : "smooth",
              block: "nearest",
              inline: "start",
            })
          }
        />
      ))}
    </div>
  );
}
