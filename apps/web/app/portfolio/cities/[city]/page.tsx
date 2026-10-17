import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ApiError, api } from "@/lib/api";
import type { PortfolioCityBundle } from "@modern-airbnd/contracts";
import { ManagedPropertyCard } from "@/components/PortfolioCards";
import { CityIcon } from "@/components/CityIcon";

type LoadResult = PortfolioCityBundle | null | "notfound";

async function load(slug: string): Promise<LoadResult> {
  try {
    return await api<PortfolioCityBundle>(
      `/portfolio/cities/${encodeURIComponent(slug)}`,
    );
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) return "notfound";
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ city: string }>;
}): Promise<Metadata> {
  const { city } = await params;
  const result = await load(city);
  if (result === "notfound") notFound();
  const name = result ? result.location.name : undefined;
  return {
    title: name ? `Managed stays in ${name}` : "City portfolio",
    description: name
      ? `Properties managed by Modern Stayz in ${name}.`
      : undefined,
    alternates: { canonical: `/portfolio/cities/${city}` },
    robots: name ? undefined : { index: false, follow: false },
  };
}

export default async function PortfolioCityPage({
  params,
}: {
  params: Promise<{ city: string }>;
}) {
  const { city } = await params;
  const result = await load(city);
  if (result === "notfound") notFound();

  const bundle = result;
  const properties = bundle?.properties ?? [];
  const location = bundle?.location;

  if (!bundle || !location)
    return (
      <div className="container section">
        <div className="page-hero-band">
          <nav className="breadcrumb" aria-label="Breadcrumb">
            <Link href="/portfolio">Portfolio</Link>
            <span aria-hidden="true">/</span>
            <span aria-current="page">City</span>
          </nav>
          <p className="eyebrow">Owner portfolio</p>
          <h1>City portfolio</h1>
        </div>
        <p className="notice error" role="alert">
          The portfolio service is unavailable right now. Please retry shortly.
        </p>
        <Link className="button secondary" href="/portfolio">
          Back to portfolio
        </Link>
      </div>
    );

  return (
    <div className="container section">
      <div className="page-hero-band">
        <nav className="breadcrumb" aria-label="Breadcrumb">
          <Link href="/portfolio">Portfolio</Link>
          <span aria-hidden="true">/</span>
          <span aria-current="page">{location.name}</span>
        </nav>
        <p className="eyebrow">
          <CityIcon slug={location.slug} size={14} /> Managed city
        </p>
        <h1>Properties managed in {location.name}</h1>
        {location.state && <p className="intro">{location.state}</p>}
        <p className="muted small">
          {properties.length} published{" "}
          {properties.length === 1 ? "property" : "properties"} — every listing
          links to live availability and booking enquiry.
        </p>
      </div>

      {properties.length ? (
        <div className="property-grid">
          {properties.map((p) => (
            <ManagedPropertyCard
              key={p.id}
              property={p}
              citySlug={location.slug}
              cityName={location.name}
            />
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <h2>No managed properties published in {location.name} yet.</h2>
          <p>
            New listings go live as onboarding completes. Describe your
            property to get started.
          </p>
          <Link className="button primary" href="/owners">
            List your property
          </Link>
          <Link className="button secondary" href="/portfolio">
            Back to portfolio
          </Link>
        </div>
      )}
    </div>
  );
}