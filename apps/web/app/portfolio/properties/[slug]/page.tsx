import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import type {
  PortfolioBundle,
  PortfolioPropertyBundle,
} from "@modern-airbnd/contracts";
import { ApiError, api } from "@/lib/api";
import { Gallery } from "@/components/Gallery";
import { TeamCard, TestimonialCard } from "@/components/PortfolioCards";
import { CityIcon } from "@/components/CityIcon";
import { Icon } from "@/components/Icon";

async function load(slug: string): Promise<PortfolioPropertyBundle | null> {
  try {
    return await api<PortfolioPropertyBundle>(
      `/portfolio/properties/${encodeURIComponent(slug)}`,
    );
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) notFound();
    return null;
  }
}

async function loadBundle(): Promise<PortfolioBundle | null> {
  try {
    return await api<PortfolioBundle>("/portfolio");
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const result = await load(slug);
  if (!result)
    return {
      title: "Managed property",
      robots: { index: false, follow: false },
    };
  return {
    title: `${result.property.name} | Managed by Modern Stayz`,
    description:
      result.property.shortDescription ||
      `How Modern Stayz manages ${result.property.name} in ${result.property.location.name}.`,
    alternates: { canonical: `/portfolio/properties/${slug}` },
  };
}

export default async function PortfolioPropertyPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const result = await load(slug);
  const bundle = await loadBundle();

  if (!result) {
    return (
      <div className="container section empty-state">
        <p className="eyebrow">TEMPORARILY UNAVAILABLE</p>
        <h1>We couldn&apos;t load this property.</h1>
        <p>
          The portfolio service is unavailable right now. Please retry in a
          moment, or contact the team for help.
        </p>
        <Link className="button primary" href="/portfolio">
          Back to portfolio
        </Link>
      </div>
    );
  }

  const p = result.property;
  const caseStudy = result.caseStudy;
  const cityTestimonials = (bundle?.testimonials ?? []).filter(
    (t) => t.city.toLowerCase() === p.location.name.toLowerCase(),
  );
  const team = (bundle?.team ?? []).slice(0, 3);

  return (
    <div className="container section pdp">
      <nav className="breadcrumb" aria-label="Breadcrumb">
        <Link href="/portfolio">Portfolio</Link>
        <span aria-hidden="true">/</span>
        <Link href={`/portfolio/cities/${p.location.slug}`}>
          {p.location.name}
        </Link>
        <span aria-hidden="true">/</span>
        <span aria-current="page">{p.name}</span>
      </nav>

      <div className="page-hero-band">
        <p className="eyebrow">
          <Icon name="home" size={14} /> Owner portfolio · managed property
        </p>
        <h1>{p.name}</h1>
        <p className="intro">{p.shortDescription || p.description.slice(0, 200)}</p>
        <p className="facts">
          {p.area ? `${p.area} · ` : ""}
          {p.location.name} · {p.propertyType} · {p.bedrooms} bedrooms ·{" "}
          {p.bathrooms} baths · sleeps up to {p.maxGuests}
        </p>
        {/* QA-010: no prices, no availability search, no booking CTA here —
            this page tells the owner-facing management story. */}
        <div className="hero-actions">
          <Link className="button primary" href="/owners">
            <Icon name="plus" size={16} /> List your property
          </Link>
          <Link className="button secondary" href="/services">
            View management services
          </Link>
        </div>
      </div>

      {p.media.length > 0 && <Gallery media={p.media} demo={false} />}

      <section className="detail-section">
        <p className="eyebrow">MANAGEMENT SCOPE</p>
        <h2>How this property is run</h2>
        <p className="prose">{p.description}</p>
        <p className="muted small">
          Scope covers listings, availability, guest communication and on-ground
          operations — see{" "}
          <Link className="text-link" href="/services">
            owner services
          </Link>{" "}
          for the full breakdown.
        </p>
        {p.amenities.length > 0 && (
          <>
            <h3>What guests find here</h3>
            <ul className="amenities-grid">
              {p.amenities.map((a) => (
                <li key={a.id}>{a.name}</li>
              ))}
            </ul>
          </>
        )}
        {p.localHighlights.length > 0 && (
          <dl>
            {p.localHighlights.map((h, i) => (
              <div key={i}>
                <dt>{h.name}</dt>
                <dd>{h.detail}</dd>
              </div>
            ))}
          </dl>
        )}
        {p.suitedFor.length > 0 && (
          <p className="muted small">
            <strong>Best suited for</strong> · {p.suitedFor.join(" · ")}
          </p>
        )}
      </section>

      {caseStudy && (
        <section className="detail-section" aria-labelledby="related-case">
          <p className="eyebrow">VERIFIED OUTCOME</p>
          <h2 id="related-case">{caseStudy.title}</h2>
          {caseStudy.summary && <p className="prose">{caseStudy.summary}</p>}
          {caseStudy.outcome && <p className="case-outcome">{caseStudy.outcome}</p>}
          <Link className="text-link" href={`/portfolio/cases/${caseStudy.slug}`}>
            Read the full case study
          </Link>
        </section>
      )}

      {cityTestimonials.length > 0 && (
        <section aria-labelledby="city-voices" className="detail-section">
          <p className="eyebrow">OWNER VOICES · {p.location.name.toUpperCase()}</p>
          <h2 id="city-voices">Owners in this city</h2>
          <div className="testimonial-grid">
            {cityTestimonials.slice(0, 2).map((item) => (
              <TestimonialCard key={item.id} item={item} />
            ))}
          </div>
        </section>
      )}

      {team.length > 0 && (
        <section aria-labelledby="property-team" className="detail-section">
          <p className="eyebrow">MANAGEMENT TEAM</p>
          <h2 id="property-team">The people behind this listing</h2>
          <div className="team-grid">
            {team.map((member) => (
              <TeamCard key={member.id} member={member} />
            ))}
          </div>
        </section>
      )}

      <section className="contact-band" aria-labelledby="property-cta">
        <div>
          <p className="eyebrow">Next step</p>
          <h2 id="property-cta">Want your property managed like this?</h2>
          <p className="muted">
            <CityIcon slug={p.location.slug} size={14} /> Operating in{" "}
            {p.location.name}
            {p.location.state ? ` · ${p.location.state}` : ""}.
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