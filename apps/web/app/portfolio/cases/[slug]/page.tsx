import { permanentRedirect } from "next/navigation";

export default async function PortfolioSectionRedirect({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  permanentRedirect(`/portfolio#case-${encodeURIComponent(slug)}`);
}
