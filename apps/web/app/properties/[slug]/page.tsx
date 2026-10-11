import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import type { Property, Settings } from "@modern-airbnd/contracts";
import { api, ApiError, emptySettings, queryString } from "@/lib/api";
import { PropertyBody } from "@/components/PropertyBody";
import { RetryButton } from "@/components/RetryButton";

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
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const { property: p } = await loadProperty(slug);
  if (!p) {
    // Do not throw from metadata when the property service is unavailable:
    // a throw here fails the RSC payload for client-side navigations.
    return {
      title: "Property",
      alternates: { canonical: `/properties/${slug}` },
    };
  }
  return {
    title: p.seoTitle || p.name,
    description:
      p.seoDescription || p.shortDescription || p.description.slice(0, 160),
    alternates: { canonical: `/properties/${slug}` },
    openGraph: {
      title: `${p.name} | Modern Airbnd`,
      description: p.shortDescription,
      images: p.media[0] ? [p.media[0].secureUrl] : [],
    },
    robots: p.isDemo ? { index: false, follow: false } : undefined,
  };
}

export default async function Detail({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const { slug } = await params;
  const raw = await searchParams;
  const q = { checkIn: raw.checkIn, checkOut: raw.checkOut };

  const first = await loadProperty(slug, queryString(q));
  let p = first.property;
  let warning = "";

  // If a dated request failed, retry without dates so the property content can
  // still be reviewed, and mark availability as unconfirmed.
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

  // The property service is unavailable. Degrade gracefully instead of throwing
  // (which crashed the route and surfaced as a failed RSC fetch on navigation).
  if (!p) {
    return (
      <div className="container section empty-state">
        <p className="eyebrow">TEMPORARILY UNAVAILABLE</p>
        <h1>We couldn’t load this property.</h1>
        <p>
          The property service is unavailable right now. Please retry in a
          moment, or contact the team for help.
        </p>
        <RetryButton label="Retry" className="button primary" />
        <Link href="/properties" className="button secondary">
          Browse properties
        </Link>
        <Link href="/contact" className="text-link">
          Contact the team
        </Link>
      </div>
    );
  }

  const settings = await loadSettings();

  return (
    <div className="container section pdp">
      <Link
        href={`/properties?${queryString({ location: raw.location || p.location.slug, ...q })}`}
        className="back-link"
      >
        Back to properties
      </Link>
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
