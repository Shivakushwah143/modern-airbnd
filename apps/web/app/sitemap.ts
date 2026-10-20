import type { MetadataRoute } from "next";
import { api, siteUrl } from "@/lib/api";
import type { Property } from "@modern-airbnd/contracts";
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const data = await api<Property[]>("/properties");
  const cmsPages = await api<{ slug: string }[]>("/cms/pages").catch(() => []);
  return [
    ...[
      "",
      "/properties",
      "/stays",
      "/locations",
      "/portfolio",
      "/about",
      "/contact",
      "/policies",
    ].map((p) => ({
      url: siteUrl() + p,
    })),
    ...(cmsPages ?? []).map((p) => ({ url: `${siteUrl()}/${p.slug}` })),
    ...data
      .filter((p) => !p.isDemo)
      .map((p) => ({ url: `${siteUrl()}/properties/${p.slug}` })),
  ];
}
