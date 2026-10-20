import Link from "next/link";
import type { Metadata } from "next";
import type {
  PortfolioBundle,
  PortfolioCityBundle,
  PortfolioPropertyBundle,
} from "@modern-airbnd/contracts";
import { api } from "@/lib/api";
import { TeamCard } from "@/components/PortfolioCards";
import { TestimonialGallery } from "@/components/TestimonialGallery";
import { PortfolioServices } from "@/components/PortfolioServices";
import { Gallery } from "@/components/Gallery";
import { Photo } from "@/components/Photo";
import { CityIcon } from "@/components/CityIcon";
import { Icon } from "@/components/Icon";
import { RetryButton } from "@/components/RetryButton";
import { resolvePortfolioContent } from "@/lib/demo-portfolio";
import { DemoPortfolioTeam } from "@/components/DemoPortfolioTeam";

export const metadata: Metadata = {
  title: "Our portfolio, services & team",
  description:
    "Explore managed properties, management services, our team and owner testimonials in one place.",
  alternates: { canonical: "/portfolio" },
};

export default async function PortfolioPage() {
  const liveBundle = await api<PortfolioBundle>("/portfolio").catch(() => null);
  const liveCities = liveBundle?.cities ?? [];
  const liveCityResults = await Promise.all(
    liveCities.map((city) =>
      api<PortfolioCityBundle>(
        `/portfolio/cities/${encodeURIComponent(city.slug)}`,
      ).catch(() => null),
    ),
  );
  const propertySlugs = [
    ...new Set([
      ...liveCityResults.flatMap(
        (city) => city?.properties.map((property) => property.slug) ?? [],
      ),
      ...(liveBundle?.caseStudies.flatMap((item) =>
        item.property ? [item.property.slug] : [],
      ) ?? []),
    ]),
  ];
  const propertyResults = await Promise.all(
    propertySlugs.map((slug) =>
      api<PortfolioPropertyBundle>(
        `/portfolio/properties/${encodeURIComponent(slug)}`,
      ).catch(() => null),
    ),
  );
  const {
    bundle,
    demo,
    hasDemo,
    cities: cityResults,
    details: resolvedDetails,
  } = resolvePortfolioContent(
    liveBundle,
    liveCityResults,
    propertyResults,
    process.env.PORTFOLIO_DEMO_CONTENT !== "false",
  );
  const cities = bundle?.cities ?? [];
  const details = new Map(
    resolvedDetails.flatMap((result) =>
      result ? [[result.property.slug, result] as const] : [],
    ),
  );
  const cases = bundle?.caseStudies ?? [];
  const team = bundle?.team ?? [];
  const testimonials = bundle?.testimonials ?? [];

  return (
    <div className="portfolio-page">
      <section
        className="portfolio-intro"
        id="overview"
        aria-labelledby="portfolio-title"
      >
        <div className="container">
          <nav className="breadcrumb" aria-label="Breadcrumb">
            <Link href="/">Home</Link>
            <span aria-hidden="true">/</span>
            <span aria-current="page">Our portfolio</span>
          </nav>
          {hasDemo && (
            <div className="portfolio-demo-notice" role="note">
              <Icon name="photo" size={22} />
              <div>
                <strong>Demo portfolio preview</strong>
                <p>
                  Marked sections contain fictional profiles, generated
                  illustrations and sample feedback. They are examples, not real
                  people, listings or customer reviews.
                </p>
              </div>
            </div>
          )}
          <p className="eyebrow">Modern Stayz for property owners</p>
          <h1 id="portfolio-title">
            Your property.
            <br />
            Our everyday care.
          </h1>
          <p className="intro">
            Meet the people, explore the properties and see how we manage each
            stay. Everything you need to know, in one place.
          </p>
          <div className="hero-actions">
            <Link href="#properties" className="button primary">
              Explore the portfolio <Icon name="arrowRight" size={18} />
            </Link>
            <Link href="#services" className="button secondary">
              Our services
            </Link>
          </div>
          {bundle && bundle.managedCount > 0 && (
            <p className="portfolio-live-summary">
              <Icon name="home" size={18} />
              {bundle.managedCount} {demo.properties ? "sample" : "managed"}{" "}
              {bundle.managedCount === 1 ? "property" : "properties"} across{" "}
              {cities.length} {cities.length === 1 ? "city" : "cities"}
            </p>
          )}
        </div>
      </section>
      <div className="container">
        <nav className="portfolio-section-links" aria-label="On this page">
          {[
            ["properties", "Properties"],
            ["services", "Services"],
            ["onboarding", "Our process"],
            ["cases", "Case studies"],
            ["team", "Our team"],
            ["testimonials", "Testimonials"],
          ].map(([id, label]) => (
            <Link href={`#${id}`} key={id}>
              {label}
            </Link>
          ))}
        </nav>
        {!liveBundle && (
          <div className="notice error" role="alert">
            <p>
              The live portfolio service is unavailable right now.{" "}
              {hasDemo
                ? "Labeled demo examples are shown below while it recovers."
                : "Services and onboarding information are still available below."}
            </p>
            <RetryButton label="Retry portfolio" />
          </div>
        )}
        <section
          id="properties"
          className="portfolio-section"
          aria-labelledby="portfolio-properties-title"
        >
          <div className="portfolio-section-heading">
            <p className="eyebrow">Our managed properties</p>
            {demo.properties && (
              <span className="portfolio-demo-badge">
                Demo collection · not bookable
              </span>
            )}
            <h2 id="portfolio-properties-title">
              A closer look, city by city.
            </h2>
            <p>
              Explore the spaces and their management details here. Guest
              availability and enquiries remain in{" "}
              <Link className="text-link" href="/stays">
                live stays
              </Link>
              .
            </p>
          </div>
          {cities.length > 0 ? (
            <>
              <nav
                className="portfolio-city-links"
                aria-label="Jump to a managed city"
              >
                {cities.map((city) => (
                  <Link key={city.slug} href={`#city-${city.slug}`}>
                    <CityIcon slug={city.slug} size={24} />
                    <span>
                      {city.name}
                      <small>
                        {city.count}{" "}
                        {city.count === 1 ? "property" : "properties"}
                      </small>
                    </span>
                    <Icon name="arrowRight" size={16} />
                  </Link>
                ))}
              </nav>
              {cities.map((city, index) => (
                <section
                  id={`city-${city.slug}`}
                  className="portfolio-city-section"
                  key={city.slug}
                  aria-labelledby={`city-title-${city.slug}`}
                >
                  <div className="portfolio-city-heading">
                    <CityIcon slug={city.slug} size={30} />
                    <div>
                      <h3 id={`city-title-${city.slug}`}>{city.name}</h3>
                      <p>{city.state}</p>
                    </div>
                  </div>
                  {!cityResults[index] ? (
                    <div className="notice error">
                      <p>Properties in {city.name} could not be loaded.</p>
                      <RetryButton label={`Retry ${city.name}`} />
                    </div>
                  ) : (
                    <div className="portfolio-managed-grid">
                      {cityResults[index]!.properties.map((property) => {
                        const detail = details.get(property.slug)?.property;
                        return (
                          <article
                            className="portfolio-managed-card"
                            id={`property-${property.slug}`}
                            key={property.id}
                          >
                            <div className="portfolio-managed-cover">
                              <Photo
                                media={
                                  property.media.find(
                                    (media) => media.isCover,
                                  ) || property.media[0]
                                }
                                demo={property.isDemo}
                              />
                            </div>
                            <div className="portfolio-managed-copy">
                              {property.isDemo && (
                                <span className="portfolio-demo-badge">
                                  Fictional property · generated illustration
                                </span>
                              )}
                              <p className="eyebrow">
                                {property.area || city.name}
                              </p>
                              <h4>{property.name}</h4>
                              <p>
                                {property.shortDescription ||
                                  property.propertyType}
                              </p>
                              <p className="facts">
                                {property.bedrooms} bedrooms ·{" "}
                                {property.bathrooms} baths · up to{" "}
                                {property.maxGuests} guests
                              </p>
                              <details className="portfolio-property-details">
                                <summary>
                                  View gallery &amp; management details
                                </summary>
                                {detail ? (
                                  <>
                                    <p>{detail.description}</p>
                                    {detail.media.length > 0 && (
                                      <Gallery
                                        media={detail.media}
                                        demo={property.isDemo}
                                      />
                                    )}
                                    {detail.amenities.length > 0 && (
                                      <>
                                        <h5>Amenities</h5>
                                        <ul className="portfolio-amenities">
                                          {detail.amenities.map((amenity) => (
                                            <li key={amenity.id}>
                                              {amenity.name}
                                            </li>
                                          ))}
                                        </ul>
                                      </>
                                    )}
                                    {detail.localHighlights.length > 0 && (
                                      <>
                                        <h5>Local highlights</h5>
                                        <dl>
                                          {detail.localHighlights.map(
                                            (highlight) => (
                                              <div key={highlight.name}>
                                                <dt>{highlight.name}</dt>
                                                <dd>{highlight.detail}</dd>
                                              </div>
                                            ),
                                          )}
                                        </dl>
                                      </>
                                    )}
                                    {detail.suitedFor.length > 0 && (
                                      <p>
                                        <strong>Best suited for:</strong>{" "}
                                        {detail.suitedFor.join(", ")}
                                      </p>
                                    )}
                                    {detail.houseRules.length > 0 && (
                                      <>
                                        <h5>House rules</h5>
                                        <ul>
                                          {detail.houseRules.map((rule) => (
                                            <li key={rule}>{rule}</li>
                                          ))}
                                        </ul>
                                      </>
                                    )}
                                    {detail.checkInInfo && (
                                      <p>
                                        <strong>Check-in:</strong>{" "}
                                        {detail.checkInInfo}
                                      </p>
                                    )}
                                    {detail.checkOutInfo && (
                                      <p>
                                        <strong>Check-out:</strong>{" "}
                                        {detail.checkOutInfo}
                                      </p>
                                    )}
                                  </>
                                ) : (
                                  <>
                                    <p>
                                      Full management details could not be
                                      loaded. Please retry.
                                    </p>
                                    <RetryButton label="Retry property details" />
                                  </>
                                )}
                              </details>
                            </div>
                          </article>
                        );
                      })}
                    </div>
                  )}
                </section>
              ))}
            </>
          ) : (
            <div className="portfolio-empty">
              <Icon name="home" size={28} />
              <h3>
                {bundle
                  ? "Our managed collection is being prepared."
                  : "Managed properties are temporarily unavailable."}
              </h3>
              <p>
                {bundle
                  ? "Published properties will appear here as they are approved. Explore our services and speak with the team below."
                  : "Please retry to see the published collection."}
              </p>
            </div>
          )}
        </section>
        <PortfolioServices />
        <section
          id="cases"
          className="portfolio-section"
          aria-labelledby="portfolio-cases-title"
        >
          <div className="portfolio-section-heading">
            <p className="eyebrow">Case studies</p>
            <h2 id="portfolio-cases-title">The work behind each property.</h2>
            <p>
              Published owner stories and management outcomes, without leaving
              this page.
            </p>
          </div>
          {cases.length > 0 ? (
            <div className="case-grid">
              {cases.map((item) => (
                <article
                  className="portfolio-case-card"
                  id={`case-${item.slug}`}
                  key={item.id}
                >
                  {item.coverUrl && (
                    <img
                      src={item.coverUrl}
                      alt={item.title}
                      loading="lazy"
                      width={640}
                      height={360}
                    />
                  )}
                  <div>
                    {demo.cases && (
                      <span className="portfolio-demo-badge">
                        Illustrative case study · sample content
                      </span>
                    )}
                    <p className="eyebrow">{item.city || "Managed property"}</p>
                    <h3>{item.title}</h3>
                    {item.summary && <p>{item.summary}</p>}
                    {item.outcome && (
                      <p className="portfolio-case-outcome">
                        <Icon name="check" size={18} />
                        {item.outcome}
                      </p>
                    )}
                    {item.property && (
                      <Link
                        className="text-link"
                        href={`#property-${item.property.slug}`}
                      >
                        See {item.property.name}{" "}
                        <Icon name="arrowRight" size={16} />
                      </Link>
                    )}
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="portfolio-empty">
              <Icon name="photo" size={28} />
              <h3>
                {bundle
                  ? "Owner stories are on the way."
                  : "Case studies are temporarily unavailable."}
              </h3>
              <p>
                {bundle
                  ? "Case studies appear here once approved for publication."
                  : "Please retry to load published case studies."}
              </p>
            </div>
          )}
        </section>
        <section
          id="team"
          className="portfolio-section"
          aria-labelledby="portfolio-team-title"
        >
          <div className="portfolio-section-heading">
            <p className="eyebrow">Our management team</p>
            <h2 id="portfolio-team-title">
              People who look after the details.
            </h2>
            <p>
              Meet the team behind our listings, guest communication and
              everyday operations.
            </p>
          </div>
          {demo.team ? (
            <DemoPortfolioTeam />
          ) : team.length > 0 ? (
            <div className="team-grid">
              {team.map((member) => (
                <TeamCard key={member.id} member={member} />
              ))}
            </div>
          ) : (
            <div className="portfolio-empty">
              <Icon name="users" size={28} />
              <h3>
                {bundle
                  ? "Meet the team here soon."
                  : "Team profiles are temporarily unavailable."}
              </h3>
              <p>
                {bundle
                  ? "Team profiles will appear as they are published. You can still contact us about your property."
                  : "Please retry to see published team profiles."}
              </p>
              <Link href="/contact" className="text-link">
                Talk to the team
              </Link>
            </div>
          )}
        </section>
        <section
          id="testimonials"
          className="portfolio-section"
          aria-labelledby="portfolio-testimonials-title"
        >
          <div className="portfolio-section-heading">
            <p className="eyebrow">Owner voices</p>
            <h2 id="portfolio-testimonials-title">
              Their words. Their experience.
            </h2>
            <p>
              Read owner-shared words, enlarge a screenshot or press play on a
              video. Videos only play when you choose.
            </p>
          </div>
          {testimonials.length > 0 ? (
            <TestimonialGallery items={testimonials} demo={demo.testimonials} />
          ) : (
            <div className="portfolio-empty">
              <Icon name="chat" size={28} />
              <h3>
                {bundle
                  ? "Owner testimonials will appear here."
                  : "Testimonials are temporarily unavailable."}
              </h3>
              <p>
                {bundle
                  ? "Approved text screenshots and video clips are published here with the owner's permission."
                  : "Please retry to load owner-shared screenshots and videos."}
              </p>
              <Link className="text-link" href="/contact">
                Speak with our team
              </Link>
            </div>
          )}
        </section>
        <section
          className="portfolio-contact"
          id="contact"
          aria-labelledby="portfolio-contact-title"
        >
          <div>
            <p className="eyebrow">Let's talk about your property</p>
            <h2 id="portfolio-contact-title">A management plan that fits.</h2>
            <p>
              Share your city, property type and goals. We'll discuss the right
              scope and next steps with you.
            </p>
          </div>
          <div className="cta-actions">
            <Link href="/owners" className="button light">
              <Icon name="plus" size={18} />
              List your property
            </Link>
            <Link href="/contact" className="portfolio-contact-link">
              Talk to the team <Icon name="arrowRight" size={18} />
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
