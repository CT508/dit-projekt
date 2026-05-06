# EAN-First Price Comparison SaaS Platform

## 1. Product Vision

Build a SaaS price comparison platform inspired by the information architecture of strong product comparison pages, without copying any specific visual design.

The platform has three surfaces:

- Public comparison website for shoppers
- Shop owner backend for feed uploads and offer management
- Admin backend for master EAN governance, shops, imports, commissions, and settings

The core business rule is absolute:

> Products must only be matched by normalized, approved EAN numbers from the master EAN database. No AI matching, no fuzzy matching, no title matching, no SKU matching, no manual matching by product name, and no fallback logic.

If an offer EAN exists in `master_products` and the product is approved and active, the offer can be attached to that product. If not, the offer is rejected and stored in an import error report.

## 2. User Roles

### Public User

Public users can:

- Search for products
- Browse categories
- View product comparison pages
- Filter and sort offers
- Click through to shops
- View product descriptions, specifications, price offers, delivery data, stock status, ratings, and price history

Public users cannot:

- Create products
- Upload offers
- Influence EAN matching

### Shop Owner

Shop owners can:

- Register and log in
- Manage shop profile
- Upload product feeds by CSV, XML, or API
- View import history
- View accepted offers
- View rejected offers and rejection reasons
- Update existing offers for approved EANs
- Disable their own offers

Shop owners cannot:

- Create master products manually
- Publish products with non-approved EANs
- Match products by title, SKU, brand, or description
- Override import validation

### Admin

Admins can:

- Manage all users and shops
- Upload and manage the master approved EAN file
- Create, edit, approve, disable, or delete master EAN records
- Review rejected shop feed rows
- Approve new EANs manually
- Manage categories
- Manage commissions
- View import logs
- View click tracking
- Configure site settings

Admins are the only role that can approve an EAN into the master product database.

## 3. Public Frontend Requirements

### Homepage

Purpose: entry point for product search and category discovery.

Required elements:

- Global product search input
- Popular categories
- Trending products
- Recently updated offers
- Popular shops
- SEO text blocks for core categories

Search behavior:

- Search may use product title, brand, category, or EAN for discovery.
- Search results must only display products from `master_products`.
- Search must never create matching between shop offers and products.

### Search Results Page

URL example:

```text
/search?q=headphones
```

Required elements:

- Product result cards
- Product image
- Product title
- Brand
- Category
- Lowest price
- Number of active offers
- Stock summary
- Delivery summary
- Rating summary

Filters:

- Price range
- Shop
- Delivery time
- Availability
- Category

Sorting:

- Cheapest price
- Fastest delivery
- Shop rating
- Newest offer

Important rule:

- Results are products from `master_products`.
- Offers shown under a product are only offers where `shop_offers.ean = master_products.ean`.

### Category Page

URL example:

```text
/c/headphones
```

Required elements:

- Category title and SEO introduction
- Product grid/list
- Filters
- Sorting
- Related categories
- FAQ block
- Internal links to important product pages

### Product Comparison Page

SEO-friendly URL example:

```text
/p/5901234123457/aurapods-pro-2
```

The canonical product identity is the EAN. The slug is only for SEO and readability.

Required product data:

- Product image
- Product title
- EAN
- Brand
- Category
- Description
- Specifications
- Price offers
- Shop name
- Shop rating
- Delivery info
- Stock status
- Shipping cost
- Final price including shipping
- CTA buttons
- Price history
- Related products from the same category
- FAQ

Offer table columns:

- Shop
- Product title from shop feed
- Price
- Currency
- Shipping cost
- Total price
- Stock status
- Delivery time
- Last updated
- CTA

Sorting:

- Cheapest price
- Fastest delivery
- Shop rating
- Newest offer

Structured data:

- `Product`
- `AggregateOffer`
- Individual `Offer` entries where appropriate
- `BreadcrumbList`

Important rule:

- The product page is generated from one `master_products.ean`.
- All offers on the page must have exactly the same normalized EAN.

## 4. Shop Owner Backend Requirements

### Shop Login

Required:

- Email/password login
- Role-based access
- Session management
- Forgot password flow

### Shop Dashboard

Required widgets:

- Active offers
- Rejected offers
- Last import status
- Import error count
- Clicks generated
- Estimated commission
- Products currently out of stock

### Shop Profile Management

Shop owners can edit:

- Shop name
- Logo
- Website URL
- Support email
- Phone
- Address
- Delivery policy URL
- Return policy URL
- Default shipping cost
- Tracking parameters

Admin approval may be required before public shop profile changes go live.

### Feed Upload Page

Supported upload methods:

- CSV upload
- XML upload
- API feed URL
- Manual API push

Minimum required feed fields:

- `ean`
- `product_title`
- `price`
- `currency`
- `product_url`
- `image_url`
- `stock_status`
- `delivery_time`
- `shipping_cost`

Optional fields:

- `brand`
- `category`
- `description`
- `condition`
- `availability_date`
- `shop_sku`
- `gtin`
- `manufacturer_part_number`

Optional fields must never be used for product matching.

### Import History

Each import should show:

- Import ID
- Upload method
- File name or feed URL
- Status
- Started at
- Finished at
- Total rows
- Accepted rows
- Rejected rows
- Duplicate EAN rows
- Error report download

### Import Report Page

Rejected row report must include:

- Row number
- Raw EAN
- Normalized EAN
- Product title
- Error code
- Human-readable error message
- Original row payload

Possible rejection reasons:

- Missing EAN
- Invalid EAN format
- Invalid EAN checksum
- Duplicate EAN in same shop feed
- EAN not approved in master database
- Master EAN disabled
- Missing required price
- Invalid currency
- Missing product URL
- Missing image URL
- Invalid stock status
- Invalid delivery time
- Invalid shipping cost

## 5. Admin Backend Requirements

### Admin Dashboard

Required statistics:

- Total approved EANs
- Active shops
- Active offers
- Rejected offers
- Products without offers
- Import errors
- Latest imports
- Top clicked products
- Top clicked shops
- Offers rejected by reason

### Master EAN Management

Admin can:

- Upload master EAN CSV
- Create a master product manually
- Edit product metadata
- Approve product
- Disable product
- Delete product
- Restore product
- View all offers attached to an EAN
- View rejected feed rows for an EAN

Master product fields:

- EAN
- Product name
- Brand
- Category
- Image
- Description
- Specifications
- Approval status
- Active/disabled status
- SEO slug

The master product record is the single source of truth for product identity.

### Rejected Product Review

Admin can:

- View rejected shop rows
- Filter by shop, import, error reason, EAN, category, and date
- Open raw row data
- Create a pending master EAN from a rejected row
- Approve the EAN manually after review
- Re-run validation for rejected rows after EAN approval

Admin must not approve by title similarity alone. Admin approval means the EAN itself is accepted as a real product identifier.

### Shop Management

Admin can:

- Approve or suspend shops
- Edit shop profiles
- View shop imports
- View shop offers
- Set commission rules
- View click tracking
- Manage feed API credentials

### Category Management

Admin can:

- Create categories
- Edit category metadata
- Set parent category
- Manage SEO title and description
- Disable categories

## 6. EAN Matching Rules

### Normalization

Before validation and matching:

1. Convert to string
2. Trim whitespace
3. Remove internal spaces
4. Remove hyphens
5. Remove common invisible characters
6. Keep digits only

Example:

```text
Raw EAN: " 590-1234 123457 "
Normalized EAN: "5901234123457"
```

### Format Validation

Accepted formats:

- EAN-8
- EAN-13
- UPC-A can be normalized to EAN-13 by prefixing `0`, if the business chooses to allow it

Recommended MVP:

- Accept EAN-13 only
- Add EAN-8 and UPC-A later if needed

Validation:

- Must contain digits only
- Must have allowed length
- Must pass checksum where possible

### EAN-13 Checksum

For a 13-digit EAN:

1. Use the first 12 digits
2. Sum digits in odd positions
3. Sum digits in even positions and multiply by 3
4. Add both sums
5. Check digit is `(10 - (sum % 10)) % 10`
6. Check digit must equal digit 13

### Matching

Allowed:

```text
shop_offer.normalized_ean === master_products.ean
```

Not allowed:

```text
shop_offer.title similar to master_products.product_name
shop_offer.sku matches previous offer sku
shop_offer.brand + model resembles known product
AI classification says it is probably the same product
Admin manually maps title to product without approving the EAN
```

### Publishing Rule

An offer may be published only if:

- EAN is present
- EAN normalizes successfully
- EAN format is valid
- EAN checksum is valid
- EAN exists in `master_products`
- Master product is approved
- Master product is active
- Offer required fields are valid
- Shop is active

Otherwise the row is rejected.

## 7. Database Schema

Recommended stack:

- PostgreSQL
- Prisma ORM

### Prisma Schema

```prisma
enum UserRole {
  PUBLIC
  SHOP_OWNER
  ADMIN
}

enum ShopStatus {
  PENDING
  ACTIVE
  SUSPENDED
}

enum ProductStatus {
  PENDING
  APPROVED
  DISABLED
  DELETED
}

enum OfferStatus {
  ACTIVE
  INACTIVE
  REJECTED
}

enum ImportStatus {
  QUEUED
  PROCESSING
  COMPLETED
  FAILED
  PARTIAL
}

enum FeedType {
  CSV
  XML
  API
}

model User {
  id           String   @id @default(cuid())
  email        String   @unique
  passwordHash String
  role         UserRole @default(PUBLIC)
  shopId       String?
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  shop         Shop?    @relation(fields: [shopId], references: [id])
}

model Shop {
  id              String      @id @default(cuid())
  name            String
  slug            String      @unique
  status          ShopStatus  @default(PENDING)
  websiteUrl      String
  logoUrl         String?
  supportEmail    String?
  rating          Decimal?    @db.Decimal(3, 2)
  defaultCurrency String      @default("DKK")
  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt

  users           User[]
  offers          ShopOffer[]
  imports         ProductImport[]
  clicks          ClickTracking[]
}

model Category {
  id              String          @id @default(cuid())
  name            String
  slug            String          @unique
  parentId        String?
  seoTitle        String?
  seoDescription  String?
  createdAt       DateTime        @default(now())
  updatedAt       DateTime        @updatedAt

  parent          Category?       @relation("CategoryTree", fields: [parentId], references: [id])
  children        Category[]      @relation("CategoryTree")
  products        MasterProduct[]
}

model MasterProduct {
  id             String        @id @default(cuid())
  ean            String        @unique
  slug           String
  productName    String
  brand          String?
  categoryId     String?
  imageUrl       String?
  description    String?
  specifications Json?
  status         ProductStatus @default(PENDING)
  approvedAt     DateTime?
  createdAt      DateTime      @default(now())
  updatedAt      DateTime      @updatedAt

  category       Category?     @relation(fields: [categoryId], references: [id])
  offers         ShopOffer[]
  priceHistory   PriceHistory[]

  @@index([slug])
  @@index([status])
  @@index([categoryId])
}

model ShopOffer {
  id             String      @id @default(cuid())
  shopId         String
  masterProductId String
  ean            String
  productTitle   String
  price          Decimal     @db.Decimal(12, 2)
  currency       String
  productUrl     String
  imageUrl       String
  stockStatus    String
  deliveryTime   String
  deliveryDays   Int?
  shippingCost   Decimal     @db.Decimal(12, 2)
  status         OfferStatus @default(ACTIVE)
  sourceImportId String?
  lastSeenAt     DateTime    @default(now())
  createdAt      DateTime    @default(now())
  updatedAt      DateTime    @updatedAt

  shop           Shop          @relation(fields: [shopId], references: [id])
  masterProduct  MasterProduct @relation(fields: [masterProductId], references: [id])
  sourceImport   ProductImport? @relation(fields: [sourceImportId], references: [id])
  clicks         ClickTracking[]

  @@index([ean])
  @@index([shopId])
  @@index([masterProductId])
  @@unique([shopId, ean])
}

model ProductImport {
  id              String       @id @default(cuid())
  shopId          String
  feedType        FeedType
  fileName        String?
  feedUrl         String?
  status          ImportStatus @default(QUEUED)
  totalRows       Int          @default(0)
  acceptedRows    Int          @default(0)
  rejectedRows    Int          @default(0)
  duplicateRows   Int          @default(0)
  startedAt       DateTime?
  finishedAt      DateTime?
  createdAt       DateTime     @default(now())

  shop            Shop         @relation(fields: [shopId], references: [id])
  offers          ShopOffer[]
  errors          ImportError[]
}

model ImportError {
  id             String        @id @default(cuid())
  importId       String
  rowNumber      Int
  rawEan         String?
  normalizedEan  String?
  productTitle   String?
  errorCode      String
  errorMessage   String
  rawPayload     Json
  createdAt      DateTime      @default(now())

  import         ProductImport @relation(fields: [importId], references: [id])

  @@index([importId])
  @@index([normalizedEan])
  @@index([errorCode])
}

model PriceHistory {
  id              String        @id @default(cuid())
  masterProductId String
  shopOfferId     String?
  ean             String
  price           Decimal       @db.Decimal(12, 2)
  currency        String
  shippingCost    Decimal       @db.Decimal(12, 2)
  recordedAt      DateTime      @default(now())

  masterProduct   MasterProduct @relation(fields: [masterProductId], references: [id])

  @@index([ean])
  @@index([masterProductId])
  @@index([recordedAt])
}

model ClickTracking {
  id              String      @id @default(cuid())
  shopId          String
  shopOfferId     String
  masterProductId String
  ean             String
  visitorId       String?
  sessionId       String?
  userAgent       String?
  ipHash          String?
  referrer        String?
  clickedAt       DateTime    @default(now())

  shop            Shop        @relation(fields: [shopId], references: [id])
  shopOffer       ShopOffer   @relation(fields: [shopOfferId], references: [id])

  @@index([ean])
  @@index([shopId])
  @@index([shopOfferId])
  @@index([clickedAt])
}
```

Important relationships:

- `master_products.ean` is unique
- `shop_offers.ean` references `master_products.ean` logically and through `masterProductId`
- Each shop can have many offers
- Each product can have many offers
- Each import can have many import errors

Note: Prisma cannot reference a non-primary unique field in all relation patterns as ergonomically as using IDs, so the schema stores both `masterProductId` and `ean`. Application validation must enforce that `shop_offers.ean` always equals `master_products.ean`.

## 8. Backend Architecture

Recommended stack:

- Next.js App Router for frontend and API routes, or NestJS for a larger backend
- PostgreSQL
- Prisma
- NextAuth/Auth.js or custom JWT sessions
- BullMQ with Redis for background imports
- Zod for request validation
- csv-parse for CSV
- fast-xml-parser for XML

Recommended modules:

- `AuthModule`
- `UsersModule`
- `ShopsModule`
- `MasterProductsModule`
- `OffersModule`
- `ImportsModule`
- `CategoriesModule`
- `ClickTrackingModule`
- `AdminModule`
- `SearchModule`
- `ReportingModule`

## 9. API Endpoint List

### Public API

```http
GET /api/search?q=&category=&minPrice=&maxPrice=&shop=&deliveryTime=&availability=&sort=
GET /api/categories
GET /api/categories/:slug
GET /api/products/:ean
GET /api/products/slug/:slug
GET /api/products/:ean/offers?sort=
GET /api/products/:ean/price-history
POST /api/clicks
```

### Shop Owner API

```http
POST /api/shop/register
GET /api/shop/me
PATCH /api/shop/profile
GET /api/shop/offers
PATCH /api/shop/offers/:id
DELETE /api/shop/offers/:id
POST /api/shop/imports/csv
POST /api/shop/imports/xml
POST /api/shop/imports/api
GET /api/shop/imports
GET /api/shop/imports/:id
GET /api/shop/imports/:id/errors
GET /api/shop/imports/:id/report.csv
```

### Admin API

```http
GET /api/admin/dashboard
POST /api/admin/master-products/upload
GET /api/admin/master-products
POST /api/admin/master-products
GET /api/admin/master-products/:ean
PATCH /api/admin/master-products/:ean
POST /api/admin/master-products/:ean/approve
POST /api/admin/master-products/:ean/disable
DELETE /api/admin/master-products/:ean
GET /api/admin/import-errors
POST /api/admin/import-errors/:id/create-pending-ean
POST /api/admin/import-errors/:id/approve-ean
POST /api/admin/imports/:id/revalidate
GET /api/admin/shops
PATCH /api/admin/shops/:id
GET /api/admin/imports
GET /api/admin/categories
POST /api/admin/categories
PATCH /api/admin/categories/:id
GET /api/admin/clicks
GET /api/admin/commissions
PATCH /api/admin/commissions/:id
GET /api/admin/settings
PATCH /api/admin/settings
```

## 10. Feed Import Validation Flow

When a shop uploads a feed:

1. Create `product_imports` record with status `QUEUED`
2. Store uploaded file or feed URL
3. Queue background job
4. Set import status to `PROCESSING`
5. Parse CSV or XML
6. For each row:
   - Read required fields
   - Normalize EAN
   - Validate EAN format
   - Validate checksum
   - Check duplicate EAN in same feed
   - Check EAN exists in `master_products`
   - Check master product is approved and active
   - Validate price
   - Validate currency
   - Validate URL
   - Validate image URL
   - Validate stock status
   - Validate delivery time
   - Validate shipping cost
7. If row is valid:
   - Upsert `shop_offers` by `[shopId, ean]`
   - Link to `master_products`
   - Store/update price history if price changed
8. If row is invalid:
   - Store row in `import_errors`
   - Do not publish offer
9. Update import counters
10. Set status:
   - `COMPLETED` if no errors
   - `PARTIAL` if some accepted and some rejected
   - `FAILED` if parsing failed or zero valid rows due to fatal error
11. Generate import report

## 11. Import Pseudocode

```ts
async function importFeed(shopId: string, importId: string, rows: FeedRow[]) {
  const seenEans = new Set<string>();

  for (const [index, row] of rows.entries()) {
    const rowNumber = index + 1;
    const normalizedEan = normalizeEan(row.ean);

    const error = validateFeedRow(row, normalizedEan, seenEans);
    if (error) {
      await createImportError(importId, rowNumber, row, normalizedEan, error);
      continue;
    }

    seenEans.add(normalizedEan);

    const masterProduct = await prisma.masterProduct.findUnique({
      where: { ean: normalizedEan }
    });

    if (!masterProduct || masterProduct.status !== "APPROVED") {
      await createImportError(importId, rowNumber, row, normalizedEan, {
        code: "EAN_NOT_APPROVED",
        message: "EAN does not exist in the approved master EAN database."
      });
      continue;
    }

    await prisma.shopOffer.upsert({
      where: {
        shopId_ean: {
          shopId,
          ean: normalizedEan
        }
      },
      create: {
        shopId,
        masterProductId: masterProduct.id,
        ean: normalizedEan,
        productTitle: row.product_title,
        price: row.price,
        currency: row.currency,
        productUrl: row.product_url,
        imageUrl: row.image_url,
        stockStatus: row.stock_status,
        deliveryTime: row.delivery_time,
        shippingCost: row.shipping_cost,
        sourceImportId: importId,
        status: "ACTIVE"
      },
      update: {
        productTitle: row.product_title,
        price: row.price,
        currency: row.currency,
        productUrl: row.product_url,
        imageUrl: row.image_url,
        stockStatus: row.stock_status,
        deliveryTime: row.delivery_time,
        shippingCost: row.shipping_cost,
        sourceImportId: importId,
        lastSeenAt: new Date(),
        status: "ACTIVE"
      }
    });
  }
}
```

## 12. Example CSV Feed Format

```csv
ean,product_title,price,currency,product_url,image_url,stock_status,delivery_time,shipping_cost
5901234123457,AuraPods Pro 2 Wireless Earbuds,899.00,DKK,https://shop.example.com/aurapods-pro-2,https://cdn.example.com/aurapods.jpg,in_stock,1-2 days,0.00
4006381333931,Nord X12 Smartphone 256GB,4799.00,DKK,https://shop.example.com/nord-x12,https://cdn.example.com/nord-x12.jpg,in_stock,2-3 days,29.00
```

## 13. Example XML Feed Format

```xml
<?xml version="1.0" encoding="UTF-8"?>
<products>
  <product>
    <ean>5901234123457</ean>
    <product_title>AuraPods Pro 2 Wireless Earbuds</product_title>
    <price>899.00</price>
    <currency>DKK</currency>
    <product_url>https://shop.example.com/aurapods-pro-2</product_url>
    <image_url>https://cdn.example.com/aurapods.jpg</image_url>
    <stock_status>in_stock</stock_status>
    <delivery_time>1-2 days</delivery_time>
    <shipping_cost>0.00</shipping_cost>
  </product>
  <product>
    <ean>4006381333931</ean>
    <product_title>Nord X12 Smartphone 256GB</product_title>
    <price>4799.00</price>
    <currency>DKK</currency>
    <product_url>https://shop.example.com/nord-x12</product_url>
    <image_url>https://cdn.example.com/nord-x12.jpg</image_url>
    <stock_status>in_stock</stock_status>
    <delivery_time>2-3 days</delivery_time>
    <shipping_cost>29.00</shipping_cost>
  </product>
</products>
```

## 14. Frontend Page Structure

Recommended Next.js App Router structure:

```text
app/
  page.tsx
  search/page.tsx
  c/[categorySlug]/page.tsx
  p/[ean]/[slug]/page.tsx
  shop/login/page.tsx
  shop/dashboard/page.tsx
  shop/feed-upload/page.tsx
  shop/imports/[importId]/page.tsx
  admin/dashboard/page.tsx
  admin/master-eans/page.tsx
  admin/master-eans/[ean]/page.tsx
  admin/shops/page.tsx
  admin/import-logs/page.tsx
  admin/categories/page.tsx
  api/
components/
  public/
    SearchBar.tsx
    ProductCard.tsx
    OfferTable.tsx
    ProductSpecs.tsx
    PriceHistoryChart.tsx
    ProductStructuredData.tsx
  shop/
    ShopSidebar.tsx
    FeedUploadForm.tsx
    ImportReportTable.tsx
  admin/
    AdminSidebar.tsx
    MasterEanTable.tsx
    ImportErrorReview.tsx
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
```

## 15. SEO Architecture

Product URLs:

```text
/p/:ean/:slug
```

Example:

```text
/p/5901234123457/aurapods-pro-2-wireless-earbuds
```

Canonical URL:

```text
https://example.com/p/5901234123457/aurapods-pro-2-wireless-earbuds
```

SEO requirements:

- Product pages generated only for approved master EANs
- Canonical includes EAN
- Slug can change, EAN cannot
- Product schema includes EAN/GTIN
- Offer schema includes price, currency, availability, seller
- Breadcrumb schema on product and category pages
- Server-side rendering for public pages
- Index only approved active products
- Noindex products without approved EAN

## 16. Example Product Structured Data

```json
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "AuraPods Pro 2 Wireless Earbuds",
  "gtin13": "5901234123457",
  "image": "https://cdn.example.com/aurapods.jpg",
  "description": "Wireless earbuds with active noise cancellation and USB-C charging case.",
  "brand": {
    "@type": "Brand",
    "name": "Aura"
  },
  "offers": {
    "@type": "AggregateOffer",
    "priceCurrency": "DKK",
    "lowPrice": "899.00",
    "highPrice": "1049.00",
    "offerCount": "18",
    "offers": [
      {
        "@type": "Offer",
        "price": "899.00",
        "priceCurrency": "DKK",
        "availability": "https://schema.org/InStock",
        "url": "https://shop.example.com/aurapods-pro-2",
        "seller": {
          "@type": "Organization",
          "name": "SoundStreet"
        }
      }
    ]
  }
}
```

## 17. Admin Workflow

### Master EAN Upload

1. Admin uploads master EAN CSV
2. System normalizes each EAN
3. System validates format and checksum
4. Valid EANs are created or updated in `master_products`
5. Invalid rows are rejected in an admin upload report
6. Approved products become eligible for offer matching

### New EAN Approval From Rejected Offer

1. Admin opens rejected import rows
2. Admin filters by `EAN_NOT_APPROVED`
3. Admin reviews raw row and external product evidence
4. Admin creates a pending master product using that EAN
5. Admin enriches product name, brand, category, image, description, and specifications
6. Admin approves the EAN
7. Admin revalidates affected rejected rows
8. Previously rejected shop offers can now be accepted if all other fields are valid

## 18. Shop Owner Workflow

### Initial Setup

1. Shop owner registers
2. Admin approves shop
3. Shop owner completes profile
4. Shop owner uploads CSV/XML feed or configures API
5. Import runs in background
6. Shop owner reviews accepted and rejected rows
7. Accepted offers appear on public product pages

### Ongoing Feed Updates

1. Shop updates feed daily or hourly
2. System imports feed in background
3. Existing offers are updated by `[shopId, ean]`
4. New approved EAN offers are added
5. Missing products can be marked inactive if not seen after a configured period
6. Rejected rows remain visible with reasons

## 19. Security and Permissions

Public:

- Read-only public product and offer endpoints
- Click tracking endpoint with rate limiting

Shop owner:

- Can access only own shop
- Can access only own imports
- Can access only own offers
- Cannot approve EANs
- Cannot edit master products

Admin:

- Full access
- All destructive actions should be audit logged

Recommended:

- Password hashing with Argon2 or bcrypt
- CSRF protection for cookie sessions
- Rate limits on upload and login
- File size limits
- MIME/type validation
- Malware scanning for uploads in production
- Audit logs for admin changes

## 20. Background Jobs

Use background jobs for:

- Large CSV/XML imports
- Feed URL polling
- Revalidating rejected rows after EAN approval
- Price history snapshots
- Sitemap generation
- Product search indexing

Recommended:

- BullMQ
- Redis
- Separate worker process
- Retry policy for transient failures
- Dead-letter queue for failed imports

## 21. MVP Roadmap

### Phase 1: Core EAN Platform

- PostgreSQL + Prisma schema
- Role-based authentication
- Admin master EAN upload
- Shop registration
- CSV feed upload
- EAN normalization and validation
- Import reports
- Public product pages
- Offer table

### Phase 2: Strong Public Comparison Site

- Homepage
- Search results
- Category pages
- Filters and sorting
- SEO-friendly URLs
- Product and Offer structured data
- Price history
- Click tracking

### Phase 3: Shop Owner SaaS

- Shop dashboard
- XML feed support
- API feed support
- Import history
- Rejected row exports
- Offer management
- Feed scheduling

### Phase 4: Admin Operations

- Rejected product review
- Manual EAN approval
- Shop management
- Category management
- Commission management
- Import logs
- Site settings

### Phase 5: Scale and Optimization

- Background jobs
- Search indexing
- Sitemap automation
- Advanced reporting
- Alerting for import failures
- Performance optimization
- Multi-country and multi-currency support

## 23. Large Feed Processing Requirements

Large shop feeds up to 100 MB must be supported and must not be handled as one synchronous request.

Mandatory rules:

- Do not load full XML feeds into memory for production imports.
- Do not parse large XML with one global regular expression over the full document.
- Do not make the browser wait for the full import to finish.
- Do not rely on serverless default request timeouts for feed processing.

Required architecture:

1. API receives feed URL or uploaded file.
2. API creates `product_imports` with status `QUEUED`.
3. Worker fetches or reads the feed as a stream.
4. Parser emits one product row at a time.
5. Worker validates EAN, required fields, and master EAN approval per row.
6. Worker writes accepted offers and rejected errors in batches.
7. Worker checkpoints progress every configured number of rows.
8. Admin/shop UI polls import status and error counts.

Recommended worker limits:

- Maximum feed file size: 100 MB
- Maximum item buffer: 512 KB per XML item
- Maximum rows per import: configurable per shop plan
- Batch database writes: 250-1000 rows per transaction
- Import timeout: worker-level, not HTTP request-level
- Retry failed feed fetches with backoff
- Return `413 FEED_TOO_LARGE` when a submitted feed exceeds 100 MB

The prototype includes:

- `lib/imports/parse-google-merchant-stream.ts`
- `app/api/shop/imports/google/route.ts`
- `scripts/validate-google-feed.mjs`

The provided live feed was tested locally as a stream:

- Total items: 14,460
- Items with GTIN: 11,306
- Target EAN `8715946668031`: found once

## 22. Non-Negotiable Matching Policy

The platform must reject any implementation that attempts to match products using:

- Product title
- Shop SKU
- Manufacturer part number
- Brand
- Category
- Image similarity
- Description similarity
- AI similarity
- Manual name mapping
- Previous import memory
- Fallback heuristics

Only this is valid:

```text
normalized_feed_ean exists in approved active master_products.ean
```

If true:

```text
Create or update shop offer for that master product.
```

If false:

```text
Reject the row and store the reason in import_errors.
```
