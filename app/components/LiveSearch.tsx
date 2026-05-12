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
  const compactQuery = compactSearchValue(query);

  const results = useMemo(() => {
    if (normalizedQuery.length < 2) {
      return [];
    }

    const queryTokens = normalizedQuery.split(/\s+/).filter(Boolean);
    const compactTokens = queryTokens.map(compactSearchValue).filter(Boolean);

    return products
      .filter((product) => {
        const searchableFields = [
          product.ean,
          product.productName,
          product.brand,
          product.category
        ];
        const searchableText = searchableFields.join(" ").toLowerCase();
        const compactSearchableText = compactSearchValue(searchableFields.join(""));

        return queryTokens.every((token) => searchableText.includes(token))
          || compactTokens.every((token) => compactSearchableText.includes(token))
          || compactSearchableText.includes(compactQuery);
      })
      .slice(0, 6);
  }, [compactQuery, normalizedQuery, products]);

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

function compactSearchValue(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "");
}
