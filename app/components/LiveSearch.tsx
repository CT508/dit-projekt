"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

type SearchProduct = {
  ean: string;
  slug: string;
  productName: string;
  brand: string;
  category: string;
  imageUrl: string;
};

export function LiveSearch({ products }: { products: SearchProduct[] }) {
  const [query, setQuery] = useState("");
  const normalizedQuery = query.trim().toLowerCase();

  const results = useMemo(() => {
    if (normalizedQuery.length < 2) {
      return [];
    }

    return products
      .filter((product) => {
        return [
          product.ean,
          product.productName,
          product.brand,
          product.category
        ].some((value) => value.toLowerCase().includes(normalizedQuery));
      })
      .slice(0, 6);
  }, [normalizedQuery, products]);

  return (
    <form className="search-form live-search" action="/search">
      <input
        name="q"
        placeholder="Search products"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        autoComplete="off"
      />
      <button type="submit">Search</button>
      {results.length > 0 ? (
        <div className="live-search-results">
          {results.map((product) => (
            <Link className="live-search-result" key={product.ean} href={`/p/${product.ean}/${product.slug}`}>
              <img src={product.imageUrl} alt="" />
              <span>
                <strong>{product.productName}</strong>
              </span>
            </Link>
          ))}
        </div>
      ) : null}
    </form>
  );
}
