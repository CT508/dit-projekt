import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { hasDatabaseUrl, prisma } from "@/lib/db/prisma";
import { euCountries, getCountryName } from "@/lib/vat/eu-vat";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type ShopPageData = {
  name: string;
  slug: string;
  websiteUrl: string;
  logoUrl: string | null;
  countryCode: string;
  contactEmail: string | null;
  contactPhone: string | null;
  description: string | null;
  deliveryCountries: string[];
  offerCount: number;
};

const fallbackShop: ShopPageData = {
  name: "Grafisk Handel",
  slug: "grafisk-handel",
  websiteUrl: "https://www.grafisk-handel.dk",
  logoUrl: "https://www.google.com/s2/favicons?domain=www.grafisk-handel.dk&sz=128",
  countryCode: "DK",
  contactEmail: "info@grafisk-handel.dk",
  contactPhone: "+45 00 00 00 00",
  description:
    "Grafisk Handel supplies professional print, ink, media, and production products to businesses across Denmark and selected EU markets.",
  deliveryCountries: ["DK", "SE"],
  offerCount: 0
};

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const shop = await getShop(params.slug);
  if (!shop) {
    return { title: "Shop not found | PrisPuls" };
  }

  return {
    title: `${shop.name} profile, delivery countries and offers | PrisPuls`,
    description: `See ${shop.name}'s shop profile, delivery countries, contact details and product offers on PrisPuls.`,
    alternates: {
      canonical: `/shops/${shop.slug}`
    }
  };
}

export default async function PublicShopProfilePage({ params }: { params: { slug: string } }) {
  const shop = await getShop(params.slug);
  if (!shop) {
    notFound();
  }

  const deliveryCountrySet = new Set(shop.deliveryCountries);
  const shownCountries = euCountries.filter((country) => deliveryCountrySet.has(country.code));
  const shopUrl = trackedShopUrl(shop.websiteUrl, shop.name);

  const schema = {
    "@context": "https://schema.org",
    "@type": "Store",
    name: shop.name,
    url: shop.websiteUrl,
    logo: shop.logoUrl ?? undefined,
    description: shop.description ?? undefined,
    address: {
      "@type": "PostalAddress",
      addressCountry: shop.countryCode
    }
  };

  return (
    <main className="shell">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <section className="shop-profile-hero panel">
        <div className="shop-profile-logo-wrap">
          {shop.logoUrl ? (
            <img className="shop-profile-logo" src={shop.logoUrl} alt={`${shop.name} logo`} />
          ) : (
            <div className="shop-profile-logo-placeholder">{shop.name.slice(0, 2).toUpperCase()}</div>
          )}
        </div>
        <div>
          <span className="badge">Verified shop profile</span>
          <h1>{shop.name}</h1>
          <p className="muted">{shop.description}</p>
          <div className="admin-actions">
            <a className="button" href={shopUrl}>Visit shop</a>
            <Link className="secondary-button" href="/shop/profile">Edit profile</Link>
          </div>
        </div>
      </section>

      <section className="shop-profile-grid" style={{ marginTop: 16 }}>
        <div className="panel">
          <h2>Shop details</h2>
          <div className="shop-detail-list">
            <div><span>Website</span><a href={shopUrl}>{shop.websiteUrl}</a></div>
            <div><span>Country</span><strong>{getCountryName(shop.countryCode)}</strong></div>
            <div><span>Active offers</span><strong>{shop.offerCount}</strong></div>
            {shop.contactEmail ? <div><span>Email</span><a href={`mailto:${shop.contactEmail}`}>{shop.contactEmail}</a></div> : null}
            {shop.contactPhone ? <div><span>Phone</span><a href={`tel:${shop.contactPhone}`}>{shop.contactPhone}</a></div> : null}
          </div>
        </div>

        <div className="panel">
          <h2>We deliver to these countries</h2>
          <div className="delivery-country-pills">
            {shownCountries.map((country) => (
              <span className="delivery-country-pill" key={country.code}>
                <span aria-hidden="true">{country.flag}</span>
                {country.name}
              </span>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

async function getShop(slug: string): Promise<ShopPageData | null> {
  if (!hasDatabaseUrl()) {
    return slug === fallbackShop.slug ? fallbackShop : null;
  }

  try {
    const shop = await prisma.shop.findUnique({
      where: { slug },
      include: {
        _count: {
          select: { offers: true }
        }
      }
    });

    if (!shop) {
      return slug === fallbackShop.slug ? fallbackShop : null;
    }

    return {
      name: shop.name,
      slug: shop.slug,
      websiteUrl: shop.websiteUrl,
      logoUrl: shop.logoUrl,
      countryCode: shop.countryCode,
      contactEmail: shop.contactEmail,
      contactPhone: shop.contactPhone,
      description: shop.description,
      deliveryCountries: shop.deliveryCountries,
      offerCount: shop._count.offers
    };
  } catch {
    return slug === fallbackShop.slug ? fallbackShop : null;
  }
}

function trackedShopUrl(websiteUrl: string, shopName: string) {
  try {
    const url = new URL(websiteUrl);
    url.searchParams.set("utm_source", "prispuls.dk");
    url.searchParams.set("utm_medium", "shop_profile");
    url.searchParams.set("utm_campaign", "shop_profile_visit");
    url.searchParams.set("utm_content", shopName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""));
    return url.toString();
  } catch {
    return websiteUrl;
  }
}
