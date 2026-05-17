import type { Metadata } from "next";
import Link from "next/link";
import EtsyTrademarkNotice from "@/components/compliance/EtsyTrademarkNotice";
import { Shield, Link2, Mail } from "lucide-react";

export const metadata: Metadata = {
  title: "Etsy integration",
  description:
    "How SellerSyncHub connects to Etsy via OAuth 2.0 + PKCE, requested scopes, support, and trademark compliance.",
};

type Search = Record<string, string | string[] | undefined>;

function first(v: string | string[] | undefined): string | undefined {
  return Array.isArray(v) ? v[0] : v;
}

export default async function EtsyIntegrationPage({
  searchParams,
}: {
  searchParams: Promise<Search>;
}) {
  const sp = await searchParams;
  const success = first(sp.oauth_success) === "1";
  const err = first(sp.oauth_error);
  const errDesc = first(sp.oauth_error_description);

  return (
    <div className="bg-slate-50 pt-28 pb-24">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <p className="text-sm font-semibold uppercase tracking-widest text-indigo-600 mb-2">
          Integrations
        </p>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          Etsy (Open API v3)
        </h1>
        <p className="mt-4 text-lg text-slate-600 leading-relaxed">
          SellerSyncHub uses Etsy&apos;s official OAuth 2.0 authorization code
          flow with PKCE. We do not scrape the Etsy site and we do not collect
          Etsy order or shipping data except through the API after you explicitly
          grant access.
        </p>

        {success && (
          <div
            role="status"
            className="mt-8 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900"
          >
            Authorization succeeded. Token storage and shop linking will be
            completed in your dashboard as the product rollout continues — this
            landing build completes the OAuth handshake only.
          </div>
        )}

        {err && (
          <div
            role="alert"
            className="mt-8 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950"
          >
            <p className="font-semibold">OAuth: {err}</p>
            {errDesc && (
              <p className="mt-1 opacity-90">
                {(() => {
                  try {
                    return decodeURIComponent(errDesc);
                  } catch {
                    return errDesc;
                  }
                })()}
              </p>
            )}
            {(err === "configuration" ||
              errDesc?.includes("Missing") ||
              errDesc?.includes("ETSY")) && (
              <p className="mt-2 text-xs text-amber-900/90">
                Add{" "}
                <code className="rounded bg-amber-100/80 px-1">
                  ETSY_API_KEYSTRING
                </code>{" "}
                and{" "}
                <code className="rounded bg-amber-100/80 px-1">
                  ETSY_API_SHARED_SECRET
                </code>{" "}
                to your environment (see{" "}
                <code className="rounded bg-amber-100/80 px-1">
                  .env.local.example
                </code>
                ).
              </p>
            )}
          </div>
        )}

        <div className="mt-10 space-y-6">
          <div className="flex gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-700">
              <Link2 className="h-5 w-5" aria-hidden />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-900">
                Connect your shop
              </h2>
              <p className="mt-1 text-sm text-slate-600 leading-relaxed">
                Start the OAuth flow from our registered callback route. Ensure
                your Etsy app lists the exact callback URL for this environment
                (including scheme, host, path, and no trailing slash).
              </p>
              <a
                href="/api/oauth/authorize"
                className="mt-4 inline-flex items-center justify-center rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 transition-colors"
              >
                Connect with Etsy
              </a>
            </div>
          </div>

          <div className="flex gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-700">
              <Shield className="h-5 w-5" aria-hidden />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-900">
                Scopes &amp; minimum data
              </h2>
              <p className="mt-1 text-sm text-slate-600 leading-relaxed">
                Default scopes are configured server-side (see{" "}
                <code className="rounded bg-slate-100 px-1 text-xs">
                  ETSY_OAUTH_SCOPES
                </code>
                ). We request read-oriented scopes appropriate for order
                aggregation and adjust only as needed for documented endpoints.
              </p>
            </div>
          </div>

          <div className="flex gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-700">
              <Mail className="h-5 w-5" aria-hidden />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-900">Support</h2>
              <p className="mt-1 text-sm text-slate-600 leading-relaxed">
                Sellers can reach us at{" "}
                <a
                  href="mailto:hi@sellersynchub.com"
                  className="font-medium text-indigo-600 hover:text-indigo-700"
                >
                  hi@sellersynchub.com
                </a>
                .
              </p>
            </div>
          </div>
        </div>

        <div className="mt-10 rounded-xl border border-slate-200 bg-white p-6">
          <h2 className="text-sm font-semibold text-slate-900">
            Trademark notice
          </h2>
          <div className="mt-3">
            <EtsyTrademarkNotice />
          </div>
        </div>

        <div className="mt-8 flex flex-wrap gap-x-4 gap-y-2 text-sm">
          <Link
            href="/application-terms"
            className="font-medium text-indigo-600 hover:text-indigo-700"
          >
            Seller Application Terms
          </Link>
          <Link
            href="/privacy"
            className="font-medium text-indigo-600 hover:text-indigo-700"
          >
            Privacy Policy
          </Link>
          <Link href="/" className="font-medium text-indigo-600 hover:text-indigo-700">
            ← Home
          </Link>
        </div>
      </div>
    </div>
  );
}
