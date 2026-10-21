import { Skeleton } from "./ui/Skeleton";

export function PropertyCardSkeleton() {
  return (
    <article
      className="property-card property-card-skeleton"
      aria-hidden="true"
    >
      <Skeleton className="skeleton-media" />
      <div className="card-content">
        <Skeleton className="skeleton-line skeleton-line-short" />
        <Skeleton className="skeleton-line skeleton-line-title" />
        <Skeleton className="skeleton-line" />
        <Skeleton className="skeleton-line skeleton-line-short" />
      </div>
    </article>
  );
}

export function ListingGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="property-grid" aria-busy="true" aria-label="Loading stays">
      {Array.from({ length: count }, (_, index) => (
        <PropertyCardSkeleton key={index} />
      ))}
    </div>
  );
}

/** Mirrors the city-first /stays hub before its catalogue has resolved. */
export function StaysHubSkeleton() {
  return (
    <div
      className="container section stays-hub stays-hub-skeleton"
      aria-busy="true"
      aria-label="Loading stays"
    >
      <div className="page-hero-band">
        <Skeleton className="skeleton-eyebrow" />
        <Skeleton className="skeleton-stays-title" />
        <Skeleton className="skeleton-stays-intro" />
      </div>
      <div className="search-card stays-search-skeleton" aria-hidden="true">
        <div className="search-fields">
          {Array.from({ length: 3 }, (_, index) => (
            <Skeleton className="skeleton-search-field" key={index} />
          ))}
        </div>
        <Skeleton className="skeleton-search-preview" />
        <Skeleton className="skeleton-search-submit" />
      </div>
      <section className="stays-cities-skeleton" aria-hidden="true">
        <Skeleton className="skeleton-eyebrow" />
        <div className="city-icon-grid">
          {Array.from({ length: 6 }, (_, index) => (
            <div className="city-icon-tile city-icon-tile-skeleton" key={index}>
              <Skeleton className="skeleton-city-art" />
              <Skeleton className="skeleton-city-name" />
              <Skeleton className="skeleton-city-meta" />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

/** Matches the narrow contact page: copy, contact methods, operator details. */
export function ContactSkeleton() {
  return (
    <div
      className="container section narrow contact-page-skeleton"
      aria-busy="true"
      aria-label="Loading contact details"
    >
      <Skeleton className="skeleton-eyebrow" />
      <Skeleton className="skeleton-contact-title" />
      <Skeleton className="skeleton-contact-intro" />
      <div className="contact-options contact-options-skeleton" aria-hidden="true">
        <Skeleton className="skeleton-contact-action" />
        <Skeleton className="skeleton-contact-action" />
        <Skeleton className="skeleton-contact-action" />
      </div>
      <Skeleton className="skeleton-contact-operator" />
      <Skeleton className="skeleton-contact-address" />
      <Skeleton className="skeleton-contact-note" />
    </div>
  );
}

/** Matches the /locations destination page, including its editorial tiles. */
export function LocationsSkeleton() {
  return (
    <div
      className="container section locations-page-skeleton"
      aria-busy="true"
      aria-label="Loading destinations"
    >
      <Skeleton className="skeleton-eyebrow" />
      <Skeleton className="skeleton-locations-title" />
      <Skeleton className="skeleton-locations-intro" />
      <div className="destination-grid" aria-hidden="true">
        {Array.from({ length: 3 }, (_, index) => (
          <article className="destination-tile destination-tile-skeleton" key={index}>
            <Skeleton className="skeleton-destination-photo" />
            <Skeleton className="skeleton-destination-name" />
            <Skeleton className="skeleton-destination-state" />
            <Skeleton className="skeleton-destination-count" />
          </article>
        ))}
      </div>
    </div>
  );
}

/** Root fallback for the homepage's photo-led discovery hero. */
export function HomeSkeleton() {
  return (
    <div className="landing-page home-page-skeleton" aria-busy="true" aria-label="Loading Modern Stayz">
      <section className="landing-hero home-hero-skeleton">
        <div className="container landing-hero-inner">
          <div className="landing-hero-copy">
            <Skeleton className="skeleton-home-eyebrow" />
            <Skeleton className="skeleton-home-title skeleton-home-title-first" />
            <Skeleton className="skeleton-home-title skeleton-home-title-second" />
            <Skeleton className="skeleton-home-copy" />
            <div className="hero-actions" aria-hidden="true">
              <Skeleton className="skeleton-home-action" />
              <Skeleton className="skeleton-home-action" />
            </div>
            <div className="search-card home-search-skeleton" aria-hidden="true">
              <div className="search-fields">
                {Array.from({ length: 3 }, (_, index) => (
                  <Skeleton className="skeleton-search-field" key={index} />
                ))}
              </div>
              <Skeleton className="skeleton-search-preview" />
              <Skeleton className="skeleton-search-submit" />
            </div>
            <Skeleton className="skeleton-home-note" />
          </div>
          <div className="landing-hero-card home-hero-card-skeleton" aria-hidden="true">
            <Skeleton className="skeleton-home-card-meta" />
            <Skeleton className="skeleton-home-card-title" />
            <Skeleton className="skeleton-home-card-meta" />
          </div>
        </div>
      </section>
    </div>
  );
}

export function PropertyDetailSkeleton() {
  return (
    <div
      className="container section property-detail-skeleton"
      aria-busy="true"
      aria-label="Loading stay details"
    >
      <Skeleton className="skeleton-breadcrumb" />
      <Skeleton className="skeleton-detail-hero" />
      <div className="detail-skeleton-columns">
        <div>
          <Skeleton className="skeleton-line skeleton-line-title" />
          <Skeleton className="skeleton-paragraph" />
        </div>
        <Skeleton className="skeleton-form" />
      </div>
    </div>
  );
}

export function PortfolioSkeleton() {
  return (
    <div
      className="portfolio-page portfolio-redesign portfolio-page-skeleton"
      aria-busy="true"
      aria-label="Loading owner portfolio"
    >
      <section className="portfolio-founder">
        <div className="container portfolio-skeleton-founder-layout">
          <div className="portfolio-skeleton-founder-copy">
            <Skeleton className="portfolio-skeleton-eyebrow" />
            <Skeleton className="portfolio-skeleton-hero-title" />
            <Skeleton className="portfolio-skeleton-hero-title short" />
            <Skeleton className="portfolio-skeleton-hero-copy" />
            <div className="portfolio-skeleton-actions">
              <Skeleton />
              <Skeleton />
            </div>
          </div>
          <Skeleton className="portfolio-skeleton-founder-image" />
        </div>
      </section>
      <div className="container">
        <section className="portfolio-skeleton-section">
          <Skeleton className="portfolio-skeleton-eyebrow" />
          <Skeleton className="portfolio-skeleton-section-title" />
          <div className="portfolio-skeleton-team-grid">
            {Array.from({ length: 3 }, (_, index) => (
              <div className="portfolio-skeleton-person" key={index}>
                <Skeleton className="portfolio-skeleton-person-image" />
                <Skeleton className="portfolio-skeleton-person-name" />
                <Skeleton className="portfolio-skeleton-person-copy" />
              </div>
            ))}
          </div>
        </section>
        <section className="portfolio-skeleton-section">
          <Skeleton className="portfolio-skeleton-eyebrow" />
          <Skeleton className="portfolio-skeleton-section-title compact" />
          <div className="portfolio-skeleton-city-grid">
            {Array.from({ length: 3 }, (_, index) => (
              <Skeleton className="portfolio-skeleton-city-card" key={index} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div
      className="table-skeleton"
      aria-busy="true"
      aria-label="Loading workspace data"
    >
      {Array.from({ length: rows }, (_, index) => (
        <Skeleton className="table-skeleton-row" key={index} />
      ))}
    </div>
  );
}

export function WorkspaceSkeleton() {
  return (
    <div
      className="admin-layout container"
      aria-busy="true"
      aria-label="Opening workspace"
    >
      <aside className="admin-nav">
        <Skeleton className="skeleton-nav-title" />
        {Array.from({ length: 6 }, (_, index) => (
          <Skeleton className="skeleton-nav-item" key={index} />
        ))}
      </aside>
      <main className="admin-main">
        <Skeleton className="skeleton-line skeleton-line-title" />
        <TableSkeleton />
      </main>
    </div>
  );
}
