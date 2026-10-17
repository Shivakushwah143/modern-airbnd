import Link from "next/link";
import type { Metadata } from "next";
import { api } from "@/lib/api";
import type { PortfolioBundle } from "@modern-airbnd/contracts";
import {
  CaseStudyCard,
  TeamCard,
  TestimonialCard,
} from "@/components/PortfolioCards";
import { CityIcon } from "@/components/CityIcon";
import { Icon } from "@/components/Icon";

export const metadata: Metadata = {
  title: "Owner portfolio",
  description:
    "City-wise managed properties, operations and owner results from Modern Stayz.",
  alternates: { canonical: "/portfolio" },
};

async function load(): Promise<PortfolioBundle | null> {
  try {
    return await api<PortfolioBundle>("/portfolio");
  } catch {
    return null;
  }
}

export default async function PortfolioPage() {
  const bundle = await load();
  const cities = bundle?.cities ?? [];
  const caseStudies = bundle?.caseStudies ?? [];
  const team = bundle?.team ?? [];
  const testimonials = bundle?.testimonials ?? [];
  const managedCount = bundle?.managedCount ?? 0;
  const featuredCases = caseStudies.slice(0, 3);
  const featuredTeam = team.slice(0, 4);
  const featuredTestimonials = testimonials.slice(0, 3);

  return (
    <div className="container section">
      <div className="page-hero-band">
        <nav className="breadcrumb" aria-label="Breadcrumb">
          <Link href="/">Home</Link>
          <span aria-hidden="true">/</span>
          <span aria-current="page">Portfolio</span>
        </nav>
        <p className="eyebrow">Owner portfolio</p>
        <h1>Properties we manage, city by city</h1>
        <p className="intro">
          Modern Stayz runs guest stays for property owners: listings,
          availability, guest communication and on-ground operations — with
          every managed property published here and bookable on this site.
        </p>
        <div className="hero-actions">
          <Link className="button primary" href="/owners">
            List your property
          </Link>
          <Link className="button secondary" href="/services">
            View owner services
          </Link>
        </div>
      </div>

      {bundle === null && (
        <p className="notice error" role="alert">
          The portfolio service is unavailable right now. Please retry shortly.
        </p>
      )}

      <section aria-labelledby="portfolio-cities">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Managed inventory</p>
            <h2 id="portfolio-cities">Cities we operate in</h2>
          </div>
          <Link className="text-link" href="/stays">
            Browse live stays
          </Link>
        </div>
        {cities.length ? (
          <>
            <p className="muted small">
              {managedCount} managed{" "}
              {managedCount === 1 ? "property" : "properties"} published across{" "}
              {cities.length} {cities.length === 1 ? "city" : "cities"}.
            </p>
            <div className="location-grid">
              {cities.map((c) => (
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
          </>
        ) : (
          bundle && (
            <div className="empty-state">
              <h2>No managed cities published yet.</h2>
              <p>
                Portfolio listings are being prepared. In the meantime you can
                describe your property to the team.
              </p>
              <Link className="button primary" href="/owners">
                List your property
              </Link>
            </div>
          )
        )}
      </section>

      {featuredCases.length > 0 && (
        <section aria-labelledby="portfolio-cases">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Case studies</p>
              <h2 id="portfolio-cases">How managed properties perform</h2>
            </div>
          </div>
          <div className="case-grid">
            {featuredCases.map((item) => (
              <CaseStudyCard key={item.id} item={item} />
            ))}
          </div>
        </section>
      )}

      {featuredTeam.length > 0 && (
        <section aria-labelledby="portfolio-team">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Management team</p>
              <h2 id="portfolio-team">The people running your stays</h2>
            </div>
            <Link className="text-link" href="/portfolio/team">
              Meet the full team
            </Link>
          </div>
          <div className="team-grid">
            {featuredTeam.map((member) => (
              <TeamCard key={member.id} member={member} />
            ))}
          </div>
        </section>
      )}

      {featuredTestimonials.length > 0 && (
        <section aria-labelledby="portfolio-testimonials">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Owner voices</p>
              <h2 id="portfolio-testimonials">
                Testimonials with owner-shared media
              </h2>
            </div>
            <Link className="text-link" href="/portfolio/testimonials">
              View all testimonials
            </Link>
          </div>
          <div className="testimonial-grid">
            {featuredTestimonials.map((item) => (
              <TestimonialCard key={item.id} item={item} />
            ))}
          </div>
        </section>
      )}

      <section className="contact-band" aria-labelledby="portfolio-cta">
        <div>
          <p className="eyebrow">Next step</p>
          <h2 id="portfolio-cta">Put your property in the portfolio</h2>
          <p className="muted">
            Share the city, property type and your goals. The team responds with
            an operations plan tailored to your listing.
          </p>
        </div>
        <div className="cta-actions">
          <Link className="button primary" href="/owners">
            <Icon name="plus" size={16} /> List your property
          </Link>
          <Link className="button secondary" href="/contact">
            Talk to the team
          </Link>
        </div>
      </section>
    </div>
  );
}