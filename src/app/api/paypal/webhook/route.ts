import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPayPalWebhook } from "@/lib/paypal";
import { sendOrderEmail } from "@/lib/mail";

type PayPalEvent = { id: string; event_type: string; resource?: { supplementary_data?: { related_ids?: { order_id?: string } } } };

export async function POST(request: Request) {
  const event = await request.json() as PayPalEvent; if (!event.id || !(await verifyPayPalWebhook(request, event))) return NextResponse.json({ error: "Invalid PayPal signature." }, { status: 401 });
  const paypalOrderId = event.resource?.supplementary_data?.related_ids?.order_id;
  await prisma.$transaction(async tx => {
    const existing = await tx.paymentEvent.findUnique({ where: { eventId: event.id } }); if (existing) return;
    const order = paypalOrderId ? await tx.order.findUnique({ where: { paypalOrderId }, include: { items: true } }) : null;
    await tx.paymentEvent.create({ data: { provider: "paypal", eventId: event.id, eventType: event.event_type, orderId: order?.id, payload: event, processed: Boolean(order) } });
    if (order && event.event_type === "PAYMENT.CAPTURE.COMPLETED" && order.status !== "PAID") {
      await tx.order.update({ where: { id: order.id }, data: { status: "PAID" } });
      for (const item of order.items) await tx.inventory.update({ where: { variantId: item.variantId }, data: { onHand: { decrement: item.quantity }, reserved: { decrement: item.quantity } } });
      await sendOrderEmail(order.orderNumber, order.email);
    }
  });
  return NextResponse.json({ received: true });
}
