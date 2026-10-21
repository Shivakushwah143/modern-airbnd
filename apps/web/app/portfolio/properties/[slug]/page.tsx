import { permanentRedirect } from "next/navigation";
import type { PortfolioPropertyBundle } from "@modern-airbnd/contracts";
import { api } from "@/lib/api";

export default async function PortfolioSectionRedirect({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const detail = await api<PortfolioPropertyBundle>(
    `/portfolio/properties/${encodeURIComponent(slug)}`,
  ).catch(() => null);
  const city = detail?.property.location.slug;
  permanentRedirect(
    city
      ? `/portfolio?city=${encodeURIComponent(city)}#property-${encodeURIComponent(slug)}`
      : `/portfolio#property-${encodeURIComponent(slug)}`,
  );
}
