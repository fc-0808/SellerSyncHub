import Link from "next/link";
import { Layers, Mail, GitBranch, X } from "lucide-react";
import EtsyTrademarkNotice from "@/components/compliance/EtsyTrademarkNotice";

const footerLinks = {
  Product: [
    { label: "Features",  href: "#features"  },
    { label: "Pricing",   href: "#pricing"   },
    { label: "Changelog", href: "/changelog" },
    { label: "Roadmap",   href: "/roadmap"   },
  ],
  "Legal & Compliance": [
    { label: "Privacy Policy",        href: "/privacy"           },
    { label: "Terms of Service",      href: "/terms"             },
    { label: "Seller App Terms",      href: "/application-terms" },
    { label: "Etsy Integration",      href: "/integrations/etsy" },
  ],
  Support: [
    { label: "hi@sellersynchub.com",  href: "mailto:hi@sellersynchub.com" },
    { label: "Documentation",         href: "/integrations/etsy"          },
    { label: "Status",                href: "#"                           },
  ],
};

const socialLinks = [
  { icon: X,          label: "X (Twitter)", href: "#"                          },
  { icon: GitBranch,  label: "GitHub",      href: "#"                          },
  { icon: Mail,       label: "Email",       href: "mailto:hi@sellersynchub.com" },
];

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-slate-950 border-t border-white/8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-14 pb-10">

        {/* ── Main columns ──────────────────────────────────────────── */}
        <div className="grid grid-cols-2 gap-x-8 gap-y-12 lg:grid-cols-5">

          {/* Brand column */}
          <div className="col-span-2 lg:col-span-2 lg:pr-8">
            <Link
              href="/"
              className="inline-flex items-center gap-2.5 group mb-5"
              aria-label="SellerSyncHub home"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 ring-1 ring-indigo-500/50 group-hover:bg-indigo-500 transition-colors">
                <Layers className="h-4 w-4 text-white" strokeWidth={2.5} />
              </div>
              <span className="text-[15px] font-semibold text-white tracking-tight">
                SellerSyncHub
              </span>
            </Link>

            <p className="text-sm leading-relaxed text-slate-500 max-w-[18rem]">
              The professional order management system for high-volume Etsy
              sellers — built to scale across every storefront you own.
            </p>

            <div className="mt-6 flex items-center gap-1">
              {socialLinks.map(({ icon: Icon, label, href }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-600 hover:text-white hover:bg-white/8 transition-all duration-150"
                >
                  <Icon className="h-3.5 w-3.5" />
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h3 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400 mb-4">
                {category}
              </h3>
              <ul className="space-y-3">
                {links.map(({ label, href }) => (
                  <li key={label}>
                    {href.startsWith("/") ? (
                      <Link
                        href={href}
                        className="text-sm text-slate-600 hover:text-slate-300 transition-colors duration-150"
                      >
                        {label}
                      </Link>
                    ) : (
                      <a
                        href={href}
                        className="text-sm text-slate-600 hover:text-slate-300 transition-colors duration-150"
                      >
                        {label}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* ── Bottom bar ────────────────────────────────────────────── */}
        <div className="mt-12 pt-7 border-t border-white/8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-slate-700">
              &copy; {year} SellerSyncHub. All rights reserved.
            </p>
            <div className="flex flex-wrap items-center gap-x-5 gap-y-1">
              {[
                { label: "Privacy",     href: "/privacy"           },
                { label: "Terms",       href: "/terms"             },
                { label: "App Terms",   href: "/application-terms" },
              ].map(({ label, href }) => (
                <Link
                  key={label}
                  href={href}
                  className="text-xs text-slate-700 hover:text-slate-400 transition-colors"
                >
                  {label}
                </Link>
              ))}
              <span className="hidden sm:block text-slate-800 text-xs">·</span>
              <a
                href="mailto:hi@sellersynchub.com"
                className="text-xs text-slate-700 hover:text-slate-400 transition-colors"
              >
                Support
              </a>
            </div>
          </div>

          {/* ── Etsy trademark & compliance notice ──────────────────── */}
          {/* Required by Etsy API Terms — must appear prominently.     */}
          <div className="mt-6 rounded-lg border border-white/6 bg-white/3 px-4 py-3.5">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500 mb-1.5">
              Trademark &amp; Compliance Notice
            </p>
            <EtsyTrademarkNotice className="text-slate-500" />
          </div>
        </div>

      </div>
    </footer>
  );
}
