import { permanentRedirect } from "next/navigation";

export default async function PortfolioSectionRedirect({
  params,
}: {
  params: Promise<{ city: string }>;
}) {
  const { city } = await params;
  permanentRedirect(`/portfolio#city-${encodeURIComponent(city)}`);
}
