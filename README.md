# PrisPuls EAN-First SaaS Prototype

This workspace now contains two deliverables:

- `index.html`: static product comparison mockup that can be opened directly in a browser.
- Next.js/Prisma implementation skeleton for a real SaaS platform.

## Core Rule

Products are matched only by normalized, approved EAN from the master product database.

Allowed:

```ts
normalizedFeedEan === approvedMasterProduct.ean
```

Not allowed:

- title matching
- SKU matching
- brand/category matching
- fuzzy matching
- AI matching
- fallback logic
- manual product-name mapping

## Important Files

- `saas-platform-blueprint.md`: full product and technical specification
- `implementation-start.md`: short implementation guide
- `prisma/schema.prisma`: PostgreSQL data model
- `lib/ean/normalize-ean.ts`: EAN normalization
- `lib/ean/validate-ean.ts`: EAN-13 format and checksum validation
- `lib/imports/validate-feed-row.ts`: required feed field validation
- `lib/imports/import-feed.ts`: import report logic
- `app/page.tsx`: public homepage
- `app/search/page.tsx`: search results
- `app/p/[ean]/[slug]/page.tsx`: SEO product comparison page
- `app/shop/dashboard/page.tsx`: shop dashboard
- `app/shop/feed-upload/page.tsx`: shop feed upload
- `app/admin/dashboard/page.tsx`: admin dashboard
- `app/admin/master-eans/page.tsx`: master EAN management

## API Skeleton

- `GET /api/search`
- `GET /api/products/:ean`
- `POST /api/shop/imports/csv`
- `POST /api/shop/imports/xml`
- `GET /api/admin/master-products`
- `POST /api/clicks`
- `POST /api/shop/imports/google`

## Large Feed Handling

Large feeds up to 100 MB must be supported. They must not be processed by loading the full file into memory with `request.text()`.

Current configured limit:

```ts
maxFeedBytes = 100 * 1024 * 1024
```

Required production pattern:

1. Shop submits a feed URL or uploads a file.
2. API creates a `product_imports` record with status `QUEUED`.
3. Background worker fetches/parses the feed as a stream.
4. Parser yields one product row at a time.
5. Each row is normalized and validated immediately.
6. Accepted offers are upserted in batches.
7. Rejected rows are stored in `import_errors` in batches.
8. Import progress is checkpointed every N rows.
9. API/UI reads import status instead of waiting for the full import request.

The Google Merchant parser in `lib/imports/parse-google-merchant-stream.ts` is item-based and keeps only a small buffer in memory.

Operational limits:

- Maximum feed file size: 100 MB
- Maximum XML item buffer: 512 KB
- Recommended database batch size: 500 rows
- Recommended checkpoint interval: 1,000 rows
- Oversized feeds should return `413 FEED_TOO_LARGE`

Local feed smoke test:

```bash
node scripts/validate-google-feed.mjs live-feed.xml 8715946668031
```

Verified against the provided live feed:

- Total items: 14,460
- Items with GTIN: 11,306
- Epson target EAN rows: 1
- Target EAN: `8715946668031`

## Run Locally

This shell currently has Node but no npm command available. In a normal Node environment:

```bash
npm install
npm run prisma:generate
npm run dev
```

Then open:

```text
http://localhost:3000
```

## Next Implementation Step

Replace `lib/data/mock-data.ts` with Prisma queries:

- Public product pages should read from `master_products`
- Offers should read from `shop_offers`
- Feed imports should upsert offers only after `master_products.ean` is approved and active
- Rejected rows should be persisted in `import_errors`
