-- QA-019: record the visitor's consent decision (with a server-side timestamp)
-- for guest booking enquiries and owner contact leads. Additive only.

ALTER TABLE "Enquiry" ADD COLUMN "consentAccepted" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Enquiry" ADD COLUMN "consentRecordedAt" TIMESTAMP(3);

ALTER TABLE "OwnerLead" ADD COLUMN "consentAccepted" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "OwnerLead" ADD COLUMN "consentRecordedAt" TIMESTAMP(3);

-- Existing rows predate the consent workflow; they keep the default (false)
-- and no timestamps, so historical records are never retroactively marked as
-- consented.