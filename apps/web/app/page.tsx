import Link from "next/link";
import { api, emptySettings } from "@/lib/api";
import type { Property, Location, Settings } from "@modern-airbnd/contracts";
import { Search } from "@/components/Search";
import { PropertyCard } from "@/components/Property";
import { Photo } from "@/components/Photo";
import { Icon } from "@/components/Icon";
import { Operator } from "@/components/Trust";
import { RetryButton } from "@/components/RetryButton";

export default async function Home() {
  const [propertyResult, locationResult, settingsResult] = await Promise.allSettled([
    api<Property[]>("/properties"),
    api<Location[]>("/locations"),
    api<Settings>("/settings/public"),
  ]);
  const properties =
    propertyResult.status === "fulfilled" ? propertyResult.value : [];
  const apiLocations =
    locationResult.status === "fulfilled" ? locationResult.value : [];
  const propertyLocations = Array.from(
    new Map(
      properties.map((property) => [property.location.id, property.location]),
    ).values(),
  );
  const locations = apiLocations.length ? apiLocations : propertyLocations;
  const settings =
    settingsResult.status === "fulfilled" ? settingsResult.value : emptySettings;
  const hasLoadError = propertyResult.status === "rejected";
  const hasPartialLocationError =
    propertyResult.status === "fulfilled" && locationResult.status === "rejected";
  const hero = properties.find((p) => p.media.length);
  const featured = properties.slice(0, 6);
  const activeLocations = locations.filter((location) =>
    properties.some((property) => property.location.id === location.id),
  );

  return (
    <>
      <section className={`guest-hero ${hero ? "hero-with-photo" : ""}`}>
        {hero && (
          <div className="guest-hero-bg" aria-hidden="true">
            <Photo media={hero.media[0]} priority />
          </div>
        )}
        <div className="guest-hero-inner">
          <div className="hero-copy">
            <p className="eyebrow">Modern Airbnd / curated Indian stays</p>
            <h1>Thoughtfully curated stays across India.</h1>
            <p className="hero-description">
              Pick a destination first, compare stays in that city, check
              dates, then send an enquiry for the team to confirm.
            </p>
            <Search locations={activeLocations} />
            <div className="hero-note">
              <Icon name="chat" size={17} /> Phase 1: saved enquiry before
              WhatsApp. No instant reservation.
            </div>
          </div>
          <div className="hero-visual" aria-label="Featured property">
            {hero ? (
              <Photo media={hero.media[0]} priority />
            ) : (
              <div className="hero-empty">
                <span className="eyebrow">Sample preview</span>
                <h2>
                  City-first discovery
                  <br />
                  starts here.
                </h2>
                <p>Property photography appears when the team publishes a stay.</p>
                <span className="empty-caption">Sample image area</span>
              </div>
            )}
            {hero && (
              <Link href={`/properties/${hero.slug}`} className="hero-caption">
                <span>{hero.location.name}</span>
                <strong>{hero.name}</strong>
              </Link>
            )}
          </div>
        </div>
      </section>

      <section
        className="container destination-section"
        aria-labelledby="destination-title"
      >
        <div className="destination-heading">
          <div>
            <p className="eyebrow">Regions ready for enquiry</p>
            <h2 id="destination-title">Pick a Destination</h2>
            <p className="muted">
              Only cities with active, published properties are shown.
            </p>
          </div>
          <Link href="/locations" className="text-link">
            All destinations
          </Link>
        </div>
        {hasLoadError ? (
          <div className="notice error destination-notice" role="alert">
            <h3>Destinations could not be loaded.</h3>
            <p>
              The destination service is unavailable right now. Retry the
              section, or contact the team for help.
            </p>
            <div className="destination-notice-actions">
              <RetryButton label="Retry destinations" />
              <Link href="/contact" className="text-link">
                Contact the team
              </Link>
            </div>
          </div>
        ) : activeLocations.length ? (
          <>
            {hasPartialLocationError && (
              <p className="notice destination-note">
                Destination details are being refreshed. Cities below are
                derived from currently published properties.
              </p>
            )}
            <div className="destination-circles">
              {activeLocations.map((location) => {
                const cityProperties = properties.filter(
                  (property) => property.location.id === location.id,
                );
                const image = cityProperties.find(
                  (property) => property.media.length,
                );
                const count = cityProperties.length;
                return (
                  <Link
                    className="destination-card"
                    href={`/properties?location=${location.slug}`}
                    key={location.id}
                  >
                    <span className="destination-photo">
                      {image ? (
                        <Photo media={image.media[0]} />
                      ) : (
                        <Icon name="pin" size={28} />
                      )}
                    </span>
                    <strong>{location.name}</strong>
                    <small>
                      {count} {count === 1 ? "stay" : "stays"}
                    </small>
                  </Link>
                );
              })}
            </div>
          </>
        ) : (
          <div className="empty-state">
            <h3>No destinations are published yet.</h3>
            <p>Please check back once the property team publishes a stay.</p>
          </div>
        )}
      </section>
      {hasLoadError && (
        <section className="container section">
          <div className="notice error" role="alert">
            <h2>We could not load the guest catalogue.</h2>
            <p>
              The property service is unavailable right now. Please retry, or
              contact the team for help with destinations and availability.
            </p>
            <Link href="/contact" className="text-link">
              Contact the team
            </Link>
          </div>
        </section>
      )}

      <section className="trust-strip">
        <div className="container">
          <span>
            <Icon name="pin" />
            Choose city
          </span>
          <span>
            <Icon name="home" />
            Browse matching properties
          </span>
          <span>
            <Icon name="chat" />
            Send enquiry
          </span>
        </div>
      </section>

      <section className="container section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Curated properties</p>
            <h2>Useful details before you enquire.</h2>
          </div>
          <Link href="/properties" className="text-link">
            Explore all properties
          </Link>
        </div>
        {properties.some((p) => p.isDemo) && (
          <p className="notice">
            You are viewing a demonstration catalogue. Demo properties are
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
              The property team has not published any stays yet. Please check
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
          <p className="eyebrow">City-first discovery</p>
          <h2>Start with where you want to stay.</h2>
          <p className="muted">
            Selecting a city keeps results focused on properties in that city.
          </p>
        </div>
        <div className="location-grid">
          {activeLocations.map((l, i) => (
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
            <p className="eyebrow">How enquiries work</p>
            <h2>
              Check availability.
              <br />
              Confirm with the team.
            </h2>
          </div>
          {[
            [
              "01",
              "Choose a city",
              "Pick a destination and keep the results focused on that city.",
            ],
            [
              "02",
              "Review the property",
              "Check photos, capacity, amenities, rules, local context and availability.",
            ],
            [
              "03",
              "Send an enquiry",
              "Your request is saved before WhatsApp opens. The team confirms the stay.",
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
            <p className="eyebrow">Let us help</p>
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
