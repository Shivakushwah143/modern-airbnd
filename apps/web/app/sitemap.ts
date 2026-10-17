import type { MetadataRoute } from "next";
import { api, siteUrl } from "@/lib/api";
import type { PortfolioBundle, Property } from "@modern-airbnd/contracts";
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const data = await api<Property[]>("/properties");
  const portfolio = await api<PortfolioBundle>("/portfolio").catch(() => null);
  const cmsPages = await api<{ slug: string }[]>("/cms/pages").catch(() => []);
  return [
    ...[
      "",
      "/properties",
      "/stays",
      "/locations",
      "/portfolio",
      "/portfolio/team",
      "/portfolio/testimonials",
      "/services",
      "/about",
      "/contact",
      "/policies",
    ].map((p) => ({
      url: siteUrl() + p,
    })),
    ...(portfolio?.cities ?? []).map((c) => ({
      url: `${siteUrl()}/portfolio/cities/${c.slug}`,
    })),
    ...(cmsPages ?? []).map((p) => ({ url: `${siteUrl()}/${p.slug}` })),
    ...data
      .filter((p) => !p.isDemo)
      .map((p) => ({ url: `${siteUrl()}/properties/${p.slug}` })),
  ];
}
