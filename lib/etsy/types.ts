/** Minimal Etsy Open API v3 types — shaped to what the OMS actually needs. */

export interface EtsyMoney {
  amount: number;
  divisor: number;
  currency_code: string;
}

/**
 * Buyer-selected variation on a receipt transaction.
 * Etsy v3 stores these inside product_data.property_values —
 * there is no top-level selected_variations field in the receipts API.
 */
export interface ListingPropertyValue {
  property_id: number;
  property_name: string;   // e.g. "iPhone Model"
  scale_id: number | null;
  scale_name: string | null;
  value_ids: number[];
  values: string[];        // e.g. ["iPhone 16"]
}

export interface ListingInventoryProduct {
  product_id: number | null;
  sku: string | null;
  is_deleted: boolean;
  /** The buyer-selected variation values for this transaction */
  property_values: ListingPropertyValue[];
}

export interface ListingImage {
  listing_image_id: number;
  url_75x75: string;
  url_170x135: string;
  url_570xN: string;
  url_fullxfull: string;
}

export interface EtsyTransaction {
  transaction_id: number;
  title: string;
  quantity: number;
  listing_id: number | null;
  min_processing_days: number | null;
  max_processing_days: number | null;
  /** Unix timestamp (seconds). The deadline Etsy has calculated for this item. */
  expected_ship_date: number | null;
  /**
   * Buyer-selected variations — accessed via product_data.property_values.
   * (Etsy v3 receipt transactions do NOT have a top-level selected_variations field.)
   */
  product_data: ListingInventoryProduct | null;
}

/** Response from GET /v3/application/listings/batch?includes=Images */
export interface EtsyListingWithImages {
  listing_id: number;
  images: ListingImage[];
}

export interface EtsyReceipt {
  receipt_id: number;
  receipt_state: "paid" | "completed" | "canceled" | "refunded" | null;
  buyer_user_id: number;
  /** Buyer's name from the shipping address */
  name: string;
  /** Shipping address fields */
  first_line: string | null;
  second_line: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  country_iso: string | null;
  formatted_address: string | null;
  is_shipped: boolean;
  is_paid: boolean;
  total_price: EtsyMoney;
  grandtotal: EtsyMoney;
  /** Message the buyer left at checkout */
  message_from_buyer: string | null;
  /** Seller's private note on this order */
  message_from_seller: string | null;
  /** Unix timestamps (seconds) */
  create_timestamp: number;
  created_timestamp: number;
  update_timestamp: number;
  updated_timestamp: number;
  transactions: EtsyTransaction[];
}

export interface EtsyReceiptsResponse {
  count: number;
  results: EtsyReceipt[];
}

export interface EtsyShop {
  shop_id: number;
  shop_name: string;
  title: string;
  listing_active_count: number;
  icon_url_fullxfull: string | null;
}

export interface EtsyUser {
  user_id: number;
  login_name: string;
  primary_email: string;
}

export interface EtsyTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token: string;
}

/** Urgency level derived from the expected ship date */
export type UrgencyLevel = "overdue" | "critical" | "warning" | "ok" | "shipped";

/** A single product line stored in transactions_json */
export interface StoredTransaction {
  transaction_id: number;
  listing_id: number | null;
  title: string;
  quantity: number;
  image_url: string | null;
  variations: { name: string; value: string }[];
}

/** Computed order row used by the dashboard */
export interface OrderRow {
  receipt_id: number;
  shop_id: number;
  shop_name: string;
  shop_icon_url: string | null;
  buyer_name: string | null;
  ship_address: {
    first_line: string | null;
    second_line: string | null;
    city: string | null;
    state: string | null;
    zip: string | null;
    country_iso: string | null;
    formatted: string | null;
  } | null;
  ship_country_iso: string | null;
  buyer_message: string | null;
  seller_note: string | null;
  item_count: number;
  item_titles: string[];
  transactions: StoredTransaction[];
  expected_ship_date: string | null;
  etsy_created_at: string | null;
  is_shipped: boolean;
  receipt_state: string;
}
