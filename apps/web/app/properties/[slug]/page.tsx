import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import type { Property } from "@modern-airbnd/contracts";
import { api, ApiError, queryString } from "@/lib/api";
import { PropertyBody } from "@/components/PropertyBody";
import type { Settings } from "@modern-airbnd/contracts";
async function load(slug: string, query = "") {
  try {
    return await api<Property>(
      `/properties/${encodeURIComponent(slug)}?${query}`,
    );
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) notFound();
    throw e;
  }
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const p = await load(slug);
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
  let p: Property;
  let warning = "";
  try {
    p = await load(slug, queryString(q));
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) notFound();
    // If property content still loads but a date query failed, retain the content without guessing availability.
    p = await load(slug);
    p = { ...p, availability: { status: "UNKNOWN" }, whatsappUrl: null };
    warning =
      e instanceof ApiError && e.status === 400
        ? e.message
        : "We could not confirm availability. Retry or contact the team.";
  }
  const settings = await api<Settings>("/settings/public");
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
