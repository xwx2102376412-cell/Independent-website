# RIVET E-BIKES

Local-first US electric bike storefront and a separate administration application built with Next.js, TypeScript, Tailwind CSS, Prisma, and PostgreSQL.

The repository contains two independently runnable applications:

- Storefront: repository root, `http://localhost:3000`
- Admin: `admin-app/`, `http://localhost:3001`

Both applications connect to the same PostgreSQL database. The public storefront does not contain an `/admin` route.

## Local setup

1. Install Docker Desktop or provide PostgreSQL 16 on port 5432.
2. Copy `.env.example` to `.env` and change the session secret and admin password.
3. Start PostgreSQL: `docker compose up -d postgres`.
4. Run `npm run db:migrate -- --name init`.
5. Run `npm run db:seed`.
6. In one PowerShell window, run `npm run dev:storefront` and open `http://localhost:3000`.
7. In a second PowerShell window, run `npm run dev:admin` and open `http://localhost:3001`.

The storefront uses explicit demo data when `DATABASE_URL` is absent. Database writes, checkout, orders, inquiries, and admin operations require PostgreSQL.

## Admin

Open `http://localhost:3001`. Credentials come from `ADMIN_EMAIL` and `ADMIN_PASSWORD`.

The admin application's Next config loads the repository `.env` for local use. When deploying `admin-app/` independently, configure the variables listed in `admin-app/.env.example` on that deployment instead of sharing an environment file.

The admin can create products as drafts; edit names, slugs, English storefront copy, US pricing, motor, speed, range, and featured state; upload and select product images; manage multiple variants and inventory; and publish, unpublish, or republish products. Storefront requests read current PostgreSQL data, so an admin change appears after the storefront page is refreshed. The admin can also manage inquiries and update non-payment order states. It cannot manually mark an order paid.

Uploaded images are stored in `storage/product-images` by default and served by the storefront through `/api/product-images/[filename]`. `PRODUCT_UPLOAD_DIR` can override that directory. When the two applications are deployed to separate machines, both deployments must use shared persistent storage or this local adapter must be replaced with object storage.

## PayPal Sandbox

Create a Sandbox REST app in PayPal Developer, then set:

- `NEXT_PUBLIC_PAYPAL_CLIENT_ID`
- `PAYPAL_CLIENT_SECRET`
- `PAYPAL_WEBHOOK_ID`
- `PAYPAL_ENV=sandbox`

Configure the listener as `/api/paypal/webhook` and subscribe to `PAYMENT.CAPTURE.COMPLETED`. A public HTTPS tunnel is required for PayPal to reach a local machine.

## Verification

Run `npm run lint`, `npm run typecheck`, `npm test`, `npx prisma validate`, and `npm run build`. The default build command builds both applications; use `npm run build:storefront` or `npm run build:admin` to build one application.

Prisma Client is generated during `npm install` through each application's `postinstall` script. Stop running development servers before reinstalling dependencies on Windows so the Prisma query-engine file is not locked.

## Launch blockers

This repository is not cleared for real orders. Before deployment, verify final products and claims, US sales tax obligations, privacy and legal copy, product liability coverage, carrier acceptance for e-bikes and lithium batteries, UN38.3 documentation, dangerous-goods packaging and labeling, fulfillment, returns, warranty operations, email delivery, analytics consent, and live PayPal credentials.

All current products, specifications, inventory, policies, and images are development fixtures.
