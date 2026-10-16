import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentCustomer } from "@/lib/customer-auth";
import { prisma } from "@/lib/prisma";

const lineSchema = z.object({ variantId: z.string().min(1), quantity: z.number().int().min(1).max(5) });
const linesSchema = z.object({ items: z.array(lineSchema).max(100) });

const cartInclude = {
  items: {
    orderBy: { createdAt: "asc" as const },
    include: { variant: { include: { marketVersion: { include: { product: true } } } } },
  },
};

async function readCart(customerId: string) {
  const cart = await prisma.cart.upsert({ where: { customerId }, update: {}, create: { customerId }, include: cartInclude });
  return cart.items.map((item) => ({
    variantId: item.variantId,
    market: "US" as const,
    quantity: item.quantity,
    name: item.variant.marketVersion.product.name,
    option: `${item.variant.color}, ${item.variant.batteryWh}Wh, ${item.variant.tire}`,
    price: item.variant.price,
    imageUrl: item.variant.marketVersion.product.imageUrl,
    slug: item.variant.marketVersion.product.slug,
  }));
}

export async function GET() {
  const customer = await getCurrentCustomer();
  if (!customer) return NextResponse.json({ error: "Login required." }, { status: 401 });
  return NextResponse.json({ items: await readCart(customer.id) });
}

export async function POST(request: Request) {
  const customer = await getCurrentCustomer();
  if (!customer) return NextResponse.json({ error: "Login required." }, { status: 401 });
  const parsed = linesSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Cart contents are invalid." }, { status: 400 });
  await prisma.$transaction(async (tx) => {
    const cart = await tx.cart.upsert({ where: { customerId: customer.id }, update: {}, create: { customerId: customer.id } });
    const variants = await tx.variant.findMany({ where: { id: { in: parsed.data.items.map((item) => item.variantId) }, active: true, marketVersion: { market: "US", product: { status: "ACTIVE" } } }, select: { id: true } });
    const validIds = new Set(variants.map((variant) => variant.id));
    for (const line of parsed.data.items) {
      if (!validIds.has(line.variantId)) continue;
      const existing = await tx.cartItem.findUnique({ where: { cartId_variantId: { cartId: cart.id, variantId: line.variantId } } });
      const quantity = Math.min(5, (existing?.quantity ?? 0) + line.quantity);
      await tx.cartItem.upsert({ where: { cartId_variantId: { cartId: cart.id, variantId: line.variantId } }, update: { quantity }, create: { cartId: cart.id, variantId: line.variantId, quantity } });
    }
  });
  return NextResponse.json({ items: await readCart(customer.id) });
}

export async function PATCH(request: Request) {
  const customer = await getCurrentCustomer();
  if (!customer) return NextResponse.json({ error: "Login required." }, { status: 401 });
  const parsed = lineSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Cart contents are invalid." }, { status: 400 });
  const cart = await prisma.cart.findUnique({ where: { customerId: customer.id } });
  if (!cart) return NextResponse.json({ error: "Cart not found." }, { status: 404 });
  await prisma.cartItem.updateMany({ where: { cartId: cart.id, variantId: parsed.data.variantId }, data: { quantity: parsed.data.quantity } });
  return NextResponse.json({ items: await readCart(customer.id) });
}

export async function DELETE(request: Request) {
  const customer = await getCurrentCustomer();
  if (!customer) return NextResponse.json({ error: "Login required." }, { status: 401 });
  const body = await request.json().catch(() => ({})) as { variantId?: string; all?: boolean };
  const cart = await prisma.cart.findUnique({ where: { customerId: customer.id } });
  if (!cart) return NextResponse.json({ items: [] });
  if (body.all) await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
  else if (body.variantId) await prisma.cartItem.deleteMany({ where: { cartId: cart.id, variantId: body.variantId } });
  return NextResponse.json({ items: await readCart(customer.id) });
}
