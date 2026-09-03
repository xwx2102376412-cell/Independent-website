import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { paypalRequest } from "@/lib/paypal";

export async function GET(request: Request) {
  const url = new URL(request.url); const paypalOrderId = url.searchParams.get("token"); const orderNumber = url.searchParams.get("order"); const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? url.origin;
  if (!paypalOrderId || !orderNumber) return NextResponse.redirect(`${appUrl}/cart`);
  const order = await prisma.order.findUnique({ where: { orderNumber } }); if (!order || order.paypalOrderId !== paypalOrderId) return NextResponse.redirect(`${appUrl}/order/${orderNumber}?payment=invalid`);
  const response = await paypalRequest(`/v2/checkout/orders/${encodeURIComponent(paypalOrderId)}/capture`, { method: "POST", headers: { "PayPal-Request-Id": `${order.id}-capture` } });
  if (response.ok) await prisma.order.update({ where: { id: order.id }, data: { status: "APPROVED" } });
  return NextResponse.redirect(`${appUrl}/order/${orderNumber}?payment=${response.ok ? "processing" : "failed"}`);
}
