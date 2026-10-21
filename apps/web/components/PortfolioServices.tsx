"use client";

import { useRef } from "react";
import { Icon } from "./Icon";
import { ScrollableCardDots, useMobileAutoAdvance } from "./ScrollableCardDots";

const SERVICES = [
  [
    "photo",
    "Listing management",
    "Listing setup, photographs, amenities and search details kept current, with coordination for external channels.",
  ],
  [
    "calendar",
    "Availability & reservations",
    "Unit-level calendars, blocked dates and reservation records keep every stay linked to its source.",
  ],
  [
    "chat",
    "Guest communication",
    "Enquiries, pre-arrival information, house rules and check-in details handled by the team.",
  ],
  [
    "tool",
    "Housekeeping & maintenance",
    "Task assignments, due dates and maintenance priorities help coordinate on-ground work.",
  ],
  [
    "shield",
    "Owner visibility",
    "A published property portfolio and a structured enquiry pipeline keep the management journey clear.",
  ],
  [
    "users",
    "Onboarding support",
    "A management plan scoped to your property, location and the services you need.",
  ],
];
const STEPS = [
  [
    "Tell us about your property",
    "Share its city, property type and what you need from a management partner.",
  ],
  [
    "Prepare the listing",
    "Gather photographs, amenities, pricing inputs and house rules.",
  ],
  [
    "Publish your property",
    "Approved listings join the portfolio with their enquiry journey ready.",
  ],
  [
    "Run day-to-day operations",
    "Coordinate guests, reservations, housekeeping and maintenance.",
  ],
];

export function PortfolioServices() {
  const servicesRailRef = useRef<HTMLDivElement>(null);
  const onboardingRailRef = useRef<HTMLOListElement>(null);
  useMobileAutoAdvance(servicesRailRef, SERVICES.length);
  useMobileAutoAdvance(onboardingRailRef, STEPS.length);
  return (
    <>
      <section
        id="services"
        className="portfolio-section"
        aria-labelledby="portfolio-services-title"
      >
        <div className="portfolio-section-heading">
          <p className="eyebrow">What we take care of</p>
          <h2 id="portfolio-services-title">One team for the whole stay.</h2>
          <p>
            Choose a management scope that suits your property. Plans and
            pricing are discussed with the team.
          </p>
        </div>
        <div className="services-grid" ref={servicesRailRef}>
          {SERVICES.map(([icon, title, body]) => (
            <article className="service-card" key={title}>
              <span className="service-icon">
                <Icon name={icon} size={22} />
              </span>
              <h3>{title}</h3>
              <p>{body}</p>
            </article>
          ))}
        </div>
        <ScrollableCardDots
          railRef={servicesRailRef}
          count={SERVICES.length}
          label="management service"
        />
      </section>
      <section
        id="onboarding"
        className="portfolio-section"
        aria-labelledby="portfolio-onboarding-title"
      >
        <div className="portfolio-section-heading">
          <p className="eyebrow">Getting started</p>
          <h2 id="portfolio-onboarding-title">
            From first conversation to daily care.
          </h2>
        </div>
        <ol className="portfolio-onboarding" ref={onboardingRailRef}>
          {STEPS.map(([title, body], index) => (
            <li key={title}>
              <span className="step-number">0{index + 1}</span>
              <h3>{title}</h3>
              <p>{body}</p>
            </li>
          ))}
        </ol>
        <ScrollableCardDots
          railRef={onboardingRailRef}
          count={STEPS.length}
          label="onboarding step"
        />
      </section>
    </>
  );
}
