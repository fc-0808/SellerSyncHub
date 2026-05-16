import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/marketing/Navbar";
import Footer from "@/components/marketing/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://sellersynchub.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "SellerSyncHub — Order Management for Multi-Shop Sellers",
    template: "%s | SellerSyncHub",
  },
  description:
    "Sync orders, track shipping deadlines, and manage fulfillment across 20+ Etsy storefronts from one powerful command center. Built for high-volume multi-shop sellers.",
  keywords: [
    "order management system",
    "Etsy seller tools",
    "multi-shop management",
    "e-commerce fulfillment",
    "shipping deadline tracker",
    "Etsy OMS",
  ],
  authors: [{ name: "SellerSyncHub" }],
  creator: "SellerSyncHub",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: "SellerSyncHub",
    title: "SellerSyncHub — Order Management for Multi-Shop Sellers",
    description:
      "Sync orders, track shipping deadlines, and manage fulfillment across 20+ Etsy storefronts from one powerful command center.",
  },
  twitter: {
    card: "summary_large_image",
    title: "SellerSyncHub — Order Management for Multi-Shop Sellers",
    description:
      "Sync orders, track shipping deadlines, and manage fulfillment across 20+ Etsy storefronts from one powerful command center.",
    creator: "@sellersynchub",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#4f46e5",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geistSans.variable} h-full`}>
      <body className="flex min-h-full flex-col bg-white antialiased">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
