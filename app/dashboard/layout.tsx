import type { Metadata } from "next";
import Sidebar from "@/components/dashboard/Sidebar";

export const metadata: Metadata = {
  title: "Dashboard — SellerSyncHub",
  description: "Manage your Etsy orders from a unified command center.",
  robots: { index: false, follow: false },
};

/**
 * The dashboard layout uses `fixed inset-0` to take over the full viewport,
 * sitting above the marketing Navbar (z-50) without requiring a route-group
 * restructure of the existing marketing pages.
 */
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-[100] flex bg-slate-950 overflow-hidden">
      {/* Sidebar handles both desktop (static) and mobile (drawer) */}
      <Sidebar />

      {/* Main content column */}
      <div className="flex flex-1 flex-col min-w-0 overflow-hidden bg-slate-50">
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
