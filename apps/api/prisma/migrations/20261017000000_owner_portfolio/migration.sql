-- Owner portfolio (FG3). Additive only: new tables + two defaulted
-- booleans on Property. No existing statements modified.

ALTER TABLE "Property" ADD COLUMN "guestEnabled" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "Property" ADD COLUMN "portfolioEnabled" BOOLEAN NOT NULL DEFAULT true;

-- CreateTable
CREATE TABLE "TeamMember" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "title" TEXT NOT NULL DEFAULT '',
    "role" TEXT NOT NULL DEFAULT '',
    "bio" TEXT NOT NULL DEFAULT '',
    "photoUrl" TEXT NOT NULL DEFAULT '',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TeamMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PortfolioCaseStudy" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "propertyId" UUID,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "city" TEXT NOT NULL DEFAULT '',
    "summary" TEXT NOT NULL DEFAULT '',
    "outcome" TEXT NOT NULL DEFAULT '',
    "coverUrl" TEXT NOT NULL DEFAULT '',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PortfolioCaseStudy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MediaTestimonial" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "ownerName" TEXT NOT NULL,
    "city" TEXT NOT NULL DEFAULT '',
    "quote" TEXT NOT NULL DEFAULT '',
    "mediaType" TEXT NOT NULL DEFAULT 'IMAGE',
    "mediaUrl" TEXT NOT NULL DEFAULT '',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MediaTestimonial_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TeamMember_isPublished_sortOrder_idx" ON "TeamMember"("isPublished", "sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "PortfolioCaseStudy_slug_key" ON "PortfolioCaseStudy"("slug");

-- CreateIndex
CREATE INDEX "PortfolioCaseStudy_isPublished_sortOrder_idx" ON "PortfolioCaseStudy"("isPublished", "sortOrder");

-- CreateIndex
CREATE INDEX "PortfolioCaseStudy_city_idx" ON "PortfolioCaseStudy"("city");

-- CreateIndex
CREATE INDEX "MediaTestimonial_isPublished_sortOrder_idx" ON "MediaTestimonial"("isPublished", "sortOrder");

-- AddForeignKey
ALTER TABLE "PortfolioCaseStudy" ADD CONSTRAINT "PortfolioCaseStudy_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE SET NULL ON UPDATE CASCADE;