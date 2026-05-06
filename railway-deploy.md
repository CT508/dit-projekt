# Railway Deploy Checklist

## Goal

Deploy the first live test environment without a custom domain.

Railway will provide a URL like:

```text
https://your-app-name.up.railway.app
```

## 1. Push Project To GitHub

Create a new GitHub repository and upload this project folder.

Do not commit:

- `.env`
- `node_modules`
- `.next`
- `live-feed.xml`

These are covered by `.gitignore`.

## 2. Create Railway Project

In Railway:

```text
New Project -> Deploy from GitHub repo
```

Select the repo.

Railway should detect the project as a Next.js app.

## 3. Add PostgreSQL

In the same Railway project:

```text
New -> Database -> PostgreSQL
```

Copy/attach the generated `DATABASE_URL` to the web app service.

## 4. Add Redis

In the same Railway project:

```text
New -> Database -> Redis
```

Copy/attach the generated `REDIS_URL` to the web app service.

Redis is mainly for the later background worker import queue.

## 5. Add Environment Variables

Set these on the Railway web service:

```env
DATABASE_URL="provided-by-railway-postgres"
REDIS_URL="provided-by-railway-redis"
NEXTAUTH_SECRET="generate-a-long-random-string"
NEXTAUTH_URL="https://your-app-name.up.railway.app"
MAX_FEED_BYTES="104857600"
LIVE_GOOGLE_FEED_URL="https://feed.bewise.dk/feed/generate?id=d4e695ee-4ccb-4f5a-9224-2a983ca7cc26&siteId=26&type=google"
```

For test users:

```env
ADMIN_EMAIL="your-admin-email"
ADMIN_PASSWORD="temporary-test-password"
SHOP_OWNER_EMAIL="your-shop-email"
SHOP_OWNER_PASSWORD="temporary-test-password"
```

## 6. Build Command

Railway should use Railpack via `railway.json`:

```bash
npm run prisma:generate && npm run build
```

Start command:

```bash
npm run start
```

If Railway shows a Nixpacks `$NIXPACKS_PATH` build error, make sure the latest committed `railway.json` uses:

```json
{
  "build": {
    "builder": "RAILPACK"
  }
}
```

## 7. Database Migration

After the first successful deploy, run:

```bash
npx prisma migrate deploy
```

For MVP testing we still need to add a seed script before the database-backed version is fully live.

## 8. First Test URLs

Once deployed:

```text
/
/search?q=epson
/p/8715946668031/epson-cyan-t44j2-700-ml-blaekpatron
/admin/dashboard
/admin/master-eans
/shop/dashboard
/shop/feed-upload
```

## Important Current Status

The current Next.js app is deployable as a live prototype, but public data still comes from:

```text
lib/data/mock-data.ts
```

Next engineering step:

Replace mock data with Prisma queries and add seed/import persistence.
