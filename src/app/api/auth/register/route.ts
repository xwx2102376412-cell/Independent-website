import { NextResponse } from "next/server";
import { customerCredentialsSchema } from "@/lib/validation";
import { prisma } from "@/lib/prisma";
import { createCustomerSession, hashCustomerPassword } from "@/lib/customer-auth";

export async function POST(request: Request) {
  const parsed = customerCredentialsSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Enter a valid email and a password with at least 8 characters." }, { status: 400 });
  const email = parsed.data.email.trim().toLowerCase();
  const existing = await prisma.customer.findUnique({ where: { email }, select: { id: true } });
  if (existing) return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 });
  const customer = await prisma.customer.create({ data: { email, passwordHash: await hashCustomerPassword(parsed.data.password), cart: { create: {} } } });
  await createCustomerSession(customer.id);
  return NextResponse.json({ email: customer.email });
}
