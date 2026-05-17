-- Connected Shops: stores OAuth tokens and shop metadata per connected Etsy shop.
-- One row per shop. Access tokens are server-side only (service_role key required).

CREATE TABLE IF NOT EXISTS connected_shops (
  id                   uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  shop_id              bigint      UNIQUE NOT NULL,
  shop_name            text        NOT NULL,
  shop_title           text,
  shop_icon_url        text,
  listing_active_count int         DEFAULT 0,
  access_token         text        NOT NULL,
  refresh_token        text,
  connected_at         timestamptz DEFAULT now(),
  last_synced_at       timestamptz,
  is_active            boolean     DEFAULT true
);

-- Service-role only — no public read/write
ALTER TABLE connected_shops ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS connected_shops_shop_id_idx  ON connected_shops(shop_id);
CREATE INDEX IF NOT EXISTS connected_shops_active_idx   ON connected_shops(is_active);
