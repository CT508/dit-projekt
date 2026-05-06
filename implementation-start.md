# Implementation Start

## Recommended Stack

- Frontend: Next.js App Router
- Backend: Next.js API routes for MVP, NestJS if the backend grows large
- Database: PostgreSQL
- ORM: Prisma
- Auth: Auth.js with role-based access
- Imports: CSV + XML parsers
- Jobs: BullMQ + Redis

## First Build Order

1. Create Prisma schema from `saas-platform-blueprint.md`
2. Implement EAN utilities:
   - `normalizeEan`
   - `validateEanLength`
   - `validateEan13Checksum`
3. Build admin master EAN upload
4. Build shop CSV upload
5. Build import validation and `import_errors`
6. Build public product page from `master_products.ean`
7. Add offer filters and sorting

## Hard Rule For Code Reviews

Reject any PR that introduces matching by:

- title
- SKU
- brand
- category
- image
- description
- AI or fuzzy similarity
- manual product-name mapping

Only this condition may publish an offer:

```ts
normalizedFeedEan === approvedMasterProduct.ean
```

## Suggested MVP Folder Shape

```text
app/
  page.tsx
  search/page.tsx
  c/[categorySlug]/page.tsx
  p/[ean]/[slug]/page.tsx
  shop/dashboard/page.tsx
  shop/feed-upload/page.tsx
  shop/imports/[importId]/page.tsx
  admin/dashboard/page.tsx
  admin/master-eans/page.tsx
  admin/shops/page.tsx
  admin/import-logs/page.tsx
lib/
  ean/
    normalize-ean.ts
    validate-ean.ts
  imports/
    parse-csv.ts
    parse-xml.ts
    validate-feed-row.ts
  auth/
  prisma.ts
prisma/
  schema.prisma
```

