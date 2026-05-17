"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X, Layers } from "lucide-react";

const navLinks = [
  { label: "Features", href: "#features" },
  { label: "Pricing",  href: "#pricing"  },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    handler();
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ease-out ${
        scrolled
          ? "bg-white/96 backdrop-blur-md border-b border-slate-200/70 shadow-sm shadow-slate-200/50"
          : "bg-transparent"
      }`}
    >
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-8">

          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2.5 group shrink-0"
            aria-label="SellerSyncHub home"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 ring-1 ring-indigo-500/40 group-hover:bg-indigo-500 transition-colors duration-150">
              <Layers className="h-4 w-4 text-white" strokeWidth={2.5} />
            </div>
            <span
              className={`text-[15px] font-semibold tracking-tight transition-colors duration-200 ${
                scrolled ? "text-slate-900" : "text-white"
              }`}
            >
              SellerSyncHub
            </span>
          </Link>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-0.5 flex-1">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className={`px-3.5 py-2 text-sm font-medium rounded-lg transition-all duration-150 ${
                  scrolled
                    ? "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                    : "text-white/75 hover:text-white hover:bg-white/10"
                }`}
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Desktop CTAs */}
          <div className="hidden md:flex items-center gap-2.5 shrink-0">
            <a
              href="#waitlist"
              className={`text-sm font-medium px-3 py-2 rounded-lg transition-all duration-150 ${
                scrolled
                  ? "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  : "text-white/75 hover:text-white hover:bg-white/10"
              }`}
            >
              Log In
            </a>
            <a
              href="#waitlist"
              className="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white
                hover:bg-indigo-500 active:scale-95 transition-all duration-150
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
            >
              Join Waitlist
            </a>
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMenuOpen((v) => !v)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            className={`md:hidden rounded-lg p-2 transition-all duration-150 ${
              scrolled
                ? "text-slate-700 hover:bg-slate-100"
                : "text-white hover:bg-white/10"
            }`}
          >
            {menuOpen
              ? <X    className="h-5 w-5" />
              : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden border-t border-slate-200 bg-white animate-fade-in py-3 px-1">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="block rounded-lg px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors"
              >
                {link.label}
              </a>
            ))}
            <div className="mt-3 flex flex-col gap-2 px-3 pb-2 border-t border-slate-100 pt-3">
              <a
                href="#waitlist"
                onClick={() => setMenuOpen(false)}
                className="block text-center rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Log In
              </a>
              <a
                href="#waitlist"
                onClick={() => setMenuOpen(false)}
                className="block text-center rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500 active:scale-[0.98] transition-all"
              >
                Join Waitlist
              </a>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
