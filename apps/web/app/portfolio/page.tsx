import Link from "next/link";
import type { Metadata } from "next";
import type {
  PortfolioBundle,
  PortfolioCityBundle,
  TeamMember,
} from "@modern-airbnd/contracts";
import { api } from "@/lib/api";
import { TeamCard } from "@/components/PortfolioCards";
import { TestimonialGallery } from "@/components/TestimonialGallery";
import { PortfolioServices } from "@/components/PortfolioServices";
import { Icon } from "@/components/Icon";
import { RetryButton } from "@/components/RetryButton";
import { resolvePortfolioContent } from "@/lib/demo-portfolio";
import { PortfolioCityExplorer } from "@/components/PortfolioCityExplorer";
import { ScrollableCardRail } from "@/components/ScrollableCardDots";

export const metadata: Metadata = {
  title: "Our portfolio, services & team",
  description:
    "Meet Modern Stayz, explore managed properties, and hear from property owners.",
  alternates: { canonical: "/portfolio" },
};

const isFounder = (member: TeamMember) =>
  /founder|managing director|superadmin/i.test(
    `${member.title} ${member.role}`,
  );

export default async function PortfolioPage({
  searchParams,
}: {
  searchParams: Promise<{ city?: string }>;
}) {
  const [liveBundle, params] = await Promise.all([
    api<PortfolioBundle>("/portfolio").catch(() => null),
    searchParams,
  ]);
  // City and property payloads are deliberately loaded only after intent: a city
  // selection or a property-detail request. This prevents the previous N+1 fan-out.
  const {
    bundle,
    demo,
    hasDemo,
    cities: demoCityBundles,
  } = resolvePortfolioContent(
    liveBundle,
    [],
    [],
    process.env.PORTFOLIO_DEMO_CONTENT !== "false",
  );
  const cities = bundle?.cities ?? [];
  const team = bundle?.team ?? [];
  const founder = team.find(isFounder);
  const otherTeam = founder
    ? team.filter((member) => member.id !== founder.id)
    : team;
  const demoCities = Object.fromEntries(
    demoCityBundles
      .filter(Boolean)
      .map((city) => [city!.location.slug, city! as PortfolioCityBundle]),
  );

  return (
    <div className="portfolio-page portfolio-redesign">
      <section className="portfolio-founder" aria-labelledby="portfolio-title">
        <div className="container">
          <nav className="breadcrumb" aria-label="Breadcrumb">
            <Link href="/">Home</Link>
            <span aria-hidden="true">/</span>
            <span aria-current="page">Our portfolio</span>
          </nav>
          {hasDemo ? (
            <div className="portfolio-demo-notice" role="note">
              <Icon name="photo" size={22} />
              <div>
                <strong>Demo portfolio preview</strong>
                <p>
                  Clearly marked profiles, properties and testimonials below are
                  illustrative examples, not real people, listings or reviews.
                </p>
              </div>
            </div>
          ) : null}
          <div className="portfolio-founder-layout">
            <div className="portfolio-founder-copy">
              <p className="eyebrow">Modern Stayz · property management</p>
              <h1 id="portfolio-title">
                A more considered way to care for every stay.
              </h1>
              <p className="portfolio-founder-intro">
                Thoughtful hospitality begins with the people who take
                responsibility for the details—from the first listing
                conversation through every guest arrival.
              </p>
              <div className="hero-actions">
                <Link href="#cities" className="button primary">
                  Explore our portfolio <Icon name="arrowRight" size={18} />
                </Link>
                <Link href="/owners" className="button secondary">
                  Partner with us
                </Link>
              </div>
              {bundle?.managedCount ? (
                <p className="portfolio-live-summary">
                  <Icon name="home" size={18} />
                  {bundle.managedCount} {demo.properties ? "sample" : "managed"}{" "}
                  {bundle.managedCount === 1 ? "property" : "properties"} across{" "}
                  {cities.length} {cities.length === 1 ? "city" : "cities"}
                </p>
              ) : null}
            </div>
            <FounderProfile founder={founder} demo={demo.team} />
          </div>
        </div>
      </section>

      <div className="container">
        {!liveBundle ? (
          <div className="notice error" role="alert">
            <p>
              The live portfolio service is unavailable.{" "}
              {hasDemo
                ? "Labeled illustrative examples are shown while it recovers."
                : "Please try again shortly."}
            </p>
            <RetryButton label="Retry portfolio" />
          </div>
        ) : null}
        <section
          id="team"
          className="portfolio-section portfolio-team-section"
          aria-labelledby="portfolio-team-title"
        >
          <SectionHeading
            id="portfolio-team-title"
            eyebrow="Our team"
            title="The people behind the everyday care."
            body="Published profiles for the team coordinating listings, guest communication and on-ground operations."
          />
          {otherTeam.length > 0 ? (
            <div className="team-grid">
              {otherTeam.map((member) => (
                <TeamCard key={member.id} member={member} demo={demo.team} />
              ))}
            </div>
          ) : (
            <EmptyState
              icon="users"
              title="More team profiles are coming soon."
              body="As colleagues are published, their profiles will appear here."
            />
          )}
        </section>
        <section
          id="cities"
          className="portfolio-section"
          aria-labelledby="portfolio-cities-title"
        >
          <SectionHeading
            id="portfolio-cities-title"
            eyebrow="Cities we serve"
            title="Local knowledge, one standard of care."
            body="Choose a city to see its portfolio-managed properties. This collection is distinct from guest-bookable stays."
          />
          {cities.length ? (
            <PortfolioCityExplorer
              cities={cities}
              initialCity={params.city}
              demo={demo.properties}
              demoCities={demoCities}
            />
          ) : (
            <EmptyState
              icon="home"
              title="Our managed collection is being prepared."
              body="Approved portfolio properties will appear here as they are published."
            />
          )}
        </section>
        <section
          id="testimonials"
          className="portfolio-section"
          aria-labelledby="portfolio-testimonials-title"
        >
          <SectionHeading
            id="portfolio-testimonials-title"
            eyebrow="Owner voices"
            title="Their words. Their experience."
            body="Published owner-shared screenshots and videos appear only with the appropriate approval. Videos play only when you choose."
          />
          {bundle?.testimonials.length ? (
            <div className="portfolio-testimonial-deck">
              <TestimonialGallery
                items={bundle.testimonials}
                demo={demo.testimonials}
              />
            </div>
          ) : (
            <EmptyState
              icon="chat"
              title="Owner testimonials will appear here."
              body="Approved owner stories are added when ready to share."
            />
          )}
        </section>
        <PortfolioServices />
        <section
          id="cases"
          className="portfolio-section"
          aria-labelledby="portfolio-cases-title"
        >
          <SectionHeading
            id="portfolio-cases-title"
            eyebrow="Case studies"
            title="The work behind each property."
            body="Published owner stories and management outcomes, kept separate from the guest booking journey."
          />
          {bundle?.caseStudies.length ? (
            <ScrollableCardRail
              className="case-grid"
              count={bundle.caseStudies.length}
              label="case study"
              autoAdvanceOnMobile
            >
              {bundle.caseStudies.map((item) => (
                <article className="portfolio-case-card" key={item.id}>
                  {item.coverUrl ? (
                    <img
                      src={item.coverUrl}
                      alt={item.title}
                      loading="lazy"
                      width={640}
                      height={360}
                    />
                  ) : null}
                  <div>
                    {demo.cases ? (
                      <span className="portfolio-demo-badge">
                        Illustrative case study · sample content
                      </span>
                    ) : null}
                    <p className="eyebrow">{item.city || "Managed property"}</p>
                    <h3>{item.title}</h3>
                    {item.summary ? <p>{item.summary}</p> : null}
                    {item.outcome ? (
                      <p className="portfolio-case-outcome">
                        <Icon name="check" size={18} />
                        {item.outcome}
                      </p>
                    ) : null}
                  </div>
                </article>
              ))}
            </ScrollableCardRail>
          ) : (
            <EmptyState
              icon="photo"
              title="Owner stories are on the way."
              body="Case studies will appear once approved for publication."
            />
          )}
        </section>
        <section
          className="portfolio-contact"
          id="contact"
          aria-labelledby="portfolio-contact-title"
        >
          <div>
            <p className="eyebrow">Let’s talk about your property</p>
            <h2 id="portfolio-contact-title">A management plan that fits.</h2>
            <p>
              Share your city, property type and goals. We’ll discuss the right
              scope and next steps with you.
            </p>
          </div>
          <div className="cta-actions">
            <Link href="/owners" className="button light">
              <Icon name="plus" size={18} />
              List your property
            </Link>
            <Link href="/contact" className="portfolio-contact-link">
              Talk to the team <Icon name="arrowRight" size={18} />
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}

function FounderProfile({
  founder,
  demo,
}: {
  founder?: TeamMember;
  demo: boolean;
}) {
  if (!founder)
    return (
      <aside className="portfolio-founder-profile portfolio-founder-pending">
        <img
          src="/demo/portfolio/lead.webp"
          alt="Temporary illustrative portrait for the Modern Stayz founder profile"
          width={720}
          height={900}
        />
        <div>
          <span className="portfolio-demo-badge">
            Temporary illustrative portrait
          </span>
          <p className="eyebrow">Leadership at Modern Stayz</p>
          <h2>Founder / Managing Director</h2>
          <p>
            A public founder profile will appear here when it is ready to be
            published.
          </p>
        </div>
      </aside>
    );
  return (
    <aside className="portfolio-founder-profile">
      {founder.photoUrl ? (
        <img
          src={founder.photoUrl}
          alt={`${demo ? "Generated illustration of fictional profile: " : ""}${founder.name}, Founder / Managing Director`}
          width={720}
          height={900}
        />
      ) : (
        <img
          src="/demo/portfolio/lead.webp"
          alt="Temporary illustrative portrait for the Modern Stayz founder profile"
          width={720}
          height={900}
        />
      )}
      <div>
        {!founder.photoUrl ? (
          <span className="portfolio-demo-badge">
            Temporary illustrative portrait
          </span>
        ) : null}
        {demo ? (
          <span className="portfolio-demo-badge">
            Demo profile · fictional person
          </span>
        ) : null}
        <p className="eyebrow">Founder / Managing Director</p>
        <h2>{founder.name}</h2>
        {founder.bio ? (
          <p>{founder.bio}</p>
        ) : (
          <p>
            Leading Modern Stayz with a focus on thoughtful property care and
            dependable hospitality.
          </p>
        )}
      </div>
    </aside>
  );
}
function SectionHeading({
  id,
  eyebrow,
  title,
  body,
}: {
  id: string;
  eyebrow: string;
  title: string;
  body: string;
}) {
  return (
    <div className="portfolio-section-heading">
      <p className="eyebrow">{eyebrow}</p>
      <h2 id={id}>{title}</h2>
      <p>{body}</p>
    </div>
  );
}
function EmptyState({
  icon,
  title,
  body,
}: {
  icon: string;
  title: string;
  body: string;
}) {
  return (
    <div className="portfolio-empty">
      <Icon name={icon} size={28} />
      <h3>{title}</h3>
      <p>{body}</p>
    </div>
  );
}
