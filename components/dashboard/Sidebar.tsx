"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  Store,
  RefreshCw,
  Settings,
  ExternalLink,
  Menu,
  X,
  Zap,
} from "lucide-react";

const navItems = [
  { label: "Orders", href: "/dashboard", icon: LayoutDashboard, exact: true },
  { label: "Shops", href: "/dashboard/shops", icon: Store },
  { label: "Settings", href: "/dashboard/settings", icon: Settings },
];

function NavLink({
  href,
  icon: Icon,
  label,
  exact,
  onClick,
}: {
  href: string;
  icon: React.ElementType;
  label: string;
  exact?: boolean;
  onClick?: () => void;
}) {
  const pathname = usePathname();
  const active = exact ? pathname === href : pathname.startsWith(href);

  return (
    <Link
      href={href}
      onClick={onClick}
      className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
        active
          ? "bg-indigo-600 text-white"
          : "text-slate-400 hover:bg-slate-800 hover:text-white"
      }`}
    >
      <Icon className="h-4 w-4 shrink-0" strokeWidth={active ? 2.2 : 1.8} />
      {label}
    </Link>
  );
}

function SidebarContent({ onClose }: { onClose?: () => void }) {
  return (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="flex h-16 items-center justify-between border-b border-slate-800 px-4">
        <Link
          href="/dashboard"
          onClick={onClose}
          className="flex items-center gap-2.5"
        >
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600">
            <Zap className="h-4 w-4 text-white" strokeWidth={2.5} />
          </div>
          <span className="text-sm font-bold tracking-tight text-white">
            SellerSync<span className="text-indigo-400">Hub</span>
          </span>
        </Link>
        {onClose && (
          <button
            onClick={onClose}
            className="rounded-md p-1 text-slate-400 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-4">
        <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-widest text-slate-600">
          OMS
        </p>
        {navItems.map((item) => (
          <NavLink key={item.href} {...item} onClick={onClose} />
        ))}
      </nav>

      {/* Footer */}
      <div className="border-t border-slate-800 px-3 py-4 space-y-1">
        {/* Use <a> not <Link> — this triggers a server-side 302 to Etsy OAuth.
            Link prefetch would follow the redirect cross-origin and throw a CORS error. */}
        <a
          href="/api/oauth/authorize"
          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
        >
          <RefreshCw className="h-4 w-4 shrink-0" strokeWidth={1.8} />
          Connect Shop
        </a>
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
        >
          <ExternalLink className="h-4 w-4 shrink-0" strokeWidth={1.8} />
          Marketing Site
        </Link>
      </div>

      {/* Status indicator */}
      <div className="mx-3 mb-4 rounded-lg bg-slate-800/60 px-3 py-2.5">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs text-slate-400">Personal Access · Active</span>
        </div>
      </div>
    </div>
  );
}

export default function Sidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-60 shrink-0 flex-col bg-slate-950 border-r border-slate-800">
        <SidebarContent />
      </aside>

      {/* Mobile top bar */}
      <div className="flex lg:hidden h-14 items-center border-b border-slate-800 bg-slate-950 px-4 shrink-0">
        <button
          onClick={() => setMobileOpen(true)}
          className="rounded-md p-2 text-slate-400 hover:text-white"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div className="ml-3 flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-indigo-600">
            <Zap className="h-3.5 w-3.5 text-white" strokeWidth={2.5} />
          </div>
          <span className="text-sm font-bold text-white">
            SellerSync<span className="text-indigo-400">Hub</span>
          </span>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <>
          <div
            className="fixed inset-0 z-[110] bg-black/60 lg:hidden"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="fixed inset-y-0 left-0 z-[120] w-64 flex flex-col bg-slate-950 border-r border-slate-800 lg:hidden">
            <SidebarContent onClose={() => setMobileOpen(false)} />
          </aside>
        </>
      )}
    </>
  );
}
