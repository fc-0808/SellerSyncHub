import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Changelog",
  description: "Product updates and release notes for SellerSyncHub.",
};

export default function ChangelogPage() {
  return (
    <div className="bg-white pt-28 pb-20">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          Changelog
        </h1>
        <p className="mt-3 text-slate-600">
          Public release notes will appear here as SellerSyncHub moves from early
          access to general availability.
        </p>
        <ul className="mt-10 space-y-6 border-t border-slate-200 pt-8 text-sm text-slate-600">
          <li>
            <span className="font-semibold text-slate-900">Unreleased</span> —
            Etsy Open API v3 OAuth 2.0 (PKCE) callback route, commercial-access
            legal pack (Seller Application Terms, caching disclosure), and
            waitlist consent audit fields.
          </li>
        </ul>
        <p className="mt-10">
          <Link
            href="/"
            className="text-sm font-medium text-indigo-600 hover:text-indigo-700"
          >
            ← Back to home
          </Link>
        </p>
      </div>
    </div>
  );
}
