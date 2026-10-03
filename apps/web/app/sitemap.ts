import type { MetadataRoute } from "next";
import { api, siteUrl } from "@/lib/api";
import type { Property } from "@modern-airbnd/contracts";
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const data = await api<Property[]>("/properties");
  return [
    ...["", "/properties", "/about", "/contact", "/policies"].map((p) => ({
      url: siteUrl() + p,
    })),
    ...data
      .filter((p) => !p.isDemo)
      .map((p) => ({ url: `${siteUrl()}/properties/${p.slug}` })),
  ];
}
