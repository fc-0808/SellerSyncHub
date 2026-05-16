import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Learn how SellerSyncHub collects, uses, and protects your data, including order and shipping history accessed exclusively via secure OAuth 2.0 API integrations.",
};

const LAST_UPDATED = "May 16, 2026";
const CONTACT_EMAIL = "hi@sellersynchub.com";

export default function PrivacyPage() {
  return (
    <div className="bg-white pt-28 pb-20">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-10 border-b border-slate-200 pb-8">
          <p className="text-sm font-semibold uppercase tracking-widest text-indigo-600 mb-2">
            Legal
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Privacy Policy
          </h1>
          <p className="mt-3 text-sm text-slate-500">
            Last updated: {LAST_UPDATED}
          </p>
        </div>

        <div className="prose prose-slate max-w-none [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-slate-900 [&_h2]:mt-10 [&_h2]:mb-3 [&_p]:text-slate-600 [&_p]:leading-relaxed [&_p]:mb-4 [&_ul]:text-slate-600 [&_ul]:space-y-1.5 [&_li]:leading-relaxed">

          <p>
            SellerSyncHub (&ldquo;we,&rdquo; &ldquo;our,&rdquo; or
            &ldquo;us&rdquo;) is committed to protecting your privacy. This
            Privacy Policy explains what information we collect, how we use it,
            and how we protect it when you use the SellerSyncHub platform and
            related services (collectively, the &ldquo;Service&rdquo;).
          </p>
          <p>
            By using the Service, you agree to the collection and use of
            information in accordance with this policy.
          </p>

          <h2>1. Information We Collect</h2>

          <p>
            <strong className="text-slate-800">Account information.</strong>{" "}
            When you register, we collect your name, email address, and any
            other information you choose to provide.
          </p>

          <p>
            <strong className="text-slate-800">
              E-commerce data via OAuth 2.0.
            </strong>{" "}
            <strong className="text-slate-700">
              All order data, shipping history, listing data, and storefront
              information is collected exclusively through secure OAuth 2.0 API
              integrations
            </strong>{" "}
            with supported platforms (currently the Etsy Open API v3). We do
            not scrape, screen-harvest, or collect data by any means other than
            the official, permission-based OAuth 2.0 authorization flow. You
            explicitly grant and may revoke this access at any time through your
            account settings or directly through the third-party platform.
          </p>

          <p>
            <strong className="text-slate-800">Usage data.</strong> We
            automatically collect information about how you interact with the
            Service, including browser type, IP address (truncated), pages
            visited, and timestamps. This data is used solely to improve the
            platform.
          </p>

          <p>
            <strong className="text-slate-800">
              Communications.
            </strong>{" "}
            If you contact us via email or our support system, we retain your
            correspondence to assist you and improve our support.
          </p>

          <h2>2. How We Use Your Information</h2>
          <ul>
            <li>To provide, maintain, and improve the Service</li>
            <li>
              To aggregate and display your order and shipping data within the
              platform dashboard
            </li>
            <li>
              To send transactional notifications (e.g., deadline alerts, order
              updates) that you have configured
            </li>
            <li>
              To send service updates, security notices, and account-related
              communications
            </li>
            <li>
              To monitor platform health, debug issues, and enforce our Terms of
              Service
            </li>
            <li>
              To comply with legal obligations
            </li>
          </ul>
          <p>
            We do not sell your personal information or your storefront data to
            third parties.
          </p>

          <h2>3. OAuth 2.0 API Access — Scope &amp; Permissions</h2>
          <p>
            When you connect a storefront, we request only the OAuth permission
            scopes necessary to display and manage your orders and shipping
            information within SellerSyncHub. We request read access to:
          </p>
          <ul>
            <li>Order details (order ID, item info, buyer shipping address)</li>
            <li>Shipping status and tracking information</li>
            <li>Listing titles (for order display context)</li>
          </ul>
          <p>
            We do not request write access beyond what is strictly necessary for
            features you explicitly enable (e.g., marking an order as shipped).
            You may disconnect any storefront at any time, which immediately
            revokes our access token and stops further data retrieval.
          </p>

          <h2>4. Data Retention</h2>
          <p>
            We retain your account data for as long as your account is active
            or as needed to provide the Service. Order and shipping history
            retrieved via the API is retained according to your plan's data
            history window. You may request deletion of your account and
            associated data at any time by contacting{" "}
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="text-indigo-600 hover:text-indigo-700 underline underline-offset-2"
            >
              {CONTACT_EMAIL}
            </a>
            .
          </p>

          <h2>5. Data Security</h2>
          <p>
            We implement industry-standard security measures including TLS
            encryption in transit, AES-256 encryption at rest for sensitive
            credentials (OAuth tokens), and access controls limiting data access
            to authorized personnel only. OAuth tokens are stored encrypted and
            are never logged or exposed in plaintext.
          </p>

          <h2>6. Third-Party Services</h2>
          <p>
            We use trusted third-party services to operate the platform
            (e.g., cloud infrastructure, analytics, and email delivery). These
            providers process data only as necessary to perform services on our
            behalf and are bound by data processing agreements. We do not share
            your storefront or order data with third-party advertisers.
          </p>

          <h2>7. Your Rights</h2>
          <p>
            Depending on your jurisdiction, you may have the right to access,
            correct, or delete your personal data; object to or restrict
            processing; and data portability. To exercise these rights, contact
            us at{" "}
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="text-indigo-600 hover:text-indigo-700 underline underline-offset-2"
            >
              {CONTACT_EMAIL}
            </a>
            .
          </p>

          <h2>8. Children&apos;s Privacy</h2>
          <p>
            The Service is not directed to individuals under 18 years of age. We
            do not knowingly collect personal information from children.
          </p>

          <h2>9. Changes to This Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. We will notify
            you of material changes by posting the new policy with an updated
            &ldquo;Last updated&rdquo; date and, for significant changes, via
            email. Your continued use of the Service after changes take effect
            constitutes your acceptance of the revised policy.
          </p>

          <h2>10. Contact Us</h2>
          <p>
            If you have questions about this Privacy Policy, please contact us
            at{" "}
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="text-indigo-600 hover:text-indigo-700 underline underline-offset-2"
            >
              {CONTACT_EMAIL}
            </a>
            .
          </p>
        </div>

        {/* Back link */}
        <div className="mt-12 pt-6 border-t border-slate-200">
          <Link
            href="/"
            className="text-sm font-medium text-indigo-600 hover:text-indigo-700 transition-colors"
          >
            ← Back to SellerSyncHub
          </Link>
        </div>

        {/* Trademark disclaimer */}
        <p className="mt-6 text-[11px] text-slate-400 leading-relaxed">
          The term &ldquo;Etsy&rdquo; is a trademark of Etsy, Inc. This
          application uses the Etsy API but is not endorsed or certified by
          Etsy, Inc.
        </p>
      </div>
    </div>
  );
}
