import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { buildEtsyAuthorizeRedirectUrl } from "@/lib/oauth/etsy-oauth-server";

const STATE_COOKIE = "ssh_etsy_oauth_state";
const VERIFIER_COOKIE = "ssh_etsy_oauth_verifier";
const REDIRECT_URI_COOKIE = "ssh_etsy_oauth_redirect_uri";
const COOKIE_MAX_AGE = 600;

function cookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: COOKIE_MAX_AGE,
  };
}

/**
 * Starts Etsy OAuth 2.0 Authorization Code + PKCE flow (Open API v3).
 * Register this callback in Etsy Developer Portal: {origin}/api/oauth/callback
 */
export async function GET(request: NextRequest) {
  const origin = request.nextUrl.origin;

  try {
    const { url, state, codeVerifier, redirectUri } =
      buildEtsyAuthorizeRedirectUrl(origin);

    const jar = await cookies();
    jar.set(STATE_COOKIE, state, cookieOptions());
    jar.set(VERIFIER_COOKIE, codeVerifier, cookieOptions());
    jar.set(REDIRECT_URI_COOKIE, redirectUri, cookieOptions());

    return NextResponse.redirect(url, 302);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Configuration error";
    const dest = new URL("/integrations/etsy", origin);
    dest.searchParams.set("oauth_error", "configuration");
    dest.searchParams.set("oauth_error_description", msg);
    return NextResponse.redirect(dest, 302);
  }
}
