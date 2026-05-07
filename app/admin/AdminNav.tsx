import Link from "next/link";

const links = [
  { href: "/admin/dashboard", label: "Dashboard" },
  { href: "/admin/master-eans", label: "Master products" },
  { href: "/admin/master-eans/new", label: "Add product" },
  { href: "/admin/shops", label: "Shops" },
  { href: "/admin/import-logs", label: "Imports" },
  { href: "/admin/categories", label: "Categories" },
  { href: "/admin/settings", label: "Settings" }
];

export function AdminNav() {
  return (
    <nav className="admin-nav" aria-label="Admin navigation">
      {links.map((link) => (
        <Link key={link.href} href={link.href}>{link.label}</Link>
      ))}
    </nav>
  );
}

