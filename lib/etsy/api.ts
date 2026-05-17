/**
 * Etsy Open API v3 client — server-side only.
 * Uses Authorization: Bearer {access_token} + x-api-key: {keystring}.
 * The shared secret is only used in the OAuth token exchange, not here.
 */

import type {
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

async function etsyGet<T>(path: string, accessToken: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "x-api-key": getKeystring(),
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

/** Get the currently authenticated Etsy user */
export async function getMe(accessToken: string): Promise<EtsyUser> {
  return etsyGet<EtsyUser>("/users/me", accessToken);
}

/** Get the shop owned by a given user_id */
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
 */
export async function getOpenReceipts(
  shopId: number,
  accessToken: string,
  limit = 100,
  offset = 0
): Promise<EtsyReceiptsResponse> {
  const params = new URLSearchParams({
    was_paid: "true",
    was_shipped: "false",
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
  // Fallback: creation + max processing days
  const maxDays = receipt.transactions.reduce(
    (max, t) => Math.max(max, t.max_processing_days ?? 3),
    1
  );
  const created = new Date(receipt.create_timestamp * 1000);
  created.setDate(created.getDate() + maxDays);
  return created;
}
