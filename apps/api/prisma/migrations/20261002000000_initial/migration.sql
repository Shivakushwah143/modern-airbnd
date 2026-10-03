-- CreateEnum
CREATE TYPE "PropertyStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "BlockReason" AS ENUM ('BOOKED', 'MAINTENANCE', 'OWNER_BLOCKED', 'OTHER');

-- CreateTable
CREATE TABLE "Location" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "state" TEXT NOT NULL DEFAULT '',
    "country" TEXT NOT NULL DEFAULT 'India',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Location_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Property" (
    "id" UUID NOT NULL,
    "locationId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "shortDescription" TEXT NOT NULL DEFAULT '',
    "description" TEXT NOT NULL DEFAULT '',
    "propertyType" TEXT NOT NULL DEFAULT 'Entire apartment',
    "area" TEXT NOT NULL DEFAULT '',
    "addressLine" TEXT NOT NULL DEFAULT '',
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "bedrooms" INTEGER NOT NULL DEFAULT 1,
    "bathrooms" INTEGER NOT NULL DEFAULT 1,
    "beds" INTEGER NOT NULL DEFAULT 1,
    "maxGuests" INTEGER NOT NULL DEFAULT 2,
    "whatsappNumber" TEXT NOT NULL DEFAULT '',
    "houseRules" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "checkInInfo" TEXT NOT NULL DEFAULT '',
    "checkOutInfo" TEXT NOT NULL DEFAULT '',
    "propertyNotes" TEXT NOT NULL DEFAULT '',
    "seoTitle" TEXT NOT NULL DEFAULT '',
    "seoDescription" TEXT NOT NULL DEFAULT '',
    "status" "PropertyStatus" NOT NULL DEFAULT 'DRAFT',
    "isDemo" BOOLEAN NOT NULL DEFAULT false,
    "publishedAt" TIMESTAMP(3),
    "archivedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Property_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Unit" (
    "id" UUID NOT NULL,
    "propertyId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Unit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AvailabilityBlock" (
    "id" UUID NOT NULL,
    "unitId" UUID NOT NULL,
    "startDate" DATE NOT NULL,
    "endDate" DATE NOT NULL,
    "reason" "BlockReason" NOT NULL DEFAULT 'OWNER_BLOCKED',
    "note" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AvailabilityBlock_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PropertyMedia" (
    "id" UUID NOT NULL,
    "propertyId" UUID NOT NULL,
    "cloudinaryPublicId" TEXT NOT NULL,
    "secureUrl" TEXT NOT NULL,
    "format" TEXT NOT NULL,
    "width" INTEGER NOT NULL,
    "height" INTEGER NOT NULL,
    "bytes" INTEGER NOT NULL,
    "altText" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isCover" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PropertyMedia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Amenity" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,

    CONSTRAINT "Amenity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExternalListing" (
    "id" UUID NOT NULL,
    "propertyId" UUID NOT NULL,
    "provider" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "rating" DOUBLE PRECISION,
    "reviewCount" INTEGER,
    "verifiedAt" TIMESTAMP(3),
    "isVisible" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "ExternalListing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SiteSettings" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "defaultWhatsappNumber" TEXT NOT NULL DEFAULT '',
    "supportPhone" TEXT NOT NULL DEFAULT '',
    "supportEmail" TEXT NOT NULL DEFAULT '',
    "businessAddress" TEXT NOT NULL DEFAULT '',
    "operatorName" TEXT NOT NULL DEFAULT '',
    "aboutText" TEXT NOT NULL DEFAULT '',
    "privacyText" TEXT NOT NULL DEFAULT '',
    "termsText" TEXT NOT NULL DEFAULT '',

    CONSTRAINT "SiteSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_AmenityToProperty" (
    "A" UUID NOT NULL,
    "B" UUID NOT NULL,

    CONSTRAINT "_AmenityToProperty_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "Location_slug_key" ON "Location"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Property_slug_key" ON "Property"("slug");

-- CreateIndex
CREATE INDEX "Property_locationId_status_idx" ON "Property"("locationId", "status");

-- CreateIndex
CREATE INDEX "Unit_propertyId_idx" ON "Unit"("propertyId");

-- CreateIndex
CREATE INDEX "AvailabilityBlock_unitId_startDate_idx" ON "AvailabilityBlock"("unitId", "startDate");

-- CreateIndex
CREATE INDEX "AvailabilityBlock_unitId_endDate_idx" ON "AvailabilityBlock"("unitId", "endDate");

-- CreateIndex
CREATE UNIQUE INDEX "PropertyMedia_cloudinaryPublicId_key" ON "PropertyMedia"("cloudinaryPublicId");

-- CreateIndex
CREATE INDEX "PropertyMedia_propertyId_idx" ON "PropertyMedia"("propertyId");

-- CreateIndex
CREATE UNIQUE INDEX "Amenity_slug_key" ON "Amenity"("slug");

-- CreateIndex
CREATE INDEX "ExternalListing_propertyId_idx" ON "ExternalListing"("propertyId");

-- CreateIndex
CREATE INDEX "_AmenityToProperty_B_index" ON "_AmenityToProperty"("B");

-- AddForeignKey
ALTER TABLE "Property" ADD CONSTRAINT "Property_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Unit" ADD CONSTRAINT "Unit_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AvailabilityBlock" ADD CONSTRAINT "AvailabilityBlock_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "Unit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PropertyMedia" ADD CONSTRAINT "PropertyMedia_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExternalListing" ADD CONSTRAINT "ExternalListing_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AmenityToProperty" ADD CONSTRAINT "_AmenityToProperty_A_fkey" FOREIGN KEY ("A") REFERENCES "Amenity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AmenityToProperty" ADD CONSTRAINT "_AmenityToProperty_B_fkey" FOREIGN KEY ("B") REFERENCES "Property"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Database-level business invariants.
ALTER TABLE "AvailabilityBlock" ADD CONSTRAINT "positive_stay" CHECK ("endDate" > "startDate");
ALTER TABLE "Property" ADD CONSTRAINT "positive_capacity" CHECK ("maxGuests" > 0 AND "bedrooms" >= 0 AND "bathrooms" >= 0 AND "beds" >= 0);
CREATE UNIQUE INDEX "one_cover_per_property" ON "PropertyMedia" ("propertyId") WHERE "isCover" = true;
CREATE TABLE "admin_session" ("sid" varchar NOT NULL PRIMARY KEY, "sess" json NOT NULL, "expire" timestamp(6) NOT NULL);
CREATE INDEX "admin_session_expire" ON "admin_session" ("expire");
