import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import type { Property, Settings } from "@modern-airbnd/contracts";
import { api, ApiError, emptySettings, queryString } from "@/lib/api";
import { PropertyBody } from "@/components/PropertyBody";
import { RetryButton } from "@/components/RetryButton";
import { Icon } from "@/components/Icon";

async function loadProperty(
  slug: string,
  query = "",
): Promise<{ property: Property | null; error: ApiError | null }> {
  try {
    const property = await api<Property>(
      `/properties/${encodeURIComponent(slug)}?${query}`,
    );
    return { property, error: null };
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) notFound();
    return { property: null, error: e instanceof ApiError ? e : null };
  }
}

async function loadSettings(): Promise<Settings> {
  try {
    return await api<Settings>("/settings/public");
  } catch {
    return emptySettings;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ city: string; slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const { property: p } = await loadProperty(slug);
  if (!p)
    return {
      title: "Stay",
      alternates: { canonical: `/stays/${slug}` },
      robots: { index: false, follow: false },
    };
  return {
    title: p.seoTitle || p.name,
    description:
      p.seoDescription || p.shortDescription || p.description.slice(0, 160),
    alternates: { canonical: `/stays/${p.location.slug}/${p.slug}` },
    openGraph: {
      title: `${p.name} | Modern Stayz`,
      description: p.shortDescription,
      images: p.media[0] ? [p.media[0].secureUrl] : [],
    },
    robots: p.isDemo ? { index: false, follow: false } : undefined,
  };
}

export default async function StayDetail({
  params,
  searchParams,
}: {
  params: Promise<{ city: string; slug: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const { city, slug } = await params;
  const raw = await searchParams;
  const guestsRaw = Number(raw.guests);
  const q = {
    checkIn: raw.checkIn,
    checkOut: raw.checkOut,
    guests:
      raw.guests &&
      Number.isInteger(guestsRaw) &&
      guestsRaw >= 1 &&
      guestsRaw <= 200
        ? raw.guests
        : undefined,
  };

  const first = await loadProperty(slug, queryString(q));
  let p = first.property;
  let warning = "";

  // Dated request failed → retry without dates so content still renders.
  if (!p && (q.checkIn || q.checkOut)) {
    const fallback = await loadProperty(slug);
    if (fallback.property) {
      p = {
        ...fallback.property,
        availability: { status: "UNKNOWN" },
        whatsappUrl: null,
      };
      warning =
        first.error?.status === 400
          ? first.error.message
          : "We could not confirm availability. Retry or contact the team.";
    }
  }

  if (!p) {
    return (
      <div className="container section empty-state">
        <p className="eyebrow">TEMPORARILY UNAVAILABLE</p>
        <h1>We couldn’t load this stay.</h1>
        <p>
          The property service is unavailable right now. Please retry in a
          moment, or contact the team for help.
        </p>
        <RetryButton label="Retry" className="button primary" />
        <Link href={`/stays/${city}`} className="button secondary">
          Back to {city} stays
        </Link>
        <Link href="/contact" className="text-link">
          Contact the team
        </Link>
      </div>
    );
  }

  // A stay detail URL must belong to its city segment (FR-037 nested routes).
  if (p.location.slug !== city) notFound();

  const settings = await loadSettings();
  const cityQuery = queryString({ location: city, ...q });

  return (
    <div className="container section pdp">
      <nav className="breadcrumb" aria-label="Breadcrumb">
        <Link href="/stays">Stays</Link>
        <span aria-hidden="true">/</span>
        <Link href={`/stays${cityQuery ? `?${cityQuery}` : ""}`}>
          {p.location.name}
        </Link>
        <span aria-hidden="true">/</span>
        <span aria-current="page">{p.name}</span>
      </nav>

      <div className="row-actions pdp-actions">
        <Link
          className="pdp-back-action"
          href={`/stays${cityQuery ? `?${cityQuery}` : ""}`}
        >
          <Icon name="arrow" size={18} />
          Back to {p.location.name} stays
        </Link>
        <Link
          className="button primary pdp-book-action"
          href={`/stays/${city}/${slug}/enquire${
            queryString({ ...q }) ? `?${queryString({ ...q })}` : ""
          }`}
        >
          <Icon name="calendar" size={20} />
          Book this stay
        </Link>
      </div>

      {p.isDemo && (
        <p className="notice">
          Demonstration property · fictional inventory. Enquiries are disabled.
        </p>
      )}
      <PropertyBody
        property={p}
        settings={settings}
        dates={q}
        warning={warning}
      />
    </div>
  );
}
