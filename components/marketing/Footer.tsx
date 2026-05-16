import Link from "next/link";
import { Layers, Mail, GitBranch, X } from "lucide-react";

const footerLinks = {
  Product: [
    { label: "Features", href: "#features" },
    { label: "Pricing", href: "#pricing" },
    { label: "Changelog", href: "#" },
    { label: "Roadmap", href: "#" },
  ],
  Legal: [
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Service", href: "/terms" },
  ],
  Support: [
    { label: "hi@sellersynchub.com", href: "mailto:hi@sellersynchub.com" },
    { label: "Documentation", href: "#" },
    { label: "Status", href: "#" },
  ],
};

const socialLinks = [
  { icon: X, label: "X (Twitter)", href: "#" },
  { icon: GitBranch, label: "GitHub", href: "#" },
  { icon: Mail, label: "Email", href: "mailto:hi@sellersynchub.com" },
];

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-slate-950 text-slate-400">
      {/* Main footer content */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-16 pb-10">
        <div className="grid grid-cols-2 gap-8 lg:grid-cols-5">
          {/* Brand column */}
          <div className="col-span-2 lg:col-span-2">
            <Link
              href="/"
              className="inline-flex items-center gap-2.5 group mb-4"
              aria-label="SellerSyncHub home"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 group-hover:bg-indigo-500 transition-colors">
                <Layers className="h-4 w-4 text-white" strokeWidth={2.5} />
              </div>
              <span className="text-[15px] font-semibold text-white">
                SellerSyncHub
              </span>
            </Link>
            <p className="text-sm leading-relaxed max-w-xs text-slate-500">
              The centralized order management platform built for high-volume
              multi-shop e-commerce operators.
            </p>
            <div className="mt-5 flex items-center gap-3">
              {socialLinks.map(({ icon: Icon, label, href }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="flex h-8 w-8 items-center justify-center rounded-md text-slate-500 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-300 mb-4">
                {category}
              </h3>
              <ul className="space-y-3">
                {links.map(({ label, href }) => (
                  <li key={label}>
                    {href.startsWith("/") ? (
                      <Link
                        href={href}
                        className="text-sm text-slate-500 hover:text-slate-200 transition-colors"
                      >
                        {label}
                      </Link>
                    ) : (
                      <a
                        href={href}
                        className="text-sm text-slate-500 hover:text-slate-200 transition-colors"
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

        {/* Divider */}
        <div className="mt-12 border-t border-white/10 pt-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-slate-600">
              &copy; {year} SellerSyncHub. All rights reserved.
            </p>
            <div className="flex flex-wrap gap-x-4 gap-y-1">
              <Link
                href="/privacy"
                className="text-xs text-slate-600 hover:text-slate-400 transition-colors"
              >
                Privacy Policy
              </Link>
              <Link
                href="/terms"
                className="text-xs text-slate-600 hover:text-slate-400 transition-colors"
              >
                Terms of Service
              </Link>
              <a
                href="mailto:hi@sellersynchub.com"
                className="text-xs text-slate-600 hover:text-slate-400 transition-colors"
              >
                Support
              </a>
            </div>
          </div>

          {/* Etsy API trademark disclaimer — required for API approval */}
          <p className="mt-4 text-[11px] leading-relaxed text-slate-700 max-w-xl">
            The term &ldquo;Etsy&rdquo; is a trademark of Etsy, Inc. This
            application uses the Etsy API but is not endorsed or certified by
            Etsy, Inc.
          </p>
        </div>
      </div>
    </footer>
  );
}
