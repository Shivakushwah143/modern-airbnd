CREATE TYPE "EnquiryStatus" AS ENUM ('NEW', 'CONTACTED', 'AVAILABLE', 'NOT_AVAILABLE', 'NEGOTIATING', 'CONFIRMED', 'CLOSED', 'CANCELLED');
CREATE TYPE "ReservationSource" AS ENUM ('WHATSAPP', 'AIRBNB', 'BOOKING_COM', 'DIRECT', 'REFERRAL', 'OTHER');
CREATE TYPE "ReservationStatus" AS ENUM ('TENTATIVE', 'CONFIRMED', 'CANCELLED', 'CLOSED');
CREATE TYPE "OwnerLeadStatus" AS ENUM ('NEW', 'CONTACTED', 'QUALIFIED', 'CLOSED', 'CANCELLED');

CREATE TABLE "Guest" (
  "id" UUID NOT NULL,
  "name" TEXT NOT NULL,
  "phone" TEXT NOT NULL,
  "email" TEXT NOT NULL DEFAULT '',
  "notes" TEXT NOT NULL DEFAULT '',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Guest_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Enquiry" (
  "id" UUID NOT NULL,
  "propertyId" UUID NOT NULL,
  "guestId" UUID,
  "status" "EnquiryStatus" NOT NULL DEFAULT 'NEW',
  "checkIn" DATE NOT NULL,
  "checkOut" DATE NOT NULL,
  "adults" INTEGER NOT NULL,
  "children" INTEGER NOT NULL DEFAULT 0,
  "guestName" TEXT NOT NULL,
  "phone" TEXT NOT NULL,
  "message" TEXT NOT NULL DEFAULT '',
  "source" "ReservationSource" NOT NULL DEFAULT 'WHATSAPP',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Enquiry_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Reservation" (
  "id" UUID NOT NULL,
  "propertyId" UUID NOT NULL,
  "guestId" UUID,
  "enquiryId" UUID,
  "unitId" UUID,
  "source" "ReservationSource" NOT NULL,
  "status" "ReservationStatus" NOT NULL DEFAULT 'CONFIRMED',
  "checkIn" DATE NOT NULL,
  "checkOut" DATE NOT NULL,
  "adults" INTEGER NOT NULL,
  "children" INTEGER NOT NULL DEFAULT 0,
  "guestName" TEXT NOT NULL,
  "phone" TEXT NOT NULL,
  "notes" TEXT NOT NULL DEFAULT '',
  "availabilityBlockId" UUID,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Reservation_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "OwnerLead" (
  "id" UUID NOT NULL,
  "status" "OwnerLeadStatus" NOT NULL DEFAULT 'NEW',
  "name" TEXT NOT NULL,
  "phone" TEXT NOT NULL,
  "email" TEXT NOT NULL DEFAULT '',
  "city" TEXT NOT NULL DEFAULT '',
  "propertyType" TEXT NOT NULL DEFAULT '',
  "message" TEXT NOT NULL DEFAULT '',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "OwnerLead_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Guest_phone_key" ON "Guest"("phone");
CREATE INDEX "Guest_name_idx" ON "Guest"("name");
CREATE INDEX "Enquiry_propertyId_status_idx" ON "Enquiry"("propertyId", "status");
CREATE INDEX "Enquiry_guestId_idx" ON "Enquiry"("guestId");
CREATE INDEX "Enquiry_checkIn_checkOut_idx" ON "Enquiry"("checkIn", "checkOut");
CREATE UNIQUE INDEX "Reservation_availabilityBlockId_key" ON "Reservation"("availabilityBlockId");
CREATE INDEX "Reservation_propertyId_status_idx" ON "Reservation"("propertyId", "status");
CREATE INDEX "Reservation_guestId_idx" ON "Reservation"("guestId");
CREATE INDEX "Reservation_enquiryId_idx" ON "Reservation"("enquiryId");
CREATE INDEX "Reservation_checkIn_checkOut_idx" ON "Reservation"("checkIn", "checkOut");
CREATE INDEX "OwnerLead_status_idx" ON "OwnerLead"("status");
CREATE INDEX "OwnerLead_createdAt_idx" ON "OwnerLead"("createdAt");

ALTER TABLE "Enquiry" ADD CONSTRAINT "Enquiry_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Enquiry" ADD CONSTRAINT "Enquiry_guestId_fkey" FOREIGN KEY ("guestId") REFERENCES "Guest"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Reservation" ADD CONSTRAINT "Reservation_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Reservation" ADD CONSTRAINT "Reservation_guestId_fkey" FOREIGN KEY ("guestId") REFERENCES "Guest"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Reservation" ADD CONSTRAINT "Reservation_enquiryId_fkey" FOREIGN KEY ("enquiryId") REFERENCES "Enquiry"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Reservation" ADD CONSTRAINT "Reservation_availabilityBlockId_fkey" FOREIGN KEY ("availabilityBlockId") REFERENCES "AvailabilityBlock"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Enquiry" ADD CONSTRAINT "enquiry_positive_stay" CHECK ("checkOut" > "checkIn");
ALTER TABLE "Enquiry" ADD CONSTRAINT "enquiry_positive_guests" CHECK ("adults" > 0 AND "children" >= 0);
ALTER TABLE "Reservation" ADD CONSTRAINT "reservation_positive_stay" CHECK ("checkOut" > "checkIn");
ALTER TABLE "Reservation" ADD CONSTRAINT "reservation_positive_guests" CHECK ("adults" > 0 AND "children" >= 0);
