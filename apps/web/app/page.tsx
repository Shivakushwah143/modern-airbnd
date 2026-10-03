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
          <p className="eyebrow">A PLACE FOR YOUR NEXT CHAPTER</p>
          <h1>
            Somewhere new.
            <br />
            <em>Feels like you.</em>
          </h1>
          <p className="hero-description">
            Explore the space. Check your dates.
            <br />
            Talk directly with the property team.
          </p>
          <Search locations={locations} />
          <div className="hero-note">
            <Icon name="chat" size={17} /> No account needed. Just a
            conversation.
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
            <p className="eyebrow">FIND YOUR PLACE</p>
            <h2>Stays worth a closer look.</h2>
          </div>
          <Link href="/properties" className="text-link">
            Explore all properties
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
          <p className="eyebrow">A CHANGE OF SCENE</p>
          <h2>Where will you settle in?</h2>
          <p className="muted">
            Start with a location. Find a space that fits.
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
            <p className="eyebrow">A SIMPLE WAY TO STAY</p>
            <h2>
              Less guesswork.
              <br />
              More clarity.
            </h2>
          </div>
          {[
            [
              "01",
              "Get to know the space",
              "Read the property details, amenities and house rules before you decide.",
            ],
            [
              "02",
              "Check your dates",
              "See availability for your whole stay, maintained by the property team.",
            ],
            [
              "03",
              "Start a conversation",
              "Ask questions on WhatsApp. Confirm the details directly with the team.",
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
