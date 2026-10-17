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
import { Icon } from "@/components/Icon";

async function loadBundle(): Promise<PortfolioBundle | null> {
  try {
    return await api<PortfolioBundle>("/portfolio");
  } catch {
    return null;
  }
}

async function loadProperty(
  slug: string,
): Promise<PortfolioPropertyBundle | null> {
  try {
    return await api<PortfolioPropertyBundle>(
      `/portfolio/properties/${encodeURIComponent(slug)}`,
    );
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) return null;
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const bundle = await loadBundle();
  const item = bundle?.caseStudies.find((c) => c.slug === slug);
  if (!item)
    return {
      title: "Case study",
      robots: { index: false, follow: false },
    };
  return {
    title: `${item.title} | Modern Stayz portfolio`,
    description: item.summary || `Owner case study: ${item.title}.`,
    alternates: { canonical: `/portfolio/cases/${slug}` },
  };
}

export default async function CaseStudyPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const bundle = await loadBundle();
  const item = bundle?.caseStudies.find((c) => c.slug === slug);

  // Only published, portfolio-eligible case studies are in the bundle.
  if (!bundle) {
    return (
      <div className="container section empty-state">
        <p className="eyebrow">TEMPORARILY UNAVAILABLE</p>
        <h1>We couldn&apos;t load this case study.</h1>
        <p>
          The portfolio service is unavailable right now. Please retry in a
          moment, or contact the team.
        </p>
        <Link className="button primary" href="/portfolio">
          Back to portfolio
        </Link>
      </div>
    );
  }
  if (!item) notFound();

  const linked = item.property ? await loadProperty(item.property.slug) : null;
  const city = item.city || linked?.property.location.name || "";
  const relatedTestimonials = (bundle.testimonials ?? []).filter(
    (t) => city && t.city.toLowerCase() === city.toLowerCase(),
  );
  const team = bundle.team.slice(0, 3);

  return (
    <div className="container section pdp">
      <nav className="breadcrumb" aria-label="Breadcrumb">
        <Link href="/portfolio">Portfolio</Link>
        <span aria-hidden="true">/</span>
        <span aria-current="page">Case study</span>
      </nav>

      <div className="page-hero-band">
        <p className="eyebrow">
          <Icon name="home" size={14} /> Owner case study
          {city && <> · {city}</>}
        </p>
        <h1>{item.title}</h1>
        {item.summary && <p className="intro">{item.summary}</p>}
        {/* QA-011: verifiable outcomes only — whatever the team published,
            presented verbatim. No invented numbers, prices or inventory. */}
        {item.outcome && (
          <p className="case-outcome">{item.outcome}</p>
        )}
        <div className="hero-actions">
          <Link className="button primary" href="/owners">
            <Icon name="plus" size={16} /> List your property
          </Link>
          <Link className="button secondary" href="/services">
            View management services
          </Link>
        </div>
      </div>

      {item.coverUrl && (
        <div className="portfolio-cover" style={{ marginBottom: 22 }}>
          <img
            src={item.coverUrl}
            alt={item.title}
            width={1280}
            height={720}
            loading="lazy"
          />
        </div>
      )}

      {linked && (
        <>
          <section className="detail-section">
            <p className="eyebrow">THE PROPERTY</p>
            <h2>{linked.property.name}</h2>
            <p className="facts">
              {linked.property.area ? `${linked.property.area} · ` : ""}
              {linked.property.location.name} · {linked.property.propertyType} ·{" "}
              {linked.property.bedrooms} bedrooms · sleeps up to{" "}
              {linked.property.maxGuests}
            </p>
            <p className="prose">{linked.property.shortDescription}</p>
            <Link
              className="text-link"
              href={`/portfolio/properties/${linked.property.slug}`}
            >
              View the property case
            </Link>
          </section>

          {linked.property.media.length > 0 && (
            <Gallery media={linked.property.media} demo={false} />
          )}

          <section className="detail-section">
            <p className="eyebrow">MANAGEMENT SCOPE</p>
            <h2>What the team runs</h2>
            <p className="prose">{linked.property.description}</p>
            {linked.property.amenities.length > 0 && (
              <ul className="amenities-grid">
                {linked.property.amenities.map((a) => (
                  <li key={a.id}>{a.name}</li>
                ))}
              </ul>
            )}
            {linked.caseStudy && linked.caseStudy.id === item.id && (
              <p className="muted small">
                This case study reflects this property&apos;s published record.
              </p>
            )}
          </section>
        </>
      )}

      {!linked && item.property && (
        <p className="notice">
          The linked property is not part of the published portfolio right now,
          so only the case study story is shown.
        </p>
      )}

      {relatedTestimonials.length > 0 && (
        <section aria-labelledby="case-voices" className="detail-section">
          <p className="eyebrow">OWNER VOICES</p>
          <h2 id="case-voices">Owners telling it in their own words</h2>
          <div className="testimonial-grid">
            {relatedTestimonials.slice(0, 2).map((t) => (
              <TestimonialCard key={t.id} item={t} />
            ))}
          </div>
        </section>
      )}

      {team.length > 0 && (
        <section aria-labelledby="case-team" className="detail-section">
          <p className="eyebrow">MANAGEMENT TEAM</p>
          <h2 id="case-team">Who runs the portfolio</h2>
          <div className="team-grid">
            {team.map((m) => (
              <TeamCard key={m.id} member={m} />
            ))}
          </div>
        </section>
      )}

      <section className="contact-band" aria-labelledby="case-cta">
        <div>
          <p className="eyebrow">Next step</p>
          <h2 id="case-cta">Put your property in the next case study</h2>
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