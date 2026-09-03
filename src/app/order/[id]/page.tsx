import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { money } from "@/lib/demo-products";
import { PayPalPanel } from "@/components/paypal-panel";

export default async function OrderPage({ params }: { params: Promise<{ id: string }> }) {
  if (!process.env.DATABASE_URL) notFound(); const order = await prisma.order.findUnique({ where: { orderNumber: (await params).id }, include: { items: true } }); if (!order) notFound();
  return <main className="shell py-16"><p className="eyebrow text-[var(--accent)]">Pending order</p><h1 className="display mt-4 text-5xl">{order.orderNumber}</h1><div className="mt-10 grid gap-8 lg:grid-cols-[1fr_400px]"><section className="rounded-xl border border-[var(--line)] p-6"><h2 className="text-xl font-black">Order details</h2><div className="mt-6 grid gap-5">{order.items.map(item => <div key={item.id} className="flex justify-between gap-6 border-t border-[var(--line)] pt-4"><div><strong>{item.productName}</strong><p className="mt-1 text-sm text-[var(--muted)]">{item.optionLabel} / Qty {item.quantity}</p></div><span className="font-bold">{money(item.unitPrice * item.quantity)}</span></div>)}</div><div className="mt-6 flex justify-between border-t border-[var(--line)] pt-5 text-xl font-black"><span>Total</span><span>{money(order.total)}</span></div></section><PayPalPanel orderNumber={order.orderNumber} status={order.status} total={order.total} /></div></main>;
}
