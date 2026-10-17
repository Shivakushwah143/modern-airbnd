import Link from "next/link";
import type { Metadata } from "next";
import { api } from "@/lib/api";
import type { TeamMember } from "@modern-airbnd/contracts";
import { TeamCard } from "@/components/PortfolioCards";

export const metadata: Metadata = {
  title: "Management team",
  description:
    "The Modern Stayz team managing listings, guests and on-ground operations.",
  alternates: { canonical: "/portfolio/team" },
};

async function load(): Promise<TeamMember[] | null> {
  try {
    const bundle = await api<{ team: TeamMember[] }>("/portfolio");
    return bundle.team;
  } catch {
    return null;
  }
}

export default async function TeamPage() {
  const team = await load();

  return (
    <div className="container section">
      <div className="page-hero-band">
        <nav className="breadcrumb" aria-label="Breadcrumb">
          <Link href="/portfolio">Portfolio</Link>
          <span aria-hidden="true">/</span>
          <span aria-current="page">Team</span>
        </nav>
        <p className="eyebrow">Management team</p>
        <h1>The people running your stays</h1>
        <p className="intro">
          Operations, guest communication and on-ground coordination — meet the
          team behind every Modern Stayz property.
        </p>
      </div>

      {team === null && (
        <p className="notice error" role="alert">
          The portfolio service is unavailable right now. Please retry shortly.
        </p>
      )}

      {team && team.length > 0 && (
        <div className="team-grid">
          {team.map((member) => (
            <TeamCard key={member.id} member={member} />
          ))}
        </div>
      )}

      {team && team.length === 0 && (
        <div className="empty-state">
          <h2>Team profiles are being published.</h2>
          <p>In the meantime, reach the team directly through contact.</p>
          <Link className="button primary" href="/contact">
            Contact the team
          </Link>
        </div>
      )}
    </div>
  );
}