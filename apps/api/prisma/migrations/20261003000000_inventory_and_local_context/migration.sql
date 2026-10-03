CREATE TYPE "InventoryMode" AS ENUM ('ENTIRE_PROPERTY','MULTI_UNIT');
ALTER TABLE "Property" ADD COLUMN "inventoryMode" "InventoryMode" NOT NULL DEFAULT 'ENTIRE_PROPERTY', ADD COLUMN "inventoryReviewRequired" BOOLEAN NOT NULL DEFAULT false, ADD COLUMN "localHighlights" JSONB NOT NULL DEFAULT '[]', ADD COLUMN "suitedFor" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "Unit" ADD COLUMN "isEntireProperty" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "AvailabilityBlock" ADD COLUMN "sourceBlockId" TEXT;
CREATE UNIQUE INDEX "AvailabilityBlock_unitId_sourceBlockId_key" ON "AvailabilityBlock"("unitId","sourceBlockId");
-- Ambiguous existing setups are kept intact, but removed from public discovery until reviewed.
UPDATE "Property" p SET "inventoryMode"='MULTI_UNIT', "inventoryReviewRequired"=true, "status"=CASE WHEN p.status='PUBLISHED' THEN 'DRAFT'::"PropertyStatus" ELSE p.status END WHERE (SELECT count(*) FROM "Unit" u WHERE u."propertyId"=p.id)>1;
-- A sole existing unit represents the entire property. In mixed records identify only the original default unit.
UPDATE "Unit" u SET "isEntireProperty"=true WHERE (SELECT count(*) FROM "Unit" x WHERE x."propertyId"=u."propertyId")=1 OR (u.name='Entire Property' AND u.id=(SELECT x.id FROM "Unit" x WHERE x."propertyId"=u."propertyId" AND x.name='Entire Property' ORDER BY x."createdAt",x.id LIMIT 1));
UPDATE "Unit" u SET "isActive"=false FROM "Property" p WHERE p.id=u."propertyId" AND p."inventoryMode"='MULTI_UNIT' AND u."isEntireProperty";
-- Missing inventory is not published or guessed.
UPDATE "Property" p SET "inventoryReviewRequired"=true, "status"=CASE WHEN p.status='PUBLISHED' THEN 'DRAFT'::"PropertyStatus" ELSE p.status END WHERE NOT EXISTS(SELECT 1 FROM "Unit" u WHERE u."propertyId"=p.id AND u."isActive");
CREATE UNIQUE INDEX "one_entire_unit" ON "Unit"("propertyId") WHERE "isEntireProperty"=true;
