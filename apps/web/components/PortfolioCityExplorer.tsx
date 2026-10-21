"use client";

import { useEffect, useRef, useState } from "react";
import type {
  ManagedProperty,
  PortfolioCity,
  PortfolioCityBundle,
  PortfolioPropertyBundle,
} from "@modern-airbnd/contracts";
import { api } from "@/lib/api";
import { CityIcon } from "./CityIcon";
import { Gallery } from "./Gallery";
import { Icon } from "./Icon";
import { LoadingSpinner } from "./LoadingSpinner";
import { Photo } from "./Photo";

type CitySource = Record<string, PortfolioCityBundle>;

export function PortfolioCityExplorer({
  cities,
  initialCity,
  demo,
  demoCities = {},
}: {
  cities: PortfolioCity[];
  initialCity?: string;
  demo: boolean;
  demoCities?: CitySource;
}) {
  const validInitial = cities.some((city) => city.slug === initialCity)
    ? initialCity
    : undefined;
  const [selectedSlug, setSelectedSlug] = useState<string | undefined>(
    validInitial,
  );
  const [result, setResult] = useState<PortfolioCityBundle | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(Boolean(validInitial));
  const requestRef = useRef<AbortController | null>(null);
  const propertiesRef = useRef<HTMLElement>(null);
  const selectedCity = cities.find((city) => city.slug === selectedSlug);

  useEffect(() => {
    if (!selectedSlug) {
      requestRef.current?.abort();
      setResult(null);
      setError("");
      setLoading(false);
      return;
    }
    const fromDemo = demoCities[selectedSlug];
    if (fromDemo) {
      setResult(fromDemo);
      setError("");
      setLoading(false);
      return;
    }
    const controller = new AbortController();
    requestRef.current?.abort();
    requestRef.current = controller;
    setLoading(true);
    setError("");
    setResult(null);
    api<PortfolioCityBundle>(
      `/portfolio/cities/${encodeURIComponent(selectedSlug)}`,
      { signal: controller.signal },
    )
      .then((data) => {
        if (!controller.signal.aborted) setResult(data);
      })
      .catch(() => {
        if (!controller.signal.aborted)
          setError("We could not load this city’s managed properties.");
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [demoCities, selectedSlug]);

  useEffect(() => {
    if (!selectedSlug || loading || (!result && !error)) return;
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    window.requestAnimationFrame(() =>
      propertiesRef.current?.scrollIntoView({
        behavior: reducedMotion ? "auto" : "smooth",
        block: "start",
      }),
    );
  }, [error, loading, result, selectedSlug]);

  function updateUrl(slug?: string) {
    const url = new URL(window.location.href);
    if (slug) url.searchParams.set("city", slug);
    else url.searchParams.delete("city");
    window.history.replaceState(
      null,
      "",
      `${url.pathname}${url.search}${url.hash}`,
    );
  }
  function chooseCity(slug: string) {
    const next = selectedSlug === slug ? undefined : slug;
    setSelectedSlug(next);
    updateUrl(next);
  }
  function retry() {
    if (!selectedSlug) return;
    const slug = selectedSlug;
    setSelectedSlug(undefined);
    window.requestAnimationFrame(() => setSelectedSlug(slug));
  }

  return (
    <>
      <div className="portfolio-city-grid" aria-label="Cities we serve">
        {cities.map((city, index) => {
          const selected = city.slug === selectedSlug;
          return (
            <button
              className="portfolio-city-card"
              data-tone={index % 3}
              key={city.slug}
              type="button"
              aria-pressed={selected}
              aria-controls="selected-city-properties"
              onClick={() => chooseCity(city.slug)}
            >
              <span className="portfolio-city-art" aria-hidden="true">
                <CityIcon slug={city.slug} size={38} />
              </span>
              <span className="portfolio-city-meta">
                <span>{city.name}</span>
                <small>{city.state}</small>
              </span>
              <span className="portfolio-city-count">
                {city.count} {city.count === 1 ? "property" : "properties"}
              </span>
              <Icon name={selected ? "close" : "arrowRight"} size={18} />
            </button>
          );
        })}
      </div>
      {selectedCity ? (
        <section
          className="portfolio-selected-city"
          id="selected-city-properties"
          ref={propertiesRef}
          aria-labelledby="selected-city-title"
        >
          <div className="portfolio-selected-city-heading">
            <div>
              <p className="eyebrow">Selected collection</p>
              <h3 id="selected-city-title">
                Explore Properties in {selectedCity.name}
              </h3>
              <p>
                These are portfolio-managed properties. Guest stays and booking
                eligibility remain separate.
              </p>
            </div>
            <button
              className="button secondary"
              type="button"
              onClick={() => chooseCity(selectedCity.slug)}
            >
              <Icon name="close" size={17} /> Close collection
            </button>
          </div>
          {loading ? <PropertySkeletons /> : null}
          {error ? (
            <div className="portfolio-inline-state" role="alert">
              <Icon name="photo" size={24} />
              <div>
                <strong>Couldn’t load {selectedCity.name}.</strong>
                <p>{error}</p>
              </div>
              <button
                className="button secondary"
                type="button"
                onClick={retry}
              >
                Retry
              </button>
            </div>
          ) : null}
          {result && result.properties.length === 0 ? (
            <div className="portfolio-inline-state" role="status">
              <Icon name="home" size={24} />
              <div>
                <strong>No published properties yet.</strong>
                <p>Newly approved managed properties will appear here.</p>
              </div>
            </div>
          ) : null}
          {result && result.properties.length > 0 ? (
            <div className="portfolio-property-grid">
              {result.properties.map((property) => (
                <PortfolioPropertyCard
                  key={property.id}
                  property={property}
                  cityName={selectedCity.name}
                  demo={demo || property.isDemo}
                />
              ))}
            </div>
          ) : null}
        </section>
      ) : null}
    </>
  );
}

function PropertySkeletons() {
  return (
    <div
      className="portfolio-property-grid"
      aria-busy="true"
      aria-label="Loading managed properties"
    >
      {Array.from({ length: 3 }, (_, index) => (
        <div
          className="portfolio-property-skeleton"
          key={index}
          aria-hidden="true"
        />
      ))}
    </div>
  );
}

function PortfolioPropertyCard({
  property,
  cityName,
  demo,
}: {
  property: ManagedProperty;
  cityName: string;
  demo: boolean;
}) {
  const [detail, setDetail] = useState<PortfolioPropertyBundle | null>(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const requestRef = useRef<AbortController | null>(null);
  useEffect(() => () => requestRef.current?.abort(), []);
  function loadDetails() {
    if (detail) {
      setOpen((value) => !value);
      return;
    }
    requestRef.current?.abort();
    const controller = new AbortController();
    requestRef.current = controller;
    setOpen(true);
    setLoading(true);
    setError("");
    api<PortfolioPropertyBundle>(
      `/portfolio/properties/${encodeURIComponent(property.slug)}`,
      { signal: controller.signal },
    )
      .then((data) => {
        if (!controller.signal.aborted) setDetail(data);
      })
      .catch(() => {
        if (!controller.signal.aborted)
          setError("Details are temporarily unavailable.");
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
  }
  return (
    <article className="portfolio-property-card" id={`property-${property.slug}`}>
      <div className="portfolio-property-cover">
        <Photo
          media={
            property.media.find((media) => media.isCover) || property.media[0]
          }
          demo={demo}
        />
      </div>
      <div className="portfolio-property-copy">
        {demo ? (
          <span className="portfolio-demo-badge">
            Demo property · not bookable
          </span>
        ) : null}
        <p className="eyebrow">
          {property.area || cityName} · {property.propertyType}
        </p>
        <h4>{property.name}</h4>
        <p>{property.shortDescription || property.propertyType}</p>
        <p className="portfolio-property-facts">
          <Icon name="bed" size={17} /> {property.bedrooms} bedrooms ·{" "}
          {property.bathrooms} baths · sleeps {property.maxGuests}
        </p>
        <button
          className="portfolio-details-button"
          type="button"
          aria-expanded={open}
          onClick={loadDetails}
          disabled={loading}
        >
          {loading ? (
            <>
              <LoadingSpinner label="Loading property details" /> Loading
              details
            </>
          ) : (
            <>
              {open
                ? "Hide gallery & details"
                : "View gallery & management details"}{" "}
              <Icon name="arrowRight" size={17} />
            </>
          )}
        </button>
        {open && detail ? (
          <div className="portfolio-property-expanded">
            <p>{detail.property.description}</p>
            {detail.property.media.length > 0 ? (
              <Gallery media={detail.property.media} demo={demo} />
            ) : null}
            {detail.property.amenities.length > 0 ? (
              <p>
                <strong>Amenities:</strong>{" "}
                {detail.property.amenities
                  .map((amenity) => amenity.name)
                  .join(", ")}
              </p>
            ) : null}
            {detail.property.suitedFor.length > 0 ? (
              <p>
                <strong>Best suited for:</strong>{" "}
                {detail.property.suitedFor.join(", ")}
              </p>
            ) : null}
          </div>
        ) : null}
        {open && error ? (
          <div className="portfolio-property-error" role="alert">
            <p>{error}</p>
            <button
              type="button"
              className="button secondary"
              onClick={loadDetails}
            >
              Retry details
            </button>
          </div>
        ) : null}
      </div>
    </article>
  );
}
