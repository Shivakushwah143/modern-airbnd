-- QA-004: auditable owner consent for published media testimonials.
-- Additive columns only; no existing statements modified.

ALTER TABLE "MediaTestimonial" ADD COLUMN "consentConfirmed" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "MediaTestimonial" ADD COLUMN "consentRecordedAt" TIMESTAMP(3);
ALTER TABLE "MediaTestimonial" ADD COLUMN "consentSource" TEXT NOT NULL DEFAULT '';

-- Existing content is never auto-published. Any testimonial currently public
-- without a recorded owner consent (or without its attached media) returns to
-- draft for human review — a privacy-preserving data step. No rows are
-- deleted, reset or seeded.
UPDATE "MediaTestimonial"
SET "isPublished" = false
WHERE "consentConfirmed" = false OR btrim("mediaUrl") = '';