import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Roadmap",
  description: "Planned features and milestones for SellerSyncHub.",
};

export default function RoadmapPage() {
  return (
    <div className="bg-white pt-28 pb-20">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          Roadmap
        </h1>
        <p className="mt-3 text-slate-600">
          High-level direction for the product. Timelines shift based on Etsy
          API review and customer feedback.
        </p>
        <ol className="mt-10 list-decimal space-y-4 border-t border-slate-200 pt-8 pl-5 text-sm text-slate-600">
          <li>
            <strong className="text-slate-900">Commercial Etsy access</strong>{" "}
            — finalize Application Purpose, scopes, and production OAuth
            deployment.
          </li>
          <li>
            <strong className="text-slate-900">Command center MVP</strong> —
            aggregated receipts, urgency sorting, deadline guardrails.
          </li>
          <li>
            <strong className="text-slate-900">Multi-shop scale</strong> —
            additional storefronts and team permissions.
          </li>
        </ol>
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
