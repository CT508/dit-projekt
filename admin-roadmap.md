# Admin Roadmap

## What Exists Now

The admin UI now includes:

- Admin dashboard with work queue
- Master product list
- Add master product form
- Edit master product form
- SEO title, meta description and canonical URL fields
- Product description and specifications editor
- Product image gallery fields
- Shop management
- Import logs and rejected row review
- Category management
- Site settings

## Next Required Step

The current admin UI is still a live prototype. The next step is persistence:

- Create Prisma CRUD queries for `master_products`
- Add POST/PATCH API routes for admin product create/edit
- Store gallery images in `master_products.gallery`
- Store SEO data in `master_products.seoTitle`, `seoDescription`, `canonicalUrl`
- Add authentication and admin-only guards
- Save shop settings, category settings and site settings to PostgreSQL

## Important Rule

Admin may create or approve EAN records, but shop offers still match only by approved EAN.

SKU, title, image, brand and category remain metadata only.

