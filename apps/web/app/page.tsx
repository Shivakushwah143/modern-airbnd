import Link from "next/link";
import { api, emptySettings } from "@/lib/api";
import type { Property, Location, Settings } from "@modern-airbnd/contracts";
import { Search } from "@/components/Search";
import { Photo } from "@/components/Photo";
import { Icon } from "@/components/Icon";
import { Operator } from "@/components/Trust";
import { RetryButton } from "@/components/RetryButton";

function propertyHref(property: Property) {
  return `/properties/${property.slug}`;
}

function stayMeta(property: Property) {
  return [
    `${property.bedrooms} bedrooms`,
    `${property.bathrooms} baths`,
    `up to ${property.maxGuests} guests`,
  ].join(" / ");
}

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
  const activeLocations = locations.filter((location) =>
    properties.some((property) => property.location.id === location.id),
  );
  const hero =
    properties.find((property) => property.media.some((media) => media.isCover)) ||
    properties.find((property) => property.media.length);
  const showcase = properties.filter((property) => property.media.length).slice(0, 5);
  const fallbackShowcase = properties.slice(0, 5);
  const featured = showcase.length ? showcase : fallbackShowcase;

  return (
    <div className="landing-page">
      <section className={`landing-hero ${hero ? "has-photo" : ""}`}>
        {hero && (
          <div className="landing-hero-bg" aria-hidden="true">
            <Photo media={hero.media[0]} priority />
          </div>
        )}
        <div className="container landing-hero-inner">
          <div className="landing-hero-copy">
            <p className="eyebrow">Modern Stayz / enquiry-first stays</p>
            <h1>Find a stay that feels considered.</h1>
            <p>
              Browse real published properties by city, check dates, and send
              an enquiry for the property team to confirm.
            </p>
            <Search locations={activeLocations} />
            <div className="landing-hero-note">
              <Icon name="chat" size={17} />
              Enquiries are saved before WhatsApp opens. No instant reservation.
            </div>
          </div>
          {hero && (
            <Link href={propertyHref(hero)} className="landing-hero-card">
              <span>{hero.location.name}</span>
              <strong>{hero.name}</strong>
              <small>{stayMeta(hero)}</small>
            </Link>
          )}
        </div>
      </section>

      <section className="landing-section destination-section" aria-labelledby="destination-title">
        <div className="container">
          <div className="landing-section-head">
            <div>
              <p className="eyebrow">Published destinations</p>
              <h2 id="destination-title">Pick a Destination</h2>
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
              <div className="landing-destinations">
                {activeLocations.map((location) => {
                  const cityProperties = properties.filter(
                    (property) => property.location.id === location.id,
                  );
                  const image = cityProperties.find(
                    (property) => property.media.length,
                  );
                  return (
                    <Link
                      className="landing-destination"
                      href={`/properties?location=${location.slug}`}
                      key={location.id}
                    >
                      <span className="landing-destination-photo">
                        {image ? (
                          <Photo media={image.media[0]} />
                        ) : (
                          <Icon name="pin" size={30} />
                        )}
                      </span>
                      <strong>{location.name}</strong>
                      {location.state && <small>{location.state}</small>}
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
        </div>
      </section>

      <section className="landing-section landing-showcase" aria-labelledby="showcase-title">
        <div className="container">
          <div className="landing-section-head">
            <div>
              <p className="eyebrow">Property edit</p>
              <h2 id="showcase-title">Real stays, shown with room to breathe.</h2>
            </div>
            <Link href="/properties" className="text-link">
              Explore all properties
            </Link>
          </div>
          {properties.some((property) => property.isDemo) && (
            <p className="notice">
              You are viewing a demonstration catalogue. Demo properties are
              fictional and cannot be enquired about.
            </p>
          )}
          {hasLoadError && (
            <div className="notice error" role="alert">
              <h3>We could not load the guest catalogue.</h3>
              <p>
                The property service is unavailable right now. Please retry, or
                contact the team for destinations and availability.
              </p>
            </div>
          )}
          {featured.length ? (
            <div className="editorial-properties">
              {featured.map((property, index) => (
                <article className="editorial-property" key={property.id}>
                  <Link
                    className="editorial-property-photo"
                    href={propertyHref(property)}
                    aria-label={`View ${property.name}`}
                  >
                    <Photo media={property.media[0]} demo={property.isDemo} />
                  </Link>
                  <div className="editorial-property-copy">
                    <span className="editorial-index">0{index + 1}</span>
                    <p className="eyebrow">
                      {property.area || property.location.name}
                      {property.area ? ` / ${property.location.name}` : ""}
                    </p>
                    <h3>
                      <Link href={propertyHref(property)}>{property.name}</Link>
                    </h3>
                    <p>{property.shortDescription || property.propertyType}</p>
                    <p className="facts">
                      <Icon name="bed" size={18} />
                      {stayMeta(property)}
                    </p>
                    <Link className="button secondary" href={propertyHref(property)}>
                      View property
                    </Link>
                  </div>
                </article>
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
        </div>
      </section>

      <section className="landing-story">
        <div className="container landing-story-grid">
          <div>
            <p className="eyebrow">Operator note</p>
            <h2>
              Hospitality is confirmed by people, not by a checkout button.
            </h2>
          </div>
          <div>
            {settings.operatorName && <h3>{settings.operatorName}</h3>}
            {settings.aboutText ? (
              <p>{settings.aboutText}</p>
            ) : (
              <p>
                Modern Stayz publishes managed stays with city, property,
                rules, local context and availability details so guests can
                enquire with the team before making plans.
              </p>
            )}
            <div className="landing-story-steps" aria-label="Enquiry steps">
              <span>Choose city</span>
              <span>Review stay</span>
              <span>Send enquiry</span>
            </div>
          </div>
        </div>
      </section>

      <div className="container landing-operator">
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
    </div>
  );
}
