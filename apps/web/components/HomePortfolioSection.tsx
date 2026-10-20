import Link from "next/link";
import { api } from "@/lib/api";
import type { PortfolioBundle } from "@modern-airbnd/contracts";
import { RetryButton } from "./RetryButton";
import { CaseStudyCard, TeamCard, TestimonialCard } from "./PortfolioCards";
import { CityIcon } from "./CityIcon";

/** Independent RSC boundary: a slow portfolio must not delay guest content. */
export async function HomePortfolioSection() {
  let portfolio: PortfolioBundle | null = null;
  try {
    portfolio = await api<PortfolioBundle>("/portfolio");
  } catch {
    // Render a recoverable section error; backend logs retain the request ID.
  }
  const cities = portfolio?.cities.slice(0, 6) ?? [];
  const team = portfolio?.team.slice(0, 3) ?? [];
  const testimonials = portfolio?.testimonials.slice(0, 2) ?? [];
  const caseStudies = portfolio?.caseStudies.slice(0, 3) ?? [];

  return (
    <section
      className="landing-section owner-portfolio-band"
      aria-labelledby="owner-band-title"
    >
      <div className="container">
        <div className="landing-section-head">
          <div>
            <p className="eyebrow">For property owners · our portfolio</p>
            <h2 id="owner-band-title">
              {portfolio?.managedCount ? <>
              We run stays across {portfolio?.managedCount ?? 0}{" "}
              {(portfolio?.managedCount ?? 0) === 1 ? "property" : "properties"}
              {cities.length
                ? ` in ${cities.length} ${cities.length === 1 ? "city" : "cities"}`
                : ""}
              .
              </> : "Your property. Thoughtfully managed."}
            </h2>
          </div>
          <Link href="/portfolio" className="text-link">
            View the full portfolio
          </Link>
        </div>
        {portfolio === null ? (
          <div className="notice error" role="alert">
            <p>The portfolio service is unavailable right now.</p>
            <RetryButton label="Retry portfolio" />
          </div>
        ) : (
          <>
            {cities.length > 0 && (
              <div className="location-grid">
                {cities.map((city) => (
                  <Link
                    key={city.slug}
                    className="location-tile"
                    href={`/portfolio#city-${city.slug}`}
                  >
                    <span className="location-number">
                      {city.count} {city.count === 1 ? "stay" : "stays"}
                    </span>
                    <p className="eyebrow">
                      <CityIcon slug={city.slug} size={14} />{" "}
                      {city.state || "Managed city"}
                    </p>
                    <h3>{city.name}</h3>
                    <span>View managed properties</span>
                  </Link>
                ))}
              </div>
            )}
            {caseStudies.length > 0 && (
              <div className="case-grid">
                {caseStudies.map((item) => (
                  <CaseStudyCard key={item.id} item={item} />
                ))}
              </div>
            )}
            <div className="landing-owner-split">
              <div className="landing-owner-services">
                <p className="eyebrow">Management services</p>
                <h3>
                  Listings, availability, guests and on-ground operations.
                </h3>
                <p className="muted">
                  Owners hand over day-to-day operations; team keeps listings
                  honest and properties cared for.
                </p>
                <Link className="button secondary" href="/portfolio#services">
                  View owner services
                </Link>
              </div>
              {team.length > 0 && (
                <div>
                  <p className="eyebrow">Management team</p>
                  <div className="team-grid">
                    {team.map((member) => (
                      <TeamCard key={member.id} member={member} />
                    ))}
                  </div>
                </div>
              )}
              {testimonials.length > 0 && (
                <div>
                  <p className="eyebrow">Owner voices · genuine media</p>
                  <div className="testimonial-grid">
                    {testimonials.map((item) => (
                      <TestimonialCard key={item.id} item={item} />
                    ))}
                  </div>
                </div>
              )}
            </div>
            {!cities.length && !team.length && !testimonials.length && (
              <div className="empty-state">
                <h3>The portfolio is being published.</h3>
                <p>
                  City-wise listings, team profiles and owner media go live as
                  approved.
                </p>
                <Link className="button primary" href="/owners">
                  List your property
                </Link>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
