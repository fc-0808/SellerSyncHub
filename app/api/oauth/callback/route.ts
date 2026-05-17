import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { exchangeAuthorizationCode } from "@/lib/oauth/etsy-oauth-server";
import { getUserIdFromToken, getUserShop } from "@/lib/etsy/api";
import { createSupabaseServerClient } from "@/lib/supabase";

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
 * 1. Validates CSRF state.
 * 2. Exchanges the code for access + refresh tokens.
 * 3. Fetches the shop info from Etsy.
 * 4. Persists shop + tokens to Supabase.
 * 5. Redirects to the dashboard.
 */
export async function GET(request: NextRequest) {
  const origin = request.nextUrl.origin;
  const errorBase = new URL("/integrations/etsy", origin);
  const dashboardUrl = new URL("/dashboard/shops", origin);

  const jar = await cookies();
  const expectedState = jar.get(STATE_COOKIE)?.value;
  const codeVerifier = jar.get(VERIFIER_COOKIE)?.value;
  const redirectUri = jar.get(REDIRECT_URI_COOKIE)?.value;

  const sp = request.nextUrl.searchParams;
  const err = sp.get("error");
  const errDesc = sp.get("error_description");

  if (err) {
    clearOAuthCookies(jar);
    errorBase.searchParams.set("oauth_error", err);
    if (errDesc) errorBase.searchParams.set("oauth_error_description", errDesc);
    return NextResponse.redirect(errorBase, 302);
  }

  const code = sp.get("code");
  const state = sp.get("state");

  if (!code || !state || !expectedState || !codeVerifier || !redirectUri) {
    clearOAuthCookies(jar);
    errorBase.searchParams.set("oauth_error", "invalid_request");
    errorBase.searchParams.set(
      "oauth_error_description",
      "Missing authorization code, state, or session cookies. Start the flow again."
    );
    return NextResponse.redirect(errorBase, 302);
  }

  if (state !== expectedState) {
    clearOAuthCookies(jar);
    errorBase.searchParams.set("oauth_error", "state_mismatch");
    errorBase.searchParams.set(
      "oauth_error_description",
      "OAuth state did not match — possible CSRF. Start the flow again."
    );
    return NextResponse.redirect(errorBase, 302);
  }

  const exchanged = await exchangeAuthorizationCode(code, codeVerifier, redirectUri);
  clearOAuthCookies(jar);

  if (!exchanged.ok || !exchanged.tokens) {
    errorBase.searchParams.set("oauth_error", "token_exchange_failed");
    errorBase.searchParams.set(
      "oauth_error_description",
      `Etsy returned HTTP ${exchanged.status}.`
    );
    return NextResponse.redirect(errorBase, 302);
  }

  const { access_token, refresh_token } = exchanged.tokens;

  try {
    // The user_id is embedded as the first segment of the Etsy access token.
    // Per Etsy docs: "An Etsy access token includes your shop/user ID as a token prefix."
    const userId = getUserIdFromToken(access_token);
    const shop = await getUserShop(userId, access_token);

    const supabase = createSupabaseServerClient();

    await supabase.from("connected_shops").upsert(
      {
        shop_id: shop.shop_id,
        shop_name: shop.shop_name,
        shop_title: shop.title ?? shop.shop_name,
        shop_icon_url: shop.icon_url_fullxfull ?? null,
        listing_active_count: shop.listing_active_count ?? 0,
        access_token,
        refresh_token: refresh_token ?? null,
        is_active: true,
        connected_at: new Date().toISOString(),
      },
      { onConflict: "shop_id" }
    );
  } catch (e) {
    console.error("[oauth/callback] failed to persist shop:", e);
    // Still redirect to dashboard — don't block the user; they can retry sync
    dashboardUrl.searchParams.set("connect_warning", "shop_save_failed");
    return NextResponse.redirect(dashboardUrl, 302);
  }

  dashboardUrl.searchParams.set("connected", "1");
  return NextResponse.redirect(dashboardUrl, 302);
}
