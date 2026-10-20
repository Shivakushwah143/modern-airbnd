/**
 * CityIcon — decorative SVG iconography for the /stays city grid (W02).
 *
 * The motif is chosen deterministically from the location slug so the icon is
 * stable per city across renders. It is decorative only: no invented photos,
 * no invented facts about the city. Real imagery comes from published
 * property media wherever it exists.
 */
const MOTIFS = ["skyline", "wave", "mountain", "heritage", "garden", "palace", "lake"] as const;
export type Motif = (typeof MOTIFS)[number];

export function motifFor(slug: string): Motif {
  const cities: Record<string, Motif> = { delhi: "heritage", gurgaon: "skyline", gurugram: "skyline", jaipur: "palace", goa: "wave", manali: "mountain", udaipur: "lake" };
  if (cities[slug]) return cities[slug];
  let hash = 0;
  for (let i = 0; i < slug.length; i++)
    hash = (hash * 31 + slug.charCodeAt(i)) >>> 0;
  return MOTIFS[hash % MOTIFS.length];
}

export function CityIcon({
  slug,
  size = 40,
}: {
  slug: string;
  size?: number;
}) {
  const motif = motifFor(slug);
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {motif === "palace" && <><path d="M3 21h18M5 21V8h4v13m6 0V8h4v13M9 21V5h6v16M4 8l3-4 3 4m4 0 3-4 3 4M10 5l2-3 2 3" /><path d="M11 21v-5h2v5M11 9h2m-2 3h2" /></>}
      {motif === "lake" && <><path d="M3 18c2-2 4 2 6 0s4 2 6 0 4 2 6 0M3 22c2-2 4 2 6 0s4 2 6 0 4 2 6 0M5 14V8h14v6M4 8h16M8 8V5l4-3 4 3v3M9 14v-3m6 3v-3" /></>}
      {motif === "skyline" && (
        <>
          <path d="M3 21h18" />
          <path d="M5 21V9h5v12" />
          <path d="M10 21V5h5v16" />
          <path d="M15 21v-8h4v8" />
          <path d="M7 12h1M12 8h1M12 12h1M17 16h1" />
        </>
      )}
      {motif === "wave" && (
        <>
          <path d="M3 15c2 0 2-2 4-2s2 2 4 2 2-2 4-2 2 2 4 2" />
          <path d="M3 19c2 0 2-2 4-2s2 2 4 2 2-2 4-2 2 2 4 2" />
          <circle cx="12" cy="7" r="3" />
          <path d="M12 4V2" />
        </>
      )}
      {motif === "mountain" && (
        <>
          <path d="m3 19 6-10 4 6 2-3 6 7Z" />
          <path d="m9 9 1.5 2.5L12 9" />
          <circle cx="17.5" cy="6" r="2" />
        </>
      )}
      {motif === "heritage" && (
        <>
          <path d="M4 21V10l8-6 8 6v11" />
          <path d="M9 21v-6a3 3 0 0 1 6 0v6" />
          <path d="M4 12h16" />
        </>
      )}
      {motif === "garden" && (
        <>
          <path d="M12 21v-7" />
          <path d="M12 14c-4 0-6-2-6-5 3 0 6 1 6 5Z" />
          <path d="M12 14c4 0 6-2 6-5-3 0-6 1-6 5Z" />
          <circle cx="12" cy="5" r="2" />
        </>
      )}
    </svg>
  );
}
