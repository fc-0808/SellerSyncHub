import type { Metadata } from "next";
import Link from "next/link";
import EtsyTrademarkNotice from "@/components/compliance/EtsyTrademarkNotice";
import {
  APPLICATION_DEVELOPER_LEGAL_NAME,
  APPLICATION_TERMS_VERSION,
} from "@/lib/legal/constants";

export const metadata: Metadata = {
  title: "Seller Application Terms",
  description:
    "Enforceable Application Terms between SellerSyncHub and Etsy sellers using the Service, including the Etsy API warranty disclaimer required by Etsy.",
};

const CONTACT_EMAIL = "hi@sellersynchub.com";

export default function ApplicationTermsPage() {
  return (
    <div className="bg-white pt-28 pb-20">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 border-b border-slate-200 pb-8">
          <p className="text-sm font-semibold uppercase tracking-widest text-indigo-600 mb-2">
            Legal — Application Terms
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Seller Application Terms
          </h1>
          <p className="mt-3 text-sm text-slate-500">
            Version {APPLICATION_TERMS_VERSION} — These terms form the binding
            agreement between you and {APPLICATION_DEVELOPER_LEGAL_NAME} when
            you use the SellerSyncHub Application (the &ldquo;Application&rdquo;).
            They are required for Etsy API compliance and must be accepted via a
            click-through or equivalent experience before you use features that
            access Etsy data.
          </p>
        </div>

        <div className="prose prose-slate max-w-none [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-slate-900 [&_h2]:mt-10 [&_h2]:mb-3 [&_p]:text-slate-600 [&_p]:leading-relaxed [&_p]:mb-4 [&_ul]:text-slate-600 [&_ul]:space-y-1.5 [&_li]:leading-relaxed">
          <p>
            These Seller Application Terms (&ldquo;Application Terms&rdquo;)
            supplement our general{" "}
            <Link
              href="/terms"
              className="text-indigo-600 hover:text-indigo-700 underline underline-offset-2"
            >
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link
              href="/privacy"
              className="text-indigo-600 hover:text-indigo-700 underline underline-offset-2"
            >
              Privacy Policy
            </Link>
            . If there is a conflict between these Application Terms and the
            Terms of Service solely with respect to Etsy-related data access and
            your relationship with {APPLICATION_DEVELOPER_LEGAL_NAME} as the
            Application developer, these Application Terms control for that
            limited subject matter.
          </p>

          <h2>1. Etsy API and independent branding</h2>
          <p>
            The Application integrates with Etsy through Etsy&apos;s Open API
            v3 using OAuth 2.0 (including PKCE) as described in Etsy&apos;s
            developer documentation. The Application is not affiliated with,
            endorsed by, or certified by Etsy, Inc.
          </p>
          <EtsyTrademarkNotice className="not-prose rounded-lg border border-slate-200 bg-slate-50 px-4 py-3" />

          <h2>2. OAuth access and data minimization</h2>
          <p>
            You authorize {APPLICATION_DEVELOPER_LEGAL_NAME} to access your Etsy
            account data only through Etsy&apos;s official OAuth 2.0 flow and only
            for the permission scopes presented at authorization time. We request
            the minimum data reasonably necessary to provide order management,
            fulfillment visibility, and shipping-deadline features described in
            the Application Purpose submitted to Etsy.
          </p>
          <p>
            You may revoke the Application&apos;s access at any time through your
            Etsy account settings or by disconnecting your shop inside the
            Application, after which we will stop retrieving new data from Etsy
            except as needed to comply with law or resolve disputes.
          </p>

          <h2>3. Display, caching, and freshness of Etsy content</h2>
          <p>
            Etsy content accessed via the API can change frequently. When the
            Application displays Etsy-sourced content to you, we will comply with
            Etsy&apos;s API Terms regarding freshness and caching, including
            limits on how long listing and other Etsy content may be shown when
            compared to what appears on Etsy&apos;s own services. See our{" "}
            <Link
              href="/privacy"
              className="text-indigo-600 hover:text-indigo-700 underline underline-offset-2"
            >
              Privacy Policy
            </Link>{" "}
            for a summary of how we sync and retain data.
          </p>

          <h2>4. Communications and Etsy Members</h2>
          <p>
            The Application is designed primarily to help <em>you</em>, the
            seller, operate your shops. Unless Etsy has expressly authorized a
            specific communication channel in writing, we do not use the Etsy
            API to send order, shipping, or tracking messages to Etsy buyers or
            other Etsy Members on your behalf via email, SMS, or similar channels.
            In-product notifications to you (the seller) about your own orders
            and deadlines are part of the Application service.
          </p>

          <h2>5. Support</h2>
          <p>
            Etsy requires a monitored support channel for sellers using the
            Application. Contact us at{" "}
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="text-indigo-600 hover:text-indigo-700 underline underline-offset-2"
            >
              {CONTACT_EMAIL}
            </a>
            . We will respond in a reasonable and timely manner.
          </p>

          <h2>6. Warranty disclaimer (required language)</h2>
          <p className="rounded-lg border border-slate-300 bg-slate-100 px-4 py-4 text-sm font-medium uppercase tracking-wide text-slate-800 leading-relaxed">
            Disclaimer: This Application is solely provided by{" "}
            {APPLICATION_DEVELOPER_LEGAL_NAME} (the &ldquo;Application
            Developer&rdquo;). You acknowledge that Etsy, Inc. and its affiliates
            are not the Application Developer, do not provide the Application
            service, and make no warranties of any kind with respect to the
            Application or data accessed through it.
          </p>

          <h2>7. Changes</h2>
          <p>
            We may update these Application Terms when features change or when
            Etsy or applicable law requires updates. We will post the new version
            here with an updated version date and, where appropriate, require a
            new acceptance before continued use of Etsy-connected features.
          </p>
        </div>

        <div className="mt-12 pt-6 border-t border-slate-200">
          <Link
            href="/"
            className="text-sm font-medium text-indigo-600 hover:text-indigo-700 transition-colors"
          >
            ← Back to SellerSyncHub
          </Link>
        </div>

        <div className="mt-8">
          <EtsyTrademarkNotice compact />
        </div>
      </div>
    </div>
  );
}
