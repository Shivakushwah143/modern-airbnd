import Link from "next/link";
import type {
  ManagedProperty,
  PortfolioCaseStudy,
  TeamMember,
  Testimonial,
} from "@modern-airbnd/contracts";
import { Photo } from "./Photo";
import { Icon } from "./Icon";

export function TeamCard({ member }: { member: TeamMember }) {
  const primary = member.title || member.role;
  const secondary =
    member.title && member.role && member.title !== member.role
      ? member.role
      : "";
  const initials = member.name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
  return (
    <article className="team-card">
      {member.photoUrl ? (
        <img
          className="team-photo"
          src={member.photoUrl}
          alt={`${member.name}${primary ? `, ${primary}` : ""}`}
          loading="lazy"
          width={400}
          height={400}
        />
      ) : (
        <div className="team-avatar" aria-hidden="true">
          {initials || "?"}
        </div>
      )}
      <h3>{member.name}</h3>
      {primary && <p className="team-role">{primary}</p>}
      {secondary && <p>{secondary}</p>}
      {member.bio && <p>{member.bio}</p>}
    </article>
  );
}

export function TestimonialCard({ item }: { item: Testimonial }) {
  const label = `${item.ownerName} uploaded ${item.mediaType === "VIDEO" ? "a short video" : "a screenshot"}`;
  return (
    <figure className="testimonial-card">
      {item.mediaUrl && (
        <div className="testimonial-media">
          {item.mediaType === "VIDEO" ? (
            <video
              src={item.mediaUrl}
              controls
              playsInline
              preload="metadata"
              aria-label={label}
            />
          ) : (
            <img
              src={item.mediaUrl}
              alt={label}
              loading="lazy"
              width={640}
              height={480}
            />
          )}
        </div>
      )}
      <blockquote>
        <p>{item.quote || "Owner-shared media from their property."}</p>
      </blockquote>
      <figcaption>
        <cite>
          <strong>{item.ownerName}</strong>
          {item.city && <> · {item.city}</>}
        </cite>
      </figcaption>
      <p className="small muted">
        Owner-uploaded {item.mediaType === "VIDEO" ? "video" : "screenshot"}
      </p>
    </figure>
  );
}

export function CaseStudyCard({ item }: { item: PortfolioCaseStudy }) {
  return (
    <article className="portfolio-card">
      <div className="portfolio-cover">
        {item.coverUrl ? (
          <img
            src={item.coverUrl}
            alt={item.title}
            loading="lazy"
            width={640}
            height={360}
          />
        ) : (
          <Icon name="photo" size={28} />
        )}
      </div>
      <div className="portfolio-statline">
        <span className="pill">{item.city || "Portfolio"}</span>
      </div>
      <h3>{item.title}</h3>
      {item.summary && <p className="muted small">{item.summary}</p>}
      {item.outcome && <p className="case-outcome small">{item.outcome}</p>}
      {item.property && (
        <Link className="text-link" href={`/properties/${item.property.slug}`}>
          View {item.property.name}
        </Link>
      )}
    </article>
  );
}

export function ManagedPropertyCard({
  property: p,
  citySlug,
  cityName,
}: {
  property: ManagedProperty;
  citySlug: string;
  cityName: string;
}) {
  const href = `/stays/${citySlug}/${p.slug}`;
  return (
    <article className="property-card">
      <Link className="card-image" href={href} tabIndex={-1} aria-hidden="true">
        <Photo media={p.media[0]} demo={p.isDemo} />
        {p.isDemo && <span className="demo-tag">Demo stay</span>}
      </Link>
      <div className="card-content">
        <div className="eyebrow">
          <Icon name="pin" size={14} />
          {p.area ? `${p.area} / ${cityName}` : cityName}
        </div>
        <h3>
          <Link href={href}>{p.name}</Link>
        </h3>
        <p className="muted small card-summary">
          {p.shortDescription || p.propertyType}
        </p>
        <p className="facts">
          <Icon name="bed" size={18} />
          {p.bedrooms} bedrooms · {p.bathrooms} baths · {p.maxGuests} guests
        </p>
        <div className="card-foot">
          <Link className="card-link" href={href}>
            View managed stay
          </Link>
        </div>
      </div>
    </article>
  );
}