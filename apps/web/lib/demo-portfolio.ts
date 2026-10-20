import type {
  Media,
  PortfolioBundle,
  PortfolioCityBundle,
  PortfolioPropertyBundle,
  TeamMember,
} from "@modern-airbnd/contracts";

const ASSETS = "/demo/portfolio";
const picture = (name: string, altText: string): Media => ({
  id: `demo-photo-${name}`,
  secureUrl: `${ASSETS}/${name}.webp`,
  cloudinaryPublicId: "",
  altText,
  isCover: true,
  sortOrder: 0,
  width: 1536,
  height: 1024,
});

export const DEMO_TEAM: TeamMember[] = [
  {
    id: "demo-lead",
    name: "Arjun Mehta",
    title: "Super admin & portfolio lead",
    role: "Demo leadership profile",
    bio: "A fictional lead showing how the person responsible for portfolio data, publishing approvals and team coordination could be introduced.",
    photoUrl: `${ASSETS}/lead.webp`,
  },
  {
    id: "demo-operations",
    name: "Neha Rao",
    title: "Operations manager",
    role: "Demo team profile",
    bio: "A fictional operations profile for housekeeping coordination, property readiness and maintenance follow-ups.",
    photoUrl: `${ASSETS}/operations.webp`,
  },
  {
    id: "demo-guest-care",
    name: "Kabir Sethi",
    title: "Guest experience manager",
    role: "Demo team profile",
    bio: "A fictional guest-care profile for enquiry responses, arrival information and clear communication throughout a stay.",
    photoUrl: `${ASSETS}/guest-care.webp`,
  },
];

export const DEMO_WORK_IMAGE = `${ASSETS}/team-at-work.webp`;

const apartment = {
  id: "demo-city-apartment",
  name: "Sage City Apartment",
  slug: "demo-sage-city-apartment",
  area: "Sample neighbourhood",
  propertyType: "Entire apartment",
  shortDescription:
    "A fictional city apartment illustrating a considered, easy-to-manage furnished stay.",
  bedrooms: 2,
  bathrooms: 2,
  beds: 2,
  maxGuests: 4,
  isDemo: true,
  media: [
    picture(
      "city-apartment",
      "AI-generated illustration of a fictional furnished city apartment; demo property",
    ),
  ],
};
const retreat = {
  id: "demo-garden-retreat",
  name: "Courtyard Garden Retreat",
  slug: "demo-courtyard-garden-retreat",
  area: "Sample garden district",
  propertyType: "Garden apartment",
  shortDescription:
    "An imagined garden-side home showing how a quieter stay could appear in the portfolio.",
  bedrooms: 1,
  bathrooms: 1,
  beds: 1,
  maxGuests: 2,
  isDemo: true,
  media: [
    picture(
      "garden-retreat",
      "AI-generated illustration of a fictional garden apartment; demo property",
    ),
  ],
};

export const DEMO_CITIES: PortfolioCityBundle[] = [
  {
    location: {
      name: "Gurgaon",
      slug: "gurgaon",
      state: "Haryana",
      isActive: true,
    },
    properties: [apartment],
  },
  {
    location: { name: "Delhi", slug: "delhi", state: "Delhi", isActive: true },
    properties: [retreat],
  },
];

export const DEMO_CASES: PortfolioBundle["caseStudies"] = [
  {
    id: "demo-city-case",
    slug: "demo-city-home-setup",
    title: "From an empty space to a stay-ready home",
    city: "Gurgaon",
    summary:
      "Illustrative example: prepare the listing, organise property information, plan the housekeeping handover and document guest arrival details.",
    outcome:
      "Sample workflow only: listing review, readiness checklist and a clear handover. This is not a measured customer result.",
    coverUrl: `${ASSETS}/city-apartment.webp`,
    property: { slug: apartment.slug, name: apartment.name },
  },
  {
    id: "demo-garden-case",
    slug: "demo-garden-home-care",
    title: "Giving everyday care a clear routine",
    city: "Delhi",
    summary:
      "Illustrative example: a shared care plan brings guest communication, cleaning tasks and maintenance follow-ups together.",
    outcome:
      "Sample workflow only: task ownership, a property-care schedule and consistent guest information.",
    coverUrl: `${ASSETS}/garden-retreat.webp`,
    property: { slug: retreat.slug, name: retreat.name },
  },
];

export const DEMO_TESTIMONIALS: PortfolioBundle["testimonials"] = [
  {
    id: "demo-testimonial-city",
    ownerName: "Sample apartment owner",
    city: "Gurgaon",
    quote:
      "Sample feedback: I would like one place to review my property updates and know who to contact for each task.",
    mediaType: "IMAGE",
    mediaUrl: `${ASSETS}/testimonial-city.svg`,
  },
  {
    id: "demo-testimonial-garden",
    ownerName: "Sample garden-home owner",
    city: "Delhi",
    quote:
      "Sample feedback: A clear handover and simple guest communication would make day-to-day coordination easier.",
    mediaType: "IMAGE",
    mediaUrl: `${ASSETS}/testimonial-garden.svg`,
  },
  {
    id: "demo-testimonial-video",
    ownerName: "Demo video example",
    city: "Illustrative content",
    quote:
      "A playable format preview for a future owner video. This clip is not a real endorsement or customer story.",
    mediaType: "VIDEO",
    mediaUrl: `${ASSETS}/testimonial-demo.webm`,
    captionsUrl: `${ASSETS}/testimonial-demo.vtt`,
    transcript:
      "Demo video example. Your future owner story could appear here. Replace this sample with a consented owner video. This is illustrative content, not a real review.",
  },
];

export const DEMO_DETAILS: PortfolioPropertyBundle[] = DEMO_CITIES.flatMap(
  (city) =>
    city.properties.map((property) => ({
      property: {
        ...property,
        description:
          "This fictional property demonstrates the gallery, amenities and management detail layout. Its images are generated illustrations; it is not a real managed listing and cannot be booked.",
        inventoryMode: "ENTIRE_PROPERTY" as const,
        suitedFor: ["Sample city breaks", "Illustrative longer stays"],
        localHighlights: [
          {
            name: "Sample neighbourhood",
            detail:
              "Replace this placeholder with verified local information for the real property.",
          },
        ],
        houseRules: [
          "Demo property: no reservations or enquiries are accepted for this example.",
        ],
        checkInInfo:
          "Sample arrival details will be replaced with the real property's instructions.",
        checkOutInfo: "Sample departure details for layout preview only.",
        location: city.location,
        amenities: [
          { id: "demo-wifi", name: "Wi-Fi (sample)", slug: "demo-wifi" },
          {
            id: "demo-kitchen",
            name: "Kitchen (sample)",
            slug: "demo-kitchen",
          },
        ],
      },
      caseStudy:
        DEMO_CASES.find((item) => item.property?.slug === property.slug) ??
        null,
    })),
);

/** Never write demos to the database. Each populated live section takes priority. */
export function resolvePortfolioContent(
  live: PortfolioBundle | null,
  liveCities: (PortfolioCityBundle | null)[],
  liveDetails: (PortfolioPropertyBundle | null)[],
  enabled: boolean,
) {
  const demo = {
    properties: enabled && !live?.cities.length,
    cases: enabled && !live?.caseStudies.length,
    team: enabled && !live?.team.length,
    testimonials: enabled && !live?.testimonials.length,
  };
  const bundle: PortfolioBundle | null =
    !live && !enabled
      ? null
      : {
          managedCount: demo.properties ? 2 : (live?.managedCount ?? 0),
          cities: demo.properties
            ? DEMO_CITIES.map((city) => ({
                ...city.location,
                count: city.properties.length,
              }))
            : (live?.cities ?? []),
          caseStudies: demo.cases
            ? DEMO_CASES.map((item) =>
                demo.properties ? item : { ...item, property: null },
              )
            : (live?.caseStudies ?? []),
          team: demo.team ? DEMO_TEAM : (live?.team ?? []),
          testimonials: demo.testimonials
            ? DEMO_TESTIMONIALS
            : (live?.testimonials ?? []),
        };
  return {
    bundle,
    demo,
    hasDemo: Object.values(demo).some(Boolean),
    cities: demo.properties ? DEMO_CITIES : liveCities,
    details: demo.properties ? DEMO_DETAILS : liveDetails,
  };
}
