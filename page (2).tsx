import "./globals.css";
import type { Metadata } from "next";
import Link from "next/link";
import { LiveSearch } from "./components/LiveSearch";
import { products } from "@/lib/data/mock-data";

const searchProducts = products.map(({ ean, slug, productName, brand, category, imageUrl }) => ({
  ean,
  slug,
  productName,
  brand,
  category,
  imageUrl
}));

export const metadata: Metadata = {
  title: "PrisPuls EAN Compare",
  description: "EAN-first price comparison SaaS platform.",
  other: {
    "x-prispuls-build": "v8-country-no-shipping"
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header className="top-nav">
          <div className="top-nav-inner">
            <Link className="brand" href="/">
              <span className="brand-mark">PP</span>
              PrisPuls
            </Link>
            <LiveSearch products={searchProducts} />
            <nav className="nav-links" aria-label="Main">
              <Link href="/shop/dashboard">Shop</Link>
              <Link href="/admin/dashboard">Admin</Link>
            </nav>
          </div>
        </header>
        {children}
      </body>
    </html>
  );
}
