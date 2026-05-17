/**
 * Etsy Open API v3 client — server-side only.
 *
 * Per the official Etsy quickstart, authenticated API calls require:
 *   Authorization: Bearer {access_token}
 *   x-api-key: {keystring}:{shared_secret}   ← both parts, colon-separated
 *
 * The user_id is embedded as the first segment of the access token
 * (before the first '.'), so no separate /users/me call is needed.
 */

import type {
  EtsyListingWithImages,
  EtsyReceiptsResponse,
  EtsyShop,
  EtsyTokenResponse,
  EtsyUser,
} from "./types";

const BASE = "https://api.etsy.com/v3/application";
const TOKEN_URL = "https://api.etsy.com/v3/public/oauth/token";

function getKeystring(): string {
  const k = process.env.ETSY_API_KEYSTRING?.trim();
  if (!k) throw new Error("Missing ETSY_API_KEYSTRING environment variable");
  return k;
}

function getSharedSecret(): string {
  const s = process.env.ETSY_API_SHARED_SECRET?.trim();
  if (!s) throw new Error("Missing ETSY_API_SHARED_SECRET environment variable");
  return s;
}

/** Etsy authenticated API calls need keystring:secret in x-api-key */
function getApiKeyHeader(): string {
  return `${getKeystring()}:${getSharedSecret()}`;
}

async function etsyGet<T>(path: string, accessToken: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "x-api-key": getApiKeyHeader(),
      Accept: "application/json",
    },
    cache: "no-store",
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new EtsyApiError(res.status, body);
  }

  return res.json() as Promise<T>;
}

export class EtsyApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly body: string
  ) {
    super(`Etsy API ${status}: ${body.slice(0, 200)}`);
    this.name = "EtsyApiError";
  }
  get isUnauthorized() { return this.status === 401; }
}

/**
 * Extract the user_id embedded in the Etsy access token prefix.
 * Per Etsy docs: "An Etsy access token includes your shop/user ID
 * as a token prefix" — split on '.' and take the first segment.
 */
export function getUserIdFromToken(accessToken: string): number {
  const prefix = accessToken.split(".")[0];
  const id = parseInt(prefix, 10);
  if (isNaN(id)) throw new Error(`Cannot parse user_id from token prefix: "${prefix}"`);
  return id;
}

/** Get the currently authenticated Etsy user by user_id */
export async function getUser(userId: number, accessToken: string): Promise<EtsyUser> {
  return etsyGet<EtsyUser>(`/users/${userId}`, accessToken);
}

/** Get the shop owned by a given user_id (requires shops_r scope) */
export async function getUserShop(userId: number, accessToken: string): Promise<EtsyShop> {
  return etsyGet<EtsyShop>(`/users/${userId}/shops`, accessToken);
}

/** Get a shop by shop_id */
export async function getShop(shopId: number, accessToken: string): Promise<EtsyShop> {
  return etsyGet<EtsyShop>(`/shops/${shopId}`, accessToken);
}

/**
 * Get open (paid, not yet shipped) receipts for a shop.
 * Etsy max limit is 100 per page.
 *
 * We pass min_created = 60 days ago so we only pull recent orders.
 * Orders older than that which Etsy still considers "unshipped" are
 * almost certainly orders the seller shipped without updating Etsy —
 * they shouldn't show up as urgent in the dashboard.
 */
export async function getOpenReceipts(
  shopId: number,
  accessToken: string,
  limit = 100,
  offset = 0,
  windowDays = 60
): Promise<EtsyReceiptsResponse> {
  const minCreated = Math.floor(
    (Date.now() - windowDays * 24 * 60 * 60 * 1000) / 1000
  );
  const params = new URLSearchParams({
    was_paid: "true",
    was_shipped: "false",
    min_created: String(minCreated),
    limit: String(Math.min(limit, 100)),
    offset: String(offset),
    sort_on: "created",
    sort_order: "desc",
  });
  return etsyGet<EtsyReceiptsResponse>(
    `/shops/${shopId}/receipts?${params}`,
    accessToken
  );
}

/**
 * Batch-fetch listing images for up to 100 listing IDs in a single request.
 * Returns a Map of listing_id → primary image URL (url_170x135 preferred).
 *
 * Etsy v3 receipt transactions only carry listing_id, not the image URLs —
 * this separate call is required to display product thumbnails.
 */
export async function getListingImageMap(
  listingIds: number[],
  accessToken: string
): Promise<Map<number, string>> {
  const imageMap = new Map<number, string>();
  if (listingIds.length === 0) return imageMap;

  // Etsy allows at most 100 IDs per batch request
  const batches: number[][] = [];
  for (let i = 0; i < listingIds.length; i += 100) {
    batches.push(listingIds.slice(i, i + 100));
  }

  for (const batch of batches) {
    const params = new URLSearchParams({ includes: "Images" });
    batch.forEach((id) => params.append("listing_ids", String(id)));

    try {
      const res = await etsyGet<{ count: number; results: EtsyListingWithImages[] }>(
        `/listings/batch?${params}`,
        accessToken
      );
      for (const listing of res.results ?? []) {
        const img = listing.images?.[0];
        if (img) {
          imageMap.set(
            listing.listing_id,
            img.url_170x135 ?? img.url_75x75 ?? img.url_570xN
          );
        }
      }
    } catch {
      // Non-fatal: missing images are handled by the placeholder UI
    }
  }

  return imageMap;
}

/**
 * Refresh an expired access token using the refresh_token.
 * Etsy access tokens expire after 3600 seconds (1 hour).
 */
export async function refreshAccessToken(
  refreshToken: string
): Promise<EtsyTokenResponse> {
  const body = new URLSearchParams({
    grant_type: "refresh_token",
    client_id: getKeystring(),
    refresh_token: refreshToken,
  });

  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Token refresh failed ${res.status}: ${text}`);
  }

  return res.json() as Promise<EtsyTokenResponse>;
}

/**
 * Compute the earliest expected_ship_date from a receipt's transactions.
 * Falls back to creation time + max_processing_days if no explicit date.
 */
export function computeShipDate(receipt: {
  transactions: { expected_ship_date: number | null; max_processing_days: number | null }[];
  create_timestamp: number;
}): Date | null {
  for (const t of receipt.transactions) {
    if (t.expected_ship_date) {
      return new Date(t.expected_ship_date * 1000);
    }
  }
  const maxDays = receipt.transactions.reduce(
    (max, t) => Math.max(max, t.max_processing_days ?? 3),
    1
  );
  const created = new Date(receipt.create_timestamp * 1000);
  created.setDate(created.getDate() + maxDays);
  return created;
}
