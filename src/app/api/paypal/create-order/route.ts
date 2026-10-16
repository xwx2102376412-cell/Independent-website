import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { paypalRequest } from "@/lib/paypal";

export async function POST(request: Request) {
  if (!process.env.DATABASE_URL) return NextResponse.json({ error: "PostgreSQL is not configured." }, { status: 503 });
  const { orderNumber } = await request.json(); const order = await prisma.order.findUnique({ where: { orderNumber } });
  if (!order || order.status !== "PENDING") return NextResponse.json({ error: "Pending order not found." }, { status: 404 });
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const response = await paypalRequest("/v2/checkout/orders", { method: "POST", headers: { "PayPal-Request-Id": order.id }, body: JSON.stringify({ intent: "CAPTURE", purchase_units: [{ reference_id: order.orderNumber, custom_id: order.id, amount: { currency_code: order.currency, value: (order.total / 100).toFixed(2) } }], application_context: { brand_name: "TUKEN OX", landing_page: "LOGIN", user_action: "PAY_NOW", return_url: `${appUrl}/api/paypal/capture?order=${encodeURIComponent(order.orderNumber)}`, cancel_url: `${appUrl}/order/${encodeURIComponent(order.orderNumber)}` } }) });
  const data = await response.json() as { id?: string; links?: { rel: string; href: string }[]; message?: string };
  if (!response.ok || !data.id) return NextResponse.json({ error: data.message ?? "PayPal order could not be created." }, { status: 502 });
  await prisma.order.update({ where: { id: order.id }, data: { paypalOrderId: data.id } });
  return NextResponse.json({ approveUrl: data.links?.find(link => link.rel === "approve")?.href });
}
