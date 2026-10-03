"use client";
import { useState } from "react";
import type { Media } from "@modern-airbnd/contracts";
import { cloudImage } from "@/lib/api";
import { Icon } from "./Icon";
export function Photo({
  media,
  demo = false,
  priority = false,
}: {
  media?: Media;
  demo?: boolean;
  priority?: boolean;
}) {
  const [failed, setFailed] = useState(false);
  return media && !failed ? (
    <img
      src={cloudImage(media.secureUrl)}
      srcSet={`${cloudImage(media.secureUrl, 480)} 480w, ${cloudImage(media.secureUrl, 900)} 900w, ${cloudImage(media.secureUrl, 1400)} 1400w`}
      sizes="(max-width:767px) 100vw, (max-width:1023px) 50vw, 40vw"
      alt={media.altText}
      loading={priority ? "eager" : "lazy"}
      width={media.width}
      height={media.height}
      onError={() => setFailed(true)}
    />
  ) : (
    <div className="photo-placeholder">
      <Icon name="photo" size={36} />
      <span>
        {demo
          ? "Demo · property photography pending"
          : "Property photo unavailable"}
      </span>
    </div>
  );
}
