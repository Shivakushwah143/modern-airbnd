import Link from "next/link";
import { api, emptySettings } from "@/lib/api";
import type {
  Property,
  Location,
  Settings,
  PortfolioBundle,
} from "@modern-airbnd/contracts";
import { Search } from "@/components/Search";
import { Photo } from "@/components/Photo";
import { Icon } from "@/components/Icon";
import { Operator } from "@/components/Trust";
import { RetryButton } from "@/components/RetryButton";
import {
  CaseStudyCard,
  TeamCard,
  TestimonialCard,
} from "@/components/PortfolioCards";
import { CityIcon } from "@/components/CityIcon";

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
  const [propertyResult, locationResult, settingsResult, portfolioResult] =
    await Promise.allSettled([
      api<Property[]>("/properties"),
      api<Location[]>("/locations"),
      api<Settings>("/settings/public"),
      api<PortfolioBundle>("/portfolio"),
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
  // portfolio API — nothing here is invented.
  const portfolio =
    portfolioResult.status === "fulfilled" ? portfolioResult.value : null;
  const ownerCities = portfolio?.cities.slice(0, 6) ?? [];
  const ownerTeam = portfolio?.team.slice(0, 3) ?? [];
  const ownerTestimonials = portfolio?.testimonials.slice(0, 2) ?? [];
  const ownerCases = portfolio?.caseStudies.slice(0, 3) ?? [];

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

      <section className="landing-section owner-portfolio-band" aria-labelledby="owner-band-title">
        <div className="container">
          <div className="landing-section-head">
            <div>
              <p className="eyebrow">For property owners · our portfolio</p>
              <h2 id="owner-band-title">
                We run stays across {portfolio?.managedCount ?? 0} {""}
                {(portfolio?.managedCount ?? 0) === 1 ? "property" : "properties"}
                {ownerCities.length
                  ? ` in ${ownerCities.length} ${ownerCities.length === 1 ? "city" : "cities"}`
                  : ""}
                .
              </h2>
            </div>
            <Link href="/portfolio" className="text-link">
              View the full portfolio
            </Link>
          </div>

          {portfolio === null && (
            <div className="notice error" role="alert">
              <p>
                The portfolio service is unavailable right now. Retry this page,
                or read about our services while it recovers.
              </p>
              <RetryButton label="Retry portfolio" />
            </div>
          )}

          {portfolio && ownerCities.length > 0 && (
            <div className="location-grid">
              {ownerCities.map((c) => (
                <Link
                  key={c.slug}
                  className="location-tile"
                  href={`/portfolio/cities/${c.slug}`}
                >
                  <span className="location-number">
                    {c.count} {c.count === 1 ? "stay" : "stays"}
                  </span>
                  <p className="eyebrow">
                    <CityIcon slug={c.slug} size={14} />{" "}
                    {c.state || "Managed city"}
                  </p>
                  <h3>{c.name}</h3>
                  <span>View managed properties</span>
                </Link>
              ))}
            </div>
          )}

          {portfolio && ownerCases.length > 0 && (
            <div className="case-grid">
              {ownerCases.map((item) => (
                <CaseStudyCard key={item.id} item={item} />
              ))}
            </div>
          )}

          <div className="landing-owner-split">
            <div className="landing-owner-services">
              <p className="eyebrow">Management services</p>
              <h3>Listings, availability, guests and on-ground operations.</h3>
              <p className="muted">
                Owners hand over the day-to-day; the team keeps listings honest,
                bookings coordinated and properties cared for.
              </p>
              <Link className="button secondary" href="/services">
                View owner services
              </Link>
            </div>
            {ownerTeam.length > 0 && (
              <div>
                <p className="eyebrow">Management team</p>
                <div className="team-grid">
                  {ownerTeam.map((member) => (
                    <TeamCard key={member.id} member={member} />
                  ))}
                </div>
              </div>
            )}
            {ownerTestimonials.length > 0 && (
              <div>
                <p className="eyebrow">Owner voices · genuine media</p>
                <div className="testimonial-grid">
                  {ownerTestimonials.map((item) => (
                    <TestimonialCard key={item.id} item={item} />
                  ))}
                </div>
              </div>
            )}
          </div>

          {portfolio &&
            !ownerCities.length &&
            !ownerTeam.length &&
            !ownerTestimonials.length && (
              <div className="empty-state">
                <h3>The portfolio is being published.</h3>
                <p>
                  City-wise listings, team profiles and owner media go live as
                  they are approved. Describe your property in the meantime.
                </p>
                <Link className="button primary" href="/owners">
                  List your property
                </Link>
              </div>
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
                  return (
                    <Link
                      className="landing-destination"
                      href={`/stays/${location.slug}`}
                      key={location.id}
                    >
                      <span className="landing-destination-photo" aria-hidden="true">
                        <CityIcon slug={location.slug} size={46} />
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
            <Link href="/stays" className="text-link">
              Explore all stays
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
