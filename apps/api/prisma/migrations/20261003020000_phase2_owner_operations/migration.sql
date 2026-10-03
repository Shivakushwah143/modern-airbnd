CREATE TYPE "StayStatus" AS ENUM ('RESERVED', 'CHECKED_IN', 'CHECKED_OUT', 'NO_SHOW');
CREATE TYPE "HousekeepingStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'DONE', 'CANCELLED');
CREATE TYPE "MaintenancePriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');
CREATE TYPE "MaintenanceStatus" AS ENUM ('OPEN', 'IN_PROGRESS', 'RESOLVED', 'CANCELLED');

CREATE TABLE "Owner" (
  "id" UUID NOT NULL,
  "name" TEXT NOT NULL,
  "phone" TEXT NOT NULL,
  "email" TEXT NOT NULL DEFAULT '',
  "notes" TEXT NOT NULL DEFAULT '',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Owner_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "HousekeepingTask" (
  "id" UUID NOT NULL,
  "propertyId" UUID NOT NULL,
  "reservationId" UUID,
  "assigneeName" TEXT NOT NULL DEFAULT '',
  "dueDate" DATE NOT NULL,
  "status" "HousekeepingStatus" NOT NULL DEFAULT 'PENDING',
  "notes" TEXT NOT NULL DEFAULT '',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "HousekeepingTask_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "MaintenanceIssue" (
  "id" UUID NOT NULL,
  "propertyId" UUID NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT NOT NULL DEFAULT '',
  "priority" "MaintenancePriority" NOT NULL DEFAULT 'MEDIUM',
  "assigneeName" TEXT NOT NULL DEFAULT '',
  "status" "MaintenanceStatus" NOT NULL DEFAULT 'OPEN',
  "cost" DECIMAL(12,2),
  "notes" TEXT NOT NULL DEFAULT '',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "MaintenanceIssue_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "Property" ADD COLUMN "ownerId" UUID;
ALTER TABLE "Reservation" ADD COLUMN "stayStatus" "StayStatus" NOT NULL DEFAULT 'RESERVED';
ALTER TABLE "Reservation" ADD COLUMN "operationalNotes" TEXT NOT NULL DEFAULT '';
ALTER TABLE "Reservation" ADD COLUMN "checkedInAt" TIMESTAMP(3);
ALTER TABLE "Reservation" ADD COLUMN "checkedOutAt" TIMESTAMP(3);

CREATE INDEX "Owner_name_idx" ON "Owner"("name");
CREATE INDEX "Owner_phone_idx" ON "Owner"("phone");
CREATE INDEX "Property_ownerId_idx" ON "Property"("ownerId");
CREATE INDEX "HousekeepingTask_propertyId_status_idx" ON "HousekeepingTask"("propertyId", "status");
CREATE INDEX "HousekeepingTask_reservationId_idx" ON "HousekeepingTask"("reservationId");
CREATE INDEX "HousekeepingTask_dueDate_status_idx" ON "HousekeepingTask"("dueDate", "status");
CREATE INDEX "MaintenanceIssue_propertyId_status_idx" ON "MaintenanceIssue"("propertyId", "status");
CREATE INDEX "MaintenanceIssue_priority_status_idx" ON "MaintenanceIssue"("priority", "status");

ALTER TABLE "Property" ADD CONSTRAINT "Property_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "Owner"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "HousekeepingTask" ADD CONSTRAINT "HousekeepingTask_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "HousekeepingTask" ADD CONSTRAINT "HousekeepingTask_reservationId_fkey" FOREIGN KEY ("reservationId") REFERENCES "Reservation"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "MaintenanceIssue" ADD CONSTRAINT "MaintenanceIssue_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
