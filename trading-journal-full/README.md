# Trading Journal Full App

A Next.js trading journal with:

- Email/password login
- Prisma database models
- CSV trade import
- Analytics API
- Equity curve API
- Dashboard
- Chart component starter

## Start

```bash
npm install
cp .env.example .env
```

Add your real Postgres database URL to `.env`.

Then:

```bash
npx prisma migrate dev --name init
npm run dev
```

Open:

```text
http://localhost:3000
```

## Deploy

Use Vercel.

Add these environment variables in Vercel:

```text
DATABASE_URL
NEXTAUTH_SECRET
NEXTAUTH_URL
```

For production, `NEXTAUTH_URL` should be your live domain.
