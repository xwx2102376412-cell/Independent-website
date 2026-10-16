import { NextResponse } from "next/server";
import { customerCredentialsSchema } from "@/lib/validation";
import { prisma } from "@/lib/prisma";
import { createCustomerSession, verifyCustomerPassword } from "@/lib/customer-auth";

export async function POST(request: Request) {
  const parsed = customerCredentialsSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Enter a valid email and password." }, { status: 400 });
  const customer = await prisma.customer.findUnique({ where: { email: parsed.data.email.trim().toLowerCase() } });
  if (!customer || !(await verifyCustomerPassword(parsed.data.password, customer.passwordHash))) return NextResponse.json({ error: "Email or password is incorrect." }, { status: 401 });
  await prisma.cart.upsert({ where: { customerId: customer.id }, update: {}, create: { customerId: customer.id } });
  await createCustomerSession(customer.id);
  return NextResponse.json({ email: customer.email });
}
