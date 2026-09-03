import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { inquirySchema } from "@/lib/validation";

export async function POST(request: Request) {
  if (!process.env.DATABASE_URL) return NextResponse.json({ error: "PostgreSQL is not configured." }, { status: 503 });
  const parsed = inquirySchema.safeParse(await request.json()); if (!parsed.success) return NextResponse.json({ error: "Check the inquiry fields." }, { status: 400 });
  const inquiry = await prisma.inquiry.create({ data: parsed.data }); return NextResponse.json({ id: inquiry.id }, { status: 201 });
}
