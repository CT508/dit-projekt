"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

type SearchProduct = {
  ean: string;
  slug: string;
  productName: string;
  brand?: string;
  category?: string;
  imageUrl: string;
};

export function LiveSearch({ products }: { products: SearchProduct[] }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [remoteProducts, setRemoteProducts] = useState<SearchProduct[]>(products);
  const normalizedQuery = query.trim().toLowerCase();
  const compactQuery = compactSearchValue(query);

  const results = useMemo(() => {
    if (normalizedQuery.length < 2) {
      return [];
    }

    const queryTokens = normalizedQuery.split(/\s+/).filter(Boolean);
    const compactTokens = queryTokens.map(compactSearchValue).filter(Boolean);

    return remoteProducts
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
  }, [compactQuery, normalizedQuery, remoteProducts]);

  useEffect(() => {
    setRemoteProducts(products);
  }, [products]);

  useEffect(() => {
    if (normalizedQuery.length < 2) {
      setRemoteProducts(products);
      return;
    }

    const controller = new AbortController();
    const timeout = window.setTimeout(async () => {
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`, {
          signal: controller.signal,
          cache: "no-store"
        });
        if (!response.ok) {
          return;
        }
        const data = await response.json();
        setRemoteProducts(Array.isArray(data.products) ? data.products : products);
      } catch (error) {
        if (!(error instanceof DOMException && error.name === "AbortError")) {
          setRemoteProducts(products);
        }
      }
    }, 150);

    return () => {
      controller.abort();
      window.clearTimeout(timeout);
    };
  }, [normalizedQuery, products, query]);

  useEffect(() => {
    function closeWhenClickingOutside(event: MouseEvent) {
      if (!formRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", closeWhenClickingOutside);
    return () => document.removeEventListener("mousedown", closeWhenClickingOutside);
  }, []);

  return (
    <form
      ref={formRef}
      className="search-form live-search"
      action="/search"
      onSubmit={() => setIsOpen(false)}
    >
      <input
        name="q"
        placeholder="Search products"
        value={query}
        onChange={(event) => {
          setQuery(event.target.value);
          setIsOpen(true);
        }}
        onFocus={() => setIsOpen(true)}
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            setIsOpen(false);
            event.currentTarget.blur();
          }
        }}
        autoComplete="off"
      />
      <button type="submit">Search</button>
      {isOpen && results.length > 0 ? (
        <div className="live-search-results">
          {results.map((product) => (
            <Link
              className="live-search-result"
              key={product.ean}
              href={`/p/${product.ean}/${product.slug}`}
              onClick={() => setIsOpen(false)}
            >
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
