import { NextResponse } from "next/server";
import { checkoutSchema } from "@/lib/validation";
import { prisma } from "@/lib/prisma";
import { calculateTotals } from "@/lib/commerce";

export async function POST(request: Request) {
  if (!process.env.DATABASE_URL) return NextResponse.json({ error: "PostgreSQL is not configured. Copy .env.example to .env and run the migration first." }, { status: 503 });
  const parsed = checkoutSchema.safeParse(await request.json()); if (!parsed.success) return NextResponse.json({ error: "Check the delivery fields and cart contents." }, { status: 400 });
  const uniqueIds = [...new Set(parsed.data.items.map(item => item.variantId))];
  const variants = await prisma.variant.findMany({ where: { id: { in: uniqueIds }, active: true, marketVersion: { market: "US", product: { status: "ACTIVE" } } }, include: { inventory: true, marketVersion: { include: { product: true } } } });
  if (variants.length !== uniqueIds.length) return NextResponse.json({ error: "One or more configurations are unavailable." }, { status: 409 });
  const rows = parsed.data.items.map((item) => { const variant = variants.find(row => row.id === item.variantId)!; return { variant, quantity: item.quantity }; });
  const { subtotal, shipping, tax, total } = calculateTotals(rows.map(row => ({ unitPrice: row.variant.price, quantity: row.quantity })));
  const orderNumber = `RVT-${Date.now().toString(36).toUpperCase()}`;
  try {
    const order = await prisma.$transaction(async tx => {
      for (const row of rows) { const inventory = await tx.inventory.findUnique({ where: { variantId: row.variant.id } }); if (!inventory || inventory.onHand - inventory.reserved < row.quantity) throw new Error(`${row.variant.sku} does not have enough inventory.`); await tx.inventory.update({ where: { variantId: row.variant.id }, data: { reserved: { increment: row.quantity } } }); }
      return tx.order.create({ data: { orderNumber, email: parsed.data.email, firstName: parsed.data.firstName, lastName: parsed.data.lastName, phone: parsed.data.phone, address1: parsed.data.address1, address2: parsed.data.address2, city: parsed.data.city, state: parsed.data.state.toUpperCase(), postalCode: parsed.data.postalCode, subtotal, shipping, tax, total, items: { create: rows.map(({ variant, quantity }) => ({ variantId: variant.id, productName: variant.marketVersion.product.name, sku: variant.sku, optionLabel: `${variant.color}, ${variant.batteryWh}Wh, ${variant.tire}`, unitPrice: variant.price, quantity })) } } });
    }, { isolationLevel: "Serializable" });
    return NextResponse.json({ orderNumber: order.orderNumber });
  } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Order could not be created." }, { status: 409 }); }
}
