import type { Location } from "@modern-airbnd/contracts";

// Display previews only: these do not create inventory or claim available stays.
export const SAMPLE_DESTINATIONS: Location[] = [
  { id: "sample-jaipur", slug: "jaipur", name: "Jaipur", state: "Rajasthan", isActive: true },
  { id: "sample-goa", slug: "goa", name: "Goa", state: "Goa", isActive: true },
  { id: "sample-manali", slug: "manali", name: "Manali", state: "Himachal Pradesh", isActive: true },
  { id: "sample-udaipur", slug: "udaipur", name: "Udaipur", state: "Rajasthan", isActive: true },
];

export function withSampleDestinations(locations: Location[]) {
  return [...locations, ...SAMPLE_DESTINATIONS.filter(sample => !locations.some(location => location.slug === sample.slug))];
}

