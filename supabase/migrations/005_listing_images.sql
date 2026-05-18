-- Migration 005: listing_images cache table
--
-- Purpose: avoids re-fetching the same listing image from the Etsy API on
-- every sync run. With Personal Access (5,000 QPD), every saved call counts.
--
-- TTL strategy: rows older than IMAGE_CACHE_TTL_DAYS (configured in sync route,
-- default 30 days) are treated as stale and refetched so images stay fresh if
-- a seller updates their listing photos.

CREATE TABLE IF NOT EXISTS listing_images (
  listing_id  bigint      PRIMARY KEY,
  image_url   text        NOT NULL,
  updated_at  timestamptz NOT NULL DEFAULT now()
);

-- Index so TTL cache-miss queries (WHERE updated_at < $cutoff) are fast
CREATE INDEX IF NOT EXISTS listing_images_updated_at_idx
  ON listing_images (updated_at);
