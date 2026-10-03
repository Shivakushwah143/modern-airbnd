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
