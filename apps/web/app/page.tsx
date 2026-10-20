import Link from "next/link";
import { Suspense } from "react";
import { api, emptySettings } from "@/lib/api";
import type {
  Property,
  Location,
  Settings,
} from "@modern-airbnd/contracts";
import { Search } from "@/components/Search";
import { Photo } from "@/components/Photo";
import { Icon } from "@/components/Icon";
import { Operator } from "@/components/Trust";
import { HomePortfolioSection } from "@/components/HomePortfolioSection";
import { RetryButton } from "@/components/RetryButton";
import { DestinationCarousel } from "@/components/DestinationCarousel";
import { withSampleDestinations } from "@/lib/sample-destinations";

function propertyHref(property: Property) {
  // QA-007/QA-012: guest-facing links use the canonical /stays journey, never
  // the legacy /properties route.
  return `/stays/${property.location.slug}/${property.slug}`;
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
  // QA-013: portfolio-led home. Every figure below comes from the real
  // portfolio API: nothing here is invented.
  return (
    <div className="landing-page home-page">
      <section className={`landing-hero ${hero ? "has-photo" : ""}`}>
        {hero && (
          <div className="landing-hero-bg" aria-hidden="true">
            <Photo media={hero.media.find(media => media.isCover) || hero.media[0]} priority />
          </div>
        )}
        <div className="container landing-hero-inner">
          <div className="landing-hero-copy">
            <p className="eyebrow">Thoughtful stays, carefully managed</p>
            <h1>Places with a little more care.</h1>
            <p>
              We look after distinctive homes and help guests find a stay that
              feels considered, from the first hello to checkout.
            </p>
            {/* Both journeys remain visible in the opening view; portfolio leads. */}
            <div className="hero-actions">
              <Link className="button primary" href="/portfolio">
                <Icon name="home" size={16} /> Explore Portfolio
              </Link>
              <Link className="button secondary" href="/stays">
                <Icon name="calendar" size={16} /> Book a Stay
              </Link>
            </div>
          </div>
          <div className="landing-booking-panel">
            <div className="landing-search-heading">
              <span className="home-section-icon"><Icon name="search" size={21} /></span>
              <div>
                <h2>Find your next stay</h2>
                <p>Choose your city, dates and guests.</p>
              </div>
            </div>
            <Search locations={activeLocations} />
            <p className="landing-hero-note">
              <Icon name="chat" size={17} />
              Enquire with the team on WhatsApp. Your stay is confirmed personally, not instantly.
            </p>
          {hero && (
            <Link href={propertyHref(hero)} className="landing-hero-card">
              <Icon name="home" size={20} />
              <span><small>Featured in {hero.location.name}</small>
              <strong>{hero.name}</strong>
              <small>{stayMeta(hero)}</small></span>
              <Icon name="arrowRight" size={18} />
            </Link>
          )}
          </div>
        </div>
      </section>

      <Suspense
        fallback={
          <section className="landing-section owner-portfolio-band" aria-busy="true">
            <div className="container">
              <div className="skeleton title-skeleton" />
              <div className="skeleton card-skeleton" />
            </div>
          </section>
        }
      >
        <HomePortfolioSection />
      </Suspense>
      <section className="landing-section destination-section" aria-labelledby="destination-title">
        <div className="container">
          <div className="landing-section-head">
            <div>
              <p className="eyebrow">Explore destinations</p>
              <h2 id="destination-title">Where would you like to stay?</h2>
            </div>
            <Link href="/locations" className="text-link">
              All destinations <Icon name="arrowRight" size={16} />
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
          ) : (
            <>
              {hasPartialLocationError && (
                <p className="notice destination-note">
                  Destination details are being refreshed. Cities below are
                  derived from currently published properties.
                </p>
              )}
              <DestinationCarousel locations={withSampleDestinations(activeLocations.length ? activeLocations : locations)} />
            </>
          )}
        </div>
      </section>

      <section className="landing-section landing-showcase" aria-labelledby="showcase-title">
        <div className="container">
          <div className="landing-section-head">
            <div>
              <p className="eyebrow">Property edit</p>
              <h2 id="showcase-title">Find a place that feels like you.</h2>
            </div>
            <Link href="/stays" className="text-link">
              Explore all stays <Icon name="arrowRight" size={16} />
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
                    <Photo media={property.media.find(media => media.isCover) || property.media[0]} demo={property.isDemo} />
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

      <section className="landing-story" aria-labelledby="home-story-title">
        <div className="container landing-story-grid">
          <div>
            <p className="eyebrow">Operator note</p>
            <h2 id="home-story-title">
              Your stay, confirmed by people.
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
            <ol className="landing-story-steps" aria-label="Enquiry steps">
              <li><Icon name="pin" size={20} /><div><strong>Choose your city</strong><p>Start with where you want to be.</p></div></li>
              <li><Icon name="home" size={20} /><div><strong>Find your stay</strong><p>Review the space, details and dates.</p></div></li>
              <li><Icon name="chat" size={20} /><div><strong>Talk to the team</strong><p>Send an enquiry to confirm your plans.</p></div></li>
            </ol>
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
