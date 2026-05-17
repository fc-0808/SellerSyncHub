import {
  codeChallengeS256,
  generateCodeVerifier,
  generateOAuthState,
} from "@/lib/oauth/etsy-pkce";

const ETSY_AUTHORIZE = "https://www.etsy.com/oauth/connect";
const ETSY_TOKEN = "https://api.etsy.com/v3/public/oauth/token";

/**
 * Default scopes for OMS — minimum needed per Etsy API Terms §5 item 17.
 *
 * IMPORTANT — commercial-access requirement #7:
 *   If your app uses `transactions_r`, you must request access to the `buyer_email`
 *   field SEPARATELY from Etsy (approved case by case).
 *   Until that approval is granted, do NOT read buyer_email from receipt responses.
 *   Contact developer@etsy.com or use the commercial-access request form.
 *
 * Scopes used:
 *   shops_r        — read shop description/sections (non-public)
 *   transactions_r — read receipts, shipping addresses (required for OMS)
 *   listings_r     — read inactive/expired listings for order context
 */
const DEFAULT_SCOPES = ["shops_r", "transactions_r", "listings_r"];

function getKeystring(): string {
  const v = process.env.ETSY_API_KEYSTRING?.trim();
  if (!v) throw new Error("Missing ETSY_API_KEYSTRING");
  return v;
}

function getSharedSecret(): string {
  const v = process.env.ETSY_API_SHARED_SECRET?.trim();
  if (!v) throw new Error("Missing ETSY_API_SHARED_SECRET");
  return v;
}

function getRedirectUri(requestOrigin: string): string {
  const explicit = process.env.ETSY_OAUTH_REDIRECT_URI?.trim();
  if (explicit) return explicit;
  return `${requestOrigin}/api/oauth/callback`;
}

function getScopes(): string[] {
  const raw = process.env.ETSY_OAUTH_SCOPES?.trim();
  if (!raw) return DEFAULT_SCOPES;
  return raw.split(/\s+/).filter(Boolean);
}

export function buildEtsyAuthorizeRedirectUrl(requestOrigin: string): {
  url: string;
  state: string;
  codeVerifier: string;
  redirectUri: string;
} {
  const keystring = getKeystring();
  const redirectUri = getRedirectUri(requestOrigin);
  const state = generateOAuthState();
  const codeVerifier = generateCodeVerifier();
  const codeChallenge = codeChallengeS256(codeVerifier);
  const scope = getScopes().join(" ");

  const params = new URLSearchParams({
    response_type: "code",
    client_id: keystring,
    redirect_uri: redirectUri,
    scope,
    state,
    code_challenge: codeChallenge,
    code_challenge_method: "S256",
  });

  return {
    url: `${ETSY_AUTHORIZE}?${params.toString()}`,
    state,
    codeVerifier,
    redirectUri,
  };
}

export interface EtsyTokens {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
}

export type ExchangeResult =
  | { ok: true; status: number; tokens: EtsyTokens }
  | { ok: false; status: number; body: string };

export async function exchangeAuthorizationCode(
  code: string,
  codeVerifier: string,
  redirectUri: string
): Promise<ExchangeResult> {
  const keystring = getKeystring();
  const secret = getSharedSecret();

  const body = new URLSearchParams({
    grant_type: "authorization_code",
    client_id: keystring,
    redirect_uri: redirectUri,
    code,
    code_verifier: codeVerifier,
  });

  const res = await fetch(ETSY_TOKEN, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "x-api-key": `${keystring}:${secret}`,
    },
    body: body.toString(),
    cache: "no-store",
  });

  const text = await res.text();
  if (!res.ok) {
    return { ok: false, status: res.status, body: text };
  }

  try {
    const tokens = JSON.parse(text) as EtsyTokens;
    return { ok: true, status: res.status, tokens };
  } catch {
    return { ok: false, status: res.status, body: "Unexpected non-JSON token response" };
  }
}
