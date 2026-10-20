import { DEMO_TEAM, DEMO_WORK_IMAGE } from "@/lib/demo-portfolio";
import { TeamCard } from "./PortfolioCards";
import { Icon } from "./Icon";

export function DemoPortfolioTeam() {
  const lead = DEMO_TEAM[0];
  return (
    <>
      <article className="portfolio-demo-lead">
        <img
          src={lead.photoUrl}
          alt="Generated illustration of a fictional portfolio administrator"
          loading="lazy"
          width={640}
          height={640}
        />
        <div>
          <span className="portfolio-demo-badge">
            Demo profile · fictional person
          </span>
          <p className="eyebrow">The person coordinating the portfolio</p>
          <h3>{lead.name}</h3>
          <p className="portfolio-demo-lead-role">{lead.title}</p>
          <p>{lead.bio}</p>
          <ul>
            <li>
              <Icon name="shield" size={18} />
              Portfolio data and publishing reviews
            </li>
            <li>
              <Icon name="users" size={18} />
              Team responsibilities and coordination
            </li>
            <li>
              <Icon name="check" size={18} />
              Property-readiness and content checks
            </li>
          </ul>
        </div>
      </article>
      <div className="team-grid portfolio-demo-team-grid">
        {DEMO_TEAM.slice(1).map((member) => (
          <TeamCard key={member.id} member={member} demo />
        ))}
      </div>
      <figure className="portfolio-demo-work">
        <img
          src={DEMO_WORK_IMAGE}
          alt="Generated illustration of a fictional hospitality team planning property tasks together"
          loading="lazy"
          width={1536}
          height={1024}
        />
        <figcaption>
          <span className="portfolio-demo-badge">Illustrative work scene</span>
          <h3>A clear plan behind each stay.</h3>
          <p>
            A fictional scene showing how property information, guest
            communication and daily tasks could be coordinated. Replace this
            illustration with your team's real work photograph.
          </p>
        </figcaption>
      </figure>
    </>
  );
}
