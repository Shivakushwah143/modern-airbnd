export type Availability = {
  status: "NOT_EVALUATED" | "AVAILABLE" | "UNAVAILABLE" | "UNKNOWN";
  availableUnits?: number;
};
export interface Location {
  id: string;
  name: string;
  slug: string;
  state?: string;
  isActive?: boolean;
}
export interface Media {
  id: string;
  secureUrl: string;
  cloudinaryPublicId: string;
  altText: string;
  isCover: boolean;
  sortOrder: number;
  width: number;
  height: number;
}
export interface Amenity {
  id: string;
  name: string;
  slug: string;
}
export interface Block {
  id: string;
  startDate: string;
  endDate: string;
  reason: string;
  note: string;
}
export interface Unit {
  isEntireProperty: boolean;
  id: string;
  name: string;
  isActive: boolean;
  blocks: Block[];
}
export interface Proof {
  id: string;
  provider: string;
  url: string;
  rating: number | null;
  reviewCount: number | null;
  verifiedAt: string | null;
  isVisible: boolean;
}
export interface Property {
  guestEnabled?: boolean;
  portfolioEnabled?: boolean;
  ownerId?: string | null;
  inventoryMode: "ENTIRE_PROPERTY" | "MULTI_UNIT";
  inventoryReviewRequired: boolean;
  localHighlights: { name: string; detail: string }[];
  suitedFor: string[];
  updatedAt: string;
  id: string;
  name: string;
  slug: string;
  locationId: string;
  location: Location;
  shortDescription: string;
  description: string;
  propertyType: string;
  area: string;
  addressLine: string;
  latitude: number | null;
  longitude: number | null;
  bedrooms: number;
  bathrooms: number;
  beds: number;
  maxGuests: number;
  whatsappNumber: string;
  houseRules: string[];
  checkInInfo: string;
  checkOutInfo: string;
  propertyNotes: string;
  seoTitle: string;
  seoDescription: string;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  isDemo: boolean;
  media: Media[];
  amenities: Amenity[];
  units: Unit[];
  externalListings: Proof[];
  availability: Availability;
  whatsappUrl: string | null;
}
export interface Settings {
  id?: number;
  defaultWhatsappNumber: string;
  supportPhone: string;
  supportEmail: string;
  businessAddress: string;
  operatorName: string;
  aboutText: string;
  privacyText: string;
  termsText: string;
}
export interface PortfolioCity {
  name: string;
  slug: string;
  state: string;
  count: number;
}
export interface TeamMember {
  id: string;
  name: string;
  title: string;
  role: string;
  bio: string;
  photoUrl: string;
}
export interface Testimonial {
  id: string;
  ownerName: string;
  city: string;
  quote: string;
  mediaType: "IMAGE" | "VIDEO";
  mediaUrl: string;
}
export interface PortfolioCaseStudy {
  id: string;
  title: string;
  slug: string;
  city: string;
  summary: string;
  outcome: string;
  coverUrl: string;
  property: { slug: string; name: string } | null;
}
export interface ManagedProperty {
  id: string;
  name: string;
  slug: string;
  area: string;
  propertyType: string;
  shortDescription: string;
  bedrooms: number;
  bathrooms: number;
  beds: number;
  maxGuests: number;
  isDemo: boolean;
  media: Media[];
}
export interface PortfolioBundle {
  caseStudies: PortfolioCaseStudy[];
  team: TeamMember[];
  testimonials: Testimonial[];
  cities: PortfolioCity[];
  managedCount: number;
}
export interface PortfolioCityBundle {
  location: { name: string; slug: string; state: string; isActive: boolean };
  properties: ManagedProperty[];
}
