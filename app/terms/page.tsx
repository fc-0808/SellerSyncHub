import type { Metadata } from "next";
import Link from "next/link";
import EtsyTrademarkNotice from "@/components/compliance/EtsyTrademarkNotice";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "Read the SellerSyncHub Terms of Service, governing your use of the platform and its OAuth-based e-commerce integrations.",
};

const LAST_UPDATED = "May 16, 2026";
const CONTACT_EMAIL = "hi@sellersynchub.com";

export default function TermsPage() {
  return (
    <div className="bg-white pt-28 pb-20">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-10 border-b border-slate-200 pb-8">
          <p className="text-sm font-semibold uppercase tracking-widest text-indigo-600 mb-2">
            Legal
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Terms of Service
          </h1>
          <p className="mt-3 text-sm text-slate-500">
            Last updated: {LAST_UPDATED}
          </p>
        </div>

        <div className="prose prose-slate max-w-none [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-slate-900 [&_h2]:mt-10 [&_h2]:mb-3 [&_p]:text-slate-600 [&_p]:leading-relaxed [&_p]:mb-4 [&_ul]:text-slate-600 [&_ul]:space-y-1.5 [&_li]:leading-relaxed">

          <p>
            Please read these Terms of Service (&ldquo;Terms&rdquo;) carefully
            before using SellerSyncHub (&ldquo;the Service&rdquo;) operated by
            SellerSyncHub (&ldquo;we,&rdquo; &ldquo;us,&rdquo; or
            &ldquo;our&rdquo;). By accessing or using the Service, you agree to
            be bound by these Terms. If you do not agree, do not use the
            Service.
          </p>

          <h2>1. Description of Service</h2>
          <p>
            SellerSyncHub is a Software-as-a-Service (SaaS) order management
            platform that enables e-commerce merchants to aggregate, monitor,
            and manage orders and shipping deadlines across multiple storefronts.
            The Service integrates with third-party e-commerce platforms
            (including Etsy) exclusively through their official, publicly
            documented OAuth 2.0 APIs.
          </p>

          <h2>2. Eligibility</h2>
          <p>
            You must be at least 18 years old and have the legal authority to
            enter into these Terms on behalf of yourself or the organization you
            represent. By using the Service, you represent and warrant that you
            meet these requirements.
          </p>

          <h2>3. Account Registration</h2>
          <p>
            You agree to provide accurate, current, and complete information
            during registration and to keep your account credentials
            confidential. You are responsible for all activity that occurs under
            your account. Notify us immediately at{" "}
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="text-indigo-600 hover:text-indigo-700 underline underline-offset-2"
            >
              {CONTACT_EMAIL}
            </a>{" "}
            if you suspect unauthorized access.
          </p>

          <h2>4. OAuth 2.0 API Integrations</h2>
          <p>
            The Service connects to third-party e-commerce platforms using
            OAuth 2.0 authorization. By connecting a storefront, you:
          </p>
          <ul>
            <li>
              Authorize SellerSyncHub to access your storefront data (orders,
              shipping history, listings) via the platform&apos;s official API,
              within the permission scopes you explicitly grant
            </li>
            <li>
              Confirm that you are the authorized owner or administrator of the
              connected storefront
            </li>
            <li>
              Acknowledge that your use of connected platform APIs is also
              governed by that platform&apos;s own terms and policies
            </li>
            <li>
              Understand that you may revoke SellerSyncHub&apos;s API access at
              any time through the third-party platform&apos;s settings
            </li>
          </ul>
          <p>
            SellerSyncHub does not bypass, circumvent, or violate any
            third-party platform&apos;s API Terms of Service. We retrieve data
            only through officially sanctioned, rate-limit-compliant API calls.
          </p>

          <h2>5. Acceptable Use</h2>
          <p>You agree not to:</p>
          <ul>
            <li>
              Use the Service for any unlawful purpose or in violation of any
              applicable laws
            </li>
            <li>
              Attempt to gain unauthorized access to other users&apos; accounts
              or data
            </li>
            <li>
              Reverse-engineer, decompile, or disassemble any part of the
              Service
            </li>
            <li>
              Use the Service to circumvent any third-party platform&apos;s
              rate limits, access controls, or terms of service
            </li>
            <li>
              Transmit viruses, malware, or any other malicious code
            </li>
            <li>
              Resell or sublicense the Service without our express written
              consent
            </li>
          </ul>

          <h2>6. Subscription &amp; Billing</h2>
          <p>
            Specific pricing, billing cycles, and payment terms will be
            communicated at the time of commercial launch. You will receive
            advance notice before any paid subscription begins. All fees are
            non-refundable except as required by law or as stated in our refund
            policy.
          </p>

          <h2>7. Data &amp; Privacy</h2>
          <p>
            Your use of the Service is also governed by our{" "}
            <Link
              href="/privacy"
              className="text-indigo-600 hover:text-indigo-700 underline underline-offset-2"
            >
              Privacy Policy
            </Link>{" "}
            and, when you connect Etsy or use multi-channel order features, our{" "}
            <Link
              href="/application-terms"
              className="text-indigo-600 hover:text-indigo-700 underline underline-offset-2"
            >
              Seller Application Terms
            </Link>
            , each incorporated herein by reference. We process your data only
            as described in those policies.
          </p>

          <h2>8. Intellectual Property</h2>
          <p>
            The Service, including its software, design, and content, is owned
            by SellerSyncHub and protected by intellectual property laws. You
            retain ownership of your storefront data. You grant us a limited,
            non-exclusive license to process your data solely to provide the
            Service to you.
          </p>

          <h2>9. Disclaimers</h2>
          <p>
            THE SERVICE IS PROVIDED &ldquo;AS IS&rdquo; AND &ldquo;AS
            AVAILABLE&rdquo; WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED,
            INCLUDING MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND
            NON-INFRINGEMENT. We do not guarantee uninterrupted, error-free, or
            secure access to the Service.
          </p>
          <p>
            SellerSyncHub is an independent software provider. It is not
            affiliated with, endorsed by, or certified by Etsy, Inc. or any
            other third-party platform. The availability of API integrations
            depends on those platforms&apos; continued provision of their APIs.
          </p>

          <h2>10. Limitation of Liability</h2>
          <p>
            TO THE MAXIMUM EXTENT PERMITTED BY LAW, SELLERSYNCHUB SHALL NOT BE
            LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR
            PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS OR REVENUE, WHETHER
            INCURRED DIRECTLY OR INDIRECTLY, OR ANY LOSS OF DATA, USE,
            GOODWILL, OR OTHER INTANGIBLE LOSSES RESULTING FROM YOUR USE OF THE
            SERVICE.
          </p>

          <h2>11. Termination</h2>
          <p>
            Either party may terminate the account at any time. Upon
            termination, your right to use the Service will immediately cease.
            We may suspend or terminate your account for violations of these
            Terms. Provisions that by their nature should survive termination
            (including intellectual property, disclaimers, and limitation of
            liability) will remain in effect.
          </p>

          <h2>12. Changes to Terms</h2>
          <p>
            We reserve the right to modify these Terms at any time. We will
            provide at least 14 days&apos; notice of material changes via email
            or in-app notification. Continued use after the effective date
            constitutes acceptance of the revised Terms.
          </p>

          <h2>13. Governing Law</h2>
          <p>
            These Terms are governed by and construed in accordance with
            applicable law. Any disputes shall be subject to the exclusive
            jurisdiction of the courts in the applicable jurisdiction.
          </p>

          <h2>14. Contact</h2>
          <p>
            For questions about these Terms, contact us at{" "}
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

        <div className="mt-6 max-w-xl">
          <EtsyTrademarkNotice compact className="text-slate-500" />
        </div>
      </div>
    </div>
  );
}
