# RIVET E-BIKES

Local-first US electric bike storefront built with Next.js, TypeScript, Tailwind CSS, Prisma, and PostgreSQL.

## Local setup

1. Install Docker Desktop or provide PostgreSQL 16 on port 5432.
2. Copy `.env.example` to `.env` and change the session secret and admin password.
3. Start PostgreSQL: `docker compose up -d postgres`.
4. Run `npm run db:migrate -- --name init`.
5. Run `npm run db:seed`.
6. Run `npm run dev` and open `http://localhost:3000`.

The storefront uses explicit demo data when `DATABASE_URL` is absent. Database writes, checkout, orders, inquiries, and admin CRUD require PostgreSQL.

## Admin

Open `http://localhost:3000/admin`. Credentials come from `ADMIN_EMAIL` and `ADMIN_PASSWORD`.

The admin can create and edit products, archive products, update variant stock, manage inquiries, and update non-payment order states. It cannot manually mark an order paid.

## PayPal Sandbox

Create a Sandbox REST app in PayPal Developer, then set:

- `NEXT_PUBLIC_PAYPAL_CLIENT_ID`
- `PAYPAL_CLIENT_SECRET`
- `PAYPAL_WEBHOOK_ID`
- `PAYPAL_ENV=sandbox`

Configure the listener as `/api/paypal/webhook` and subscribe to `PAYMENT.CAPTURE.COMPLETED`. A public HTTPS tunnel is required for PayPal to reach a local machine.

## Verification

Run `npm run lint`, `npm run typecheck`, `npm test`, `npx prisma validate`, and `npm run build`.

## Launch blockers

This repository is not cleared for real orders. Before deployment, verify final products and claims, US sales tax obligations, privacy and legal copy, product liability coverage, carrier acceptance for e-bikes and lithium batteries, UN38.3 documentation, dangerous-goods packaging and labeling, fulfillment, returns, warranty operations, email delivery, analytics consent, and live PayPal credentials.

All current products, specifications, inventory, policies, and images are development fixtures.
