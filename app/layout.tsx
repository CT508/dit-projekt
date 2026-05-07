import "./globals.css";
import type { Metadata } from "next";
import Link from "next/link";

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
            <form className="search-form" action="/search">
              <input name="q" placeholder="Search product, EAN, brand or category" />
              <button type="submit">Search</button>
            </form>
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
