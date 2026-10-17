import Link from "next/link";
import type { Metadata } from "next";
import { Icon } from "@/components/Icon";

export const metadata: Metadata = {
  title: "Owner services",
  description:
    "Listing management, availability, guest coordination and on-ground operations for property owners.",
  alternates: { canonical: "/services" },
};

const SERVICES = [
  {
    title: "Listing management",
    body: "Professional listing setup on this site and syndication coordination for external channels, with photos, amenities and search metadata kept current.",
    icon: "photo",
  },
  {
    title: "Availability & reservations",
    body: "Unit-level calendars, blocked dates and reservation records so your property is never double-booked and every stay has a clear source.",
    icon: "calendar",
  },
  {
    title: "Guest communication",
    body: "Enquiry handling, pre-arrival information, house rules and check-in details — guests get answers without you taking every call.",
    icon: "chat",
  },
  {
    title: "Housekeeping & maintenance",
    body: "Task assignment after each stay, due-date tracking and a maintenance queue with priorities, so issues are resolved before guests notice.",
    icon: "check",
  },
  {
    title: "Owner visibility",
    body: "Your property appears in the city-wise portfolio with live availability, and enquiries stay visible through a structured pipeline.",
    icon: "shield",
  },
  {
    title: "Onboarding support",
    body: "Share your property details through the owner form and the team responds with next steps tailored to your city and property type.",
    icon: "plus",
  },
];

const STEPS = [
  {
    title: "Tell us about the property",
    body: "City, property type and what you want from a management partner.",
  },
  {
    title: "Listing setup",
    body: "Photos, amenities, pricing inputs and house rules prepared for publishing.",
  },
  {
    title: "Go live",
    body: "The property publishes to the portfolio with enquiry flows switched on.",
  },
  {
    title: "Operations run day to day",
    body: "Guests, reservations, housekeeping and maintenance handled through the system.",
  },
];

export default async function ServicesPage() {
  return (
    <div className="container section">
      <div className="page-hero-band">
        <nav className="breadcrumb" aria-label="Breadcrumb">
          <Link href="/">Home</Link>
          <span aria-hidden="true">/</span>
          <span aria-current="page">Services</span>
        </nav>
        <p className="eyebrow">For property owners</p>
        <h1>What we run for you</h1>
        <p className="intro">
          Modern Stayz operates the full guest cycle of your property through
          one system: listings, calendars, guests and on-ground work. Plans are
          scoped per property — share your details and the team responds with a
          tailored proposal.
        </p>
        <div className="hero-actions">
          <Link className="button primary" href="/owners">
            List your property
          </Link>
          <Link className="button secondary" href="/portfolio">
            See the portfolio
          </Link>
        </div>
      </div>

      <section aria-labelledby="services-list">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Services</p>
            <h2 id="services-list">Coverage across the stay lifecycle</h2>
          </div>
        </div>
        <div className="services-grid">
          {SERVICES.map((s) => (
            <article className="service-card" key={s.title}>
              <span className="service-icon">
                <Icon name={s.icon} size={22} />
              </span>
              <h3>{s.title}</h3>
              <p className="muted small">{s.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section aria-labelledby="services-steps">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Onboarding</p>
            <h2 id="services-steps">How a property comes onboard</h2>
          </div>
        </div>
        <div className="how-grid">
          {STEPS.map((step, index) => (
            <div key={step.title}>
              <span className="step-number">{index + 1}</span>
              <h3>{step.title}</h3>
              <p>{step.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="contact-band" aria-labelledby="services-cta">
        <div>
          <p className="eyebrow">Get started</p>
          <h2 id="services-cta">Discuss a management plan</h2>
          <p className="muted">
            No generic packages — scope and pricing depend on your property,
            city and the services you need.
          </p>
        </div>
        <div className="cta-actions">
          <Link className="button primary" href="/owners">
            <Icon name="plus" size={16} /> List your property
          </Link>
          <Link className="button secondary" href="/contact">
            Contact the team
          </Link>
        </div>
      </section>
    </div>
  );
}