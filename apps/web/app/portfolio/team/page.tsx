import { permanentRedirect } from "next/navigation";

export default function PortfolioSectionRedirect() {
  permanentRedirect("/portfolio#team");
}
