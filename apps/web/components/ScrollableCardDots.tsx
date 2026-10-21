"use client";

import { useEffect, useRef, useState, type ReactNode, type RefObject } from "react";

/** Advances a rail on phones only, without interrupting hover or keyboard use. */
export function useMobileAutoAdvance(
  railRef: RefObject<HTMLElement | null>,
  count: number,
  enabled = true,
) {
  useEffect(() => {
    const rail = railRef.current;
    if (!rail || !enabled || count < 2) return;
    const phone = window.matchMedia("(max-width: 639px)");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let timer: number | undefined;

    const stop = () => {
      if (timer) window.clearInterval(timer);
      timer = undefined;
    };
    const advance = () => {
      const cards = Array.from(rail.children) as HTMLElement[];
      if (cards.length < 2) return;
      const current = cards.reduce(
        (closest, card, index) =>
          Math.abs(card.offsetLeft - rail.scrollLeft) <
          Math.abs(cards[closest]!.offsetLeft - rail.scrollLeft)
            ? index
            : closest,
        0,
      );
      const next = (current + 1) % cards.length;
      rail.scrollTo({ left: cards[next]!.offsetLeft, behavior: "smooth" });
    };
    const start = () => {
      stop();
      if (!phone.matches || reducedMotion.matches) return;
      timer = window.setInterval(advance, 5500);
    };

    start();
    phone.addEventListener("change", start);
    reducedMotion.addEventListener("change", start);
    rail.addEventListener("mouseenter", stop);
    rail.addEventListener("mouseleave", start);
    rail.addEventListener("focusin", stop);
    rail.addEventListener("focusout", start);
    return () => {
      stop();
      phone.removeEventListener("change", start);
      reducedMotion.removeEventListener("change", start);
      rail.removeEventListener("mouseenter", stop);
      rail.removeEventListener("mouseleave", start);
      rail.removeEventListener("focusin", stop);
      rail.removeEventListener("focusout", start);
    };
  }, [count, enabled, railRef]);
}

/** Accessible pagination for a horizontally scrolling card rail. */
export function ScrollableCardDots({
  railRef,
  count,
  label,
}: {
  railRef: RefObject<HTMLElement | null>;
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

/** A card rail that can receive server-rendered card children. */
export function ScrollableCardRail({
  className,
  count,
  label,
  children,
  autoAdvanceOnMobile = false,
}: {
  className: string;
  count: number;
  label: string;
  children: ReactNode;
  autoAdvanceOnMobile?: boolean;
}) {
  const railRef = useRef<HTMLDivElement>(null);
  useMobileAutoAdvance(railRef, count, autoAdvanceOnMobile);
  return (
    <>
      <div className={className} ref={railRef}>
        {children}
      </div>
      <ScrollableCardDots railRef={railRef} count={count} label={label} />
    </>
  );
}
