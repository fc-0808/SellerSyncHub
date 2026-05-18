/**
 * Etsy Open API v3 client — server-side only.
 *
 * Rate-limit budget (Personal Access / Unapproved tier):
 *   - 5 Queries Per Second  (QPS)
 *   - 5,000 Queries Per Day (QPD)
 *
 * All outbound calls go through etsyGet / etsyPost which enforce:
 *   1. Automatic retry with exponential back-off on HTTP 429.
 *   2. A Retry-After header is respected when present.
 *
 * getListingImageMap is sequential (not parallel) with a 250 ms inter-call
 * delay, giving a maximum of 4 req/s — safely under the 5 QPS ceiling.
 */

import type {
  EtsyListingWithImages,
  EtsyReceiptsResponse,
  EtsyShop,
  EtsyTokenResponse,
  EtsyUser,
  ListingImage,
} from "./types";

/* ─────────────────────────── constants ──────────────────────── */

const BASE      = "https://api.etsy.com/v3/application";
const TOKEN_URL = "https://api.etsy.com/v3/public/oauth/token";

/** Milliseconds to wait between sequential image-fetch calls (4 req/s max). */
const IMAGE_FETCH_INTERVAL_MS = 250;

/** Maximum number of automatic retries on HTTP 429 before giving up. */
const MAX_429_RETRIES = 3;

/** Base back-off delay for the first retry (doubles on each subsequent attempt). */
const BASE_BACKOFF_MS = 1_000;

/* ─────────────────────────── utilities ──────────────────────── */

/** Simple promise-based delay. */
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

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

/* ─────────────────────────── error class ────────────────────── */

export class EtsyApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly body: string
  ) {
    super(`Etsy API ${status}: ${body.slice(0, 200)}`);
    this.name = "EtsyApiError";
  }
  get isUnauthorized()  { return this.status === 401; }
  get isRateLimited()   { return this.status === 429; }
}

/* ─────────────────────────── base fetch ─────────────────────── */

/**
 * Authenticated GET with automatic retry on HTTP 429.
 *
 * Retry schedule (attempt 0 = first try):
 *   attempt 1 → wait 1 s  (or Retry-After if header is present)
 *   attempt 2 → wait 2 s
 *   attempt 3 → wait 4 s
 *   attempt 4 → throw EtsyApiError(429)
 */
async function etsyGet<T>(
  path: string,
  accessToken: string,
  attempt = 0
): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "x-api-key": getApiKeyHeader(),
      Accept: "application/json",
    },
    cache: "no-store",
  });

  if (res.status === 429) {
    if (attempt >= MAX_429_RETRIES) {
      const body = await res.text().catch(() => "");
      throw new EtsyApiError(429, body);
    }

    // Respect the Retry-After header (seconds) when provided; otherwise
    // use exponential back-off: 1 s → 2 s → 4 s
    const retryAfterSec = parseInt(res.headers.get("Retry-After") ?? "0", 10);
    const backoffMs = retryAfterSec > 0
      ? retryAfterSec * 1_000
      : BASE_BACKOFF_MS * Math.pow(2, attempt);

    console.warn(
      `[etsy-api] 429 on ${path} — waiting ${backoffMs}ms before retry ` +
      `(attempt ${attempt + 1}/${MAX_429_RETRIES})`
    );
    await delay(backoffMs);
    return etsyGet<T>(path, accessToken, attempt + 1);
  }

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new EtsyApiError(res.status, body);
  }

  return res.json() as Promise<T>;
}

/**
 * Authenticated POST.
 * A single retry is attempted on 429 (user-triggered actions like creating a
 * shipment are low-frequency so one retry is sufficient).
 */
async function etsyPost<T>(
  path: string,
  accessToken: string,
  payload: Record<string, unknown>,
  attempt = 0
): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "x-api-key": getApiKeyHeader(),
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(payload),
    cache: "no-store",
  });

  if (res.status === 429 && attempt < 1) {
    const retryAfterSec = parseInt(res.headers.get("Retry-After") ?? "0", 10);
    const backoffMs = retryAfterSec > 0 ? retryAfterSec * 1_000 : BASE_BACKOFF_MS;
    console.warn(`[etsy-api] 429 on POST ${path} — waiting ${backoffMs}ms before retry`);
    await delay(backoffMs);
    return etsyPost<T>(path, accessToken, payload, 1);
  }

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new EtsyApiError(res.status, body);
  }

  return res.json() as Promise<T>;
}

/* ─────────────────────────── public API ─────────────────────── */

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

export async function getUser(userId: number, accessToken: string): Promise<EtsyUser> {
  return etsyGet<EtsyUser>(`/users/${userId}`, accessToken);
}

export async function getUserShop(userId: number, accessToken: string): Promise<EtsyShop> {
  return etsyGet<EtsyShop>(`/users/${userId}/shops`, accessToken);
}

export async function getShop(shopId: number, accessToken: string): Promise<EtsyShop> {
  return etsyGet<EtsyShop>(`/shops/${shopId}`, accessToken);
}

/**
 * Get open (paid, not yet shipped) receipts for a shop.
 * Etsy max page size is 100.
 *
 * windowDays: only fetch receipts created within this many days. Older
 * receipts are operationally irrelevant for the OMS dashboard.
 */
export async function getOpenReceipts(
  shopId: number,
  accessToken: string,
  limit = 100,
  offset = 0,
  windowDays = 30
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
 * Fetch images for a list of listing IDs from the Etsy API.
 *
 * Calls are made SEQUENTIALLY with a IMAGE_FETCH_INTERVAL_MS delay between
 * each one. This is intentional: parallel Promise.all would fire all requests
 * simultaneously and instantly saturate the 5 QPS limit.
 *
 * Callers should pass only the listing IDs that are NOT already cached in
 * Supabase — see getCachedImageMap in the sync route.
 *
 * Returns a Map<listing_id, primary_image_url>.
 */
export async function getListingImageMap(
  listingIds: number[],
  accessToken: string
): Promise<Map<number, string>> {
  const imageMap = new Map<number, string>();
  if (listingIds.length === 0) return imageMap;

  console.log(`[etsy-api] fetching ${listingIds.length} listing image(s) sequentially`);

  for (const listingId of listingIds) {
    try {
      const res = await etsyGet<{ count: number; results: ListingImage[] }>(
        `/listings/${listingId}/images`,
        accessToken
      );
      const first = (res.results ?? [])[0];
      if (first) {
        const url = first.url_170x135 ?? first.url_75x75 ?? first.url_570xN;
        imageMap.set(listingId, url);
      } else {
        console.warn(`[etsy-api] listing ${listingId}: no images returned`);
      }
    } catch (e) {
      // Log and continue — a missing image falls back to the placeholder UI.
      // If the error is a 429 that survived all retries, it will be an
      // EtsyApiError with status 429; the caller can check for this.
      console.error(
        `[etsy-api] image fetch failed for listing ${listingId}:`,
        e instanceof Error ? e.message : String(e)
      );

      if (e instanceof EtsyApiError && e.isRateLimited) {
        // Rate-limited even after retries — abort the entire loop to protect
        // the remaining daily quota. Cached images will still be available.
        console.error("[etsy-api] 429 persisted after all retries — aborting image fetch loop");
        break;
      }
    }

    // Throttle: pause between each call to stay under 5 QPS
    await delay(IMAGE_FETCH_INTERVAL_MS);
  }

  console.log(`[etsy-api] image map built: ${imageMap.size}/${listingIds.length} fetched`);
  return imageMap;
}

/**
 * Refresh an expired Etsy access token using the stored refresh_token.
 * Etsy access tokens expire after 3,600 seconds (1 hour).
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
 * Add a tracking number to a receipt on Etsy (marks it as shipped).
 * Requires the `transactions_w` OAuth scope on the access token.
 * Callers should catch EtsyApiError(401) and fall back to local-only marking
 * if the connected token predates the transactions_w scope addition.
 */
export async function createEtsyShipment(
  shopId: number,
  receiptId: number,
  accessToken: string,
  trackingCode: string,
  carrierName = "other"
): Promise<void> {
  await etsyPost(
    `/shops/${shopId}/receipts/${receiptId}/tracking`,
    accessToken,
    {
      carrier_name: carrierName.toLowerCase(),
      tracking_code: trackingCode,
      send_bcc: false,
    }
  );
}

/**
 * Compute the earliest expected_ship_date from a receipt's transactions.
 * Falls back to creation_timestamp + max_processing_days if no explicit date.
 */
export function computeShipDate(receipt: {
  transactions: { expected_ship_date: number | null; max_processing_days: number | null }[];
  create_timestamp: number;
}): Date | null {
  for (const t of receipt.transactions) {
    if (t.expected_ship_date) return new Date(t.expected_ship_date * 1000);
  }
  const maxDays = receipt.transactions.reduce(
    (max, t) => Math.max(max, t.max_processing_days ?? 3),
    1
  );
  const created = new Date(receipt.create_timestamp * 1000);
  created.setDate(created.getDate() + maxDays);
  return created;
}
