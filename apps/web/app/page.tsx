import Link from "next/link";
import { api } from "@/lib/api";
import type { Property, Location } from "@modern-airbnd/contracts";
import { Search } from "@/components/Search";
import { PropertyCard } from "@/components/Property";
import { Photo } from "@/components/Photo";
import { Icon } from "@/components/Icon";
import { Operator } from "@/components/Trust";
import type { Settings } from "@modern-airbnd/contracts";
export default async function Home() {
  const [properties, locations, settings] = await Promise.all([
    api<Property[]>("/properties"),
    api<Location[]>("/locations"),
    api<Settings>("/settings/public"),
  ]);
  const featured = properties.slice(0, 3),
    hero = properties.find((p) => p.media.length);
  return (
    <>
      <section className="hero container">
        <div className="hero-copy">
          <p className="eyebrow">CURATED MANAGED STAYS</p>
          <h1>
            Stay in homes
            <br />
            <em>with a local team behind them.</em>
          </h1>
          <p className="hero-description">
            Calm, practical apartments in Gurgaon and Delhi. See the space,
            check your dates, then speak with the team that manages the stay.
          </p>
          <Search locations={locations} />
          <div className="hero-note">
            <Icon name="chat" size={17} /> No booking engine. No guest account.
            Just a clear enquiry.
          </div>
        </div>
        <div className="hero-visual">
          {hero ? (
            <Photo media={hero.media[0]} priority />
          ) : (
            <div className="hero-empty">
              <span className="eyebrow">MODERN AIRBND</span>
              <h2>
                Your next stay
                <br />
                starts here.
              </h2>
              <p>
                Property photography will appear here
                <br />
                when the team publishes its first stay.
              </p>
              <span className="empty-caption">SPACE TO SETTLE IN.</span>
            </div>
          )}
          {hero && (
            <Link href={`/properties/${hero.slug}`} className="hero-caption">
              <span>{hero.location.name}</span>
              <strong>{hero.name}</strong>
            </Link>
          )}
        </div>
      </section>
      <section className="trust-strip">
        <div className="container">
          <span>
            <Icon name="home" />
            Explore property details
          </span>
          <span>
            <Icon name="calendar" />
            Availability maintained by the team
          </span>
          <span>
            <Icon name="chat" />
            Direct property enquiries
          </span>
        </div>
      </section>
      <section className="container section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">CURATED HOMES</p>
            <h2>Places with enough detail to decide calmly.</h2>
          </div>
          <Link href="/properties" className="text-link">
            View all stays
          </Link>
        </div>
        {properties.some((p) => p.isDemo) && (
          <p className="notice">
            You’re viewing a demonstration catalogue. Demo properties are
            fictional and cannot be enquired about.
          </p>
        )}
        {featured.length ? (
          <div className="property-grid">
            {featured.map((p) => (
              <PropertyCard key={p.id} property={p} />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <h3>Our collection is taking shape.</h3>
            <p>
              The property team hasn’t published any stays yet. Please check
              back soon.
            </p>
            <Link href="/contact" className="button secondary">
              Get in touch
            </Link>
          </div>
        )}
      </section>
      <section className="container section locations-section">
        <div>
          <p className="eyebrow">NEIGHBOURHOODS</p>
          <h2>Start with the part of the city that fits the day.</h2>
          <p className="muted">
            Each stay carries local context, not just a pin on a map.
          </p>
        </div>
        <div className="location-grid">
          {locations.map((l, i) => (
            <Link
              href={`/properties?location=${l.slug}`}
              className="location-tile"
              key={l.id}
            >
              <span className="location-number">0{i + 1}</span>
              <Icon name="pin" />
              <h3>{l.name}</h3>
              <span>{l.state}</span>
            </Link>
          ))}
        </div>
      </section>
      <section className="container section">
        <div className="how-grid">
          <div>
            <p className="eyebrow">WHY MODERN AIRBND</p>
            <h2>
              Managed stays,
              <br />
              fewer unknowns.
            </h2>
          </div>
          {[
            [
              "01",
              "Read the stay properly",
              "Photos, amenities, house rules and neighbourhood notes stay in one place.",
            ],
            [
              "02",
              "Check before you enquire",
              "Availability is checked against managed inventory before you start the chat.",
            ],
            [
              "03",
              "Confirm with a person",
              "Your enquiry is saved first, then the property team follows up directly.",
            ],
          ].map(([n, t, d]) => (
            <div key={n}>
              <span className="step-number">{n}</span>
              <h3>{t}</h3>
              <p>{d}</p>
            </div>
          ))}
        </div>
      </section>
      <div className="container">
        <Operator settings={settings} locations={locations} />
      </div>
      <section className="container">
        <div className="contact-band">
          <div>
            <p className="eyebrow">LET’S FIND YOUR PLACE</p>
            <h2>Have a question about your stay?</h2>
          </div>
          <Link href="/contact" className="button light">
            <Icon name="chat" />
            Talk to the team
          </Link>
        </div>
      </section>
    </>
  );
}
