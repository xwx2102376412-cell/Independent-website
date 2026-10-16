import { NextResponse } from "next/server";
import { checkoutSchema } from "@/lib/validation";
import { prisma } from "@/lib/prisma";
import { calculateTotals } from "@/lib/commerce";
import { getCurrentCustomer } from "@/lib/customer-auth";
import { sendOrderEmail } from "@/lib/mail";

export async function POST(request: Request) {
  if (!process.env.DATABASE_URL) return NextResponse.json({ error: "PostgreSQL is not configured. Copy .env.example to .env and run the migration first." }, { status: 503 });
  const customer = await getCurrentCustomer();
  if (!customer) return NextResponse.json({ error: "Please log in before checkout." }, { status: 401 });
  const parsed = checkoutSchema.safeParse(await request.json()); if (!parsed.success) return NextResponse.json({ error: "Check the delivery fields and cart contents." }, { status: 400 });
  const cart = await prisma.cart.findUnique({ where: { customerId: customer.id }, include: { items: { include: { variant: { include: { inventory: true, marketVersion: { include: { product: true } } } } } } } });
  if (!cart?.items.length) return NextResponse.json({ error: "Your cart is empty." }, { status: 409 });
  const rows = cart.items.map((item) => ({ variant: item.variant, quantity: item.quantity }));
  if (rows.some(({ variant }) => !variant.active || variant.marketVersion.market !== "US" || variant.marketVersion.product.status !== "ACTIVE")) return NextResponse.json({ error: "One or more configurations are unavailable." }, { status: 409 });
  const { subtotal, shipping, tax, total } = calculateTotals(rows.map(row => ({ unitPrice: row.variant.price, quantity: row.quantity })));
  const orderNumber = `RVT-${Date.now().toString(36).toUpperCase()}`;
  try {
    const order = await prisma.$transaction(async tx => {
      for (const row of rows) { const inventory = await tx.inventory.findUnique({ where: { variantId: row.variant.id } }); if (!inventory || inventory.onHand - inventory.reserved < row.quantity) throw new Error(`${row.variant.sku} does not have enough inventory.`); await tx.inventory.update({ where: { variantId: row.variant.id }, data: { onHand: { decrement: row.quantity } } }); }
      const created = await tx.order.create({ data: { customerId: customer.id, orderNumber, email: customer.email, firstName: parsed.data.firstName, lastName: parsed.data.lastName, phone: parsed.data.phone, address1: parsed.data.address1, address2: parsed.data.address2, city: parsed.data.city, state: parsed.data.state.toUpperCase(), postalCode: parsed.data.postalCode, status: "PAID", subtotal, shipping, tax, total, items: { create: rows.map(({ variant, quantity }) => ({ variantId: variant.id, productName: variant.marketVersion.product.name, sku: variant.sku, optionLabel: `${variant.color}, ${variant.batteryWh}Wh, ${variant.tire}`, unitPrice: variant.price, quantity })) } } });
      await tx.cartItem.deleteMany({ where: { cartId: cart.id } });
      return created;
    }, { isolationLevel: "Serializable" });
    await sendOrderEmail(order.orderNumber, order.email);
    return NextResponse.json({ orderNumber: order.orderNumber });
  } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Order could not be created." }, { status: 409 }); }
}
