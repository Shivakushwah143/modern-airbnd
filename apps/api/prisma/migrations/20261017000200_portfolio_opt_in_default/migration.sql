-- QA-002: new Property rows must opt in to the owner portfolio.
-- The original 20261017000000_owner_portfolio migration set DEFAULT true and
-- may already be applied, so it is left untouched. This additive statement
-- changes only the column DEFAULT for FUTURE rows. Existing rows are
-- intentionally NOT modified: legacy opt-in review (any real portfolio
-- listings that should be opted out) is a human data step, never a silent
-- mass disable. Demo records are excluded from all public managed
-- counts/lists at query level (QA-001).

ALTER TABLE "Property" ALTER COLUMN "portfolioEnabled" SET DEFAULT false;