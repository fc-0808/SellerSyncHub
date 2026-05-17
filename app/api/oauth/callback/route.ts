import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { exchangeAuthorizationCode } from "@/lib/oauth/etsy-oauth-server";

const STATE_COOKIE = "ssh_etsy_oauth_state";
const VERIFIER_COOKIE = "ssh_etsy_oauth_verifier";
const REDIRECT_URI_COOKIE = "ssh_etsy_oauth_redirect_uri";

function clearOAuthCookies(jar: Awaited<ReturnType<typeof cookies>>) {
  const opts = { path: "/", maxAge: 0 };
  jar.set(STATE_COOKIE, "", opts);
  jar.set(VERIFIER_COOKIE, "", opts);
  jar.set(REDIRECT_URI_COOKIE, "", opts);
}

/**
 * Etsy redirects here with ?code=...&state=... after the seller approves scopes.
 * Validates CSRF state, exchanges the code for tokens (server-side only).
 * Tokens are never appended to URLs; persist them in your database in a follow-up step.
 */
export async function GET(request: NextRequest) {
  const origin = request.nextUrl.origin;
  const base = new URL("/integrations/etsy", origin);

  const jar = await cookies();
  const expectedState = jar.get(STATE_COOKIE)?.value;
  const codeVerifier = jar.get(VERIFIER_COOKIE)?.value;
  const redirectUri = jar.get(REDIRECT_URI_COOKIE)?.value;

  const sp = request.nextUrl.searchParams;
  const err = sp.get("error");
  const errDesc = sp.get("error_description");

  if (err) {
    clearOAuthCookies(jar);
    base.searchParams.set("oauth_error", err);
    if (errDesc) base.searchParams.set("oauth_error_description", errDesc);
    return NextResponse.redirect(base, 302);
  }

  const code = sp.get("code");
  const state = sp.get("state");

  if (!code || !state || !expectedState || !codeVerifier || !redirectUri) {
    clearOAuthCookies(jar);
    base.searchParams.set(
      "oauth_error",
      "invalid_request",
    );
    base.searchParams.set(
      "oauth_error_description",
      "Missing authorization code, state, or session cookies. Start the flow again from Connect.",
    );
    return NextResponse.redirect(base, 302);
  }

  if (state !== expectedState) {
    clearOAuthCookies(jar);
    base.searchParams.set("oauth_error", "state_mismatch");
    base.searchParams.set(
      "oauth_error_description",
      "OAuth state did not match — possible CSRF. Start the flow again.",
    );
    return NextResponse.redirect(base, 302);
  }

  const exchanged = await exchangeAuthorizationCode(
    code,
    codeVerifier,
    redirectUri,
  );

  clearOAuthCookies(jar);

  if (!exchanged.ok) {
    base.searchParams.set("oauth_error", "token_exchange_failed");
    base.searchParams.set(
      "oauth_error_description",
      `Etsy returned HTTP ${exchanged.status}.`,
    );
    return NextResponse.redirect(base, 302);
  }

  // Never log or expose raw tokens. Persist encrypted server-side when you add a DB model.
  base.searchParams.set("oauth_success", "1");
  return NextResponse.redirect(base, 302);
}
