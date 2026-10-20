"use client";

import Link from "next/link";
import { useState } from "react";
import type { Location } from "@modern-airbnd/contracts";
import { CityIcon } from "./CityIcon";

export function DestinationCarousel({ locations }: { locations: Location[] }) {
  const [paused, setPaused] = useState(false);
  return (
    <div className={`destination-carousel ${paused ? "is-paused" : ""}`}>
      <div className="destination-carousel-controls">
        <span>Explore at your own pace</span>
        <button type="button" onClick={() => setPaused(!paused)} aria-pressed={paused}>
          {paused ? "Resume scrolling" : "Pause scrolling"}
        </button>
      </div>
      <div className="destination-carousel-viewport" aria-label="Destinations" onPointerDown={() => setPaused(true)}>
        <div className="destination-carousel-track">
          {[0, 1, 2].map(copy => (
            <div className="destination-carousel-group" key={copy} aria-hidden={copy > 0 ? true : undefined}>
              {locations.map(location => (
                <Link className="landing-destination" href={`/stays/${location.slug}`} key={location.slug} tabIndex={copy > 0 ? -1 : undefined}>
                  <span className="landing-destination-photo"><CityIcon slug={location.slug} size={34} /></span>
                  <strong>{location.name}</strong>
                  <small>{location.state}</small>
                  {location.id.startsWith("sample-") && <span className="destination-sample-label">Sample</span>}
                </Link>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
