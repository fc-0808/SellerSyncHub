-- Etsy Orders: cached receipt data synced from the Etsy API.
-- Upserted on every sync run. Indexed for fast deadline-urgency queries.

CREATE TABLE IF NOT EXISTS etsy_orders (
  id                  uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  shop_id             bigint      NOT NULL REFERENCES connected_shops(shop_id) ON DELETE CASCADE,
  receipt_id          bigint      UNIQUE NOT NULL,
  receipt_state       text        NOT NULL DEFAULT 'paid',
  is_shipped          boolean     DEFAULT false,
  is_paid             boolean     DEFAULT true,
  buyer_name          text,
  total_price_cents   int         DEFAULT 0,
  currency_code       text        DEFAULT 'USD',
  item_count          int         DEFAULT 1,
  item_titles         text[]      DEFAULT '{}',
  expected_ship_date  timestamptz,
  ship_address        jsonb,
  etsy_created_at     timestamptz,
  etsy_updated_at     timestamptz,
  synced_at           timestamptz DEFAULT now(),
  created_at          timestamptz DEFAULT now()
);

ALTER TABLE etsy_orders ENABLE ROW LEVEL SECURITY;

-- Optimised for the dashboard query: open orders sorted by deadline
CREATE INDEX IF NOT EXISTS etsy_orders_shop_id_idx    ON etsy_orders(shop_id);
CREATE INDEX IF NOT EXISTS etsy_orders_receipt_id_idx ON etsy_orders(receipt_id);
CREATE INDEX IF NOT EXISTS etsy_orders_open_deadline_idx
  ON etsy_orders(expected_ship_date ASC NULLS LAST)
  WHERE is_shipped = false;
CREATE INDEX IF NOT EXISTS etsy_orders_state_shipped_idx
  ON etsy_orders(receipt_state, is_shipped);
