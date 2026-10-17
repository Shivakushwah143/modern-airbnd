-- QA-017: media testimonials gain optional captions (WebVTT track) and a
-- transcript field so owner videos are accessible. Additive only; existing
-- rows default to empty (no captions supplied yet — business supplies real
-- media and captions).

ALTER TABLE "MediaTestimonial" ADD COLUMN "captionsUrl" TEXT NOT NULL DEFAULT '';
ALTER TABLE "MediaTestimonial" ADD COLUMN "transcript" TEXT NOT NULL DEFAULT '';