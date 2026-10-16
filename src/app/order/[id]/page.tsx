import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { money } from "@/lib/demo-products";
import { getCurrentCustomer } from "@/lib/customer-auth";
import { redirect } from "next/navigation";

export default async function OrderPage({ params }: { params: Promise<{ id: string }> }) {
  if (!process.env.DATABASE_URL) notFound();
  const customer = await getCurrentCustomer();
  if (!customer) redirect(`/login?next=/order/${encodeURIComponent((await params).id)}`);
  const order = await prisma.order.findFirst({ where: { orderNumber: (await params).id, customerId: customer.id }, include: { items: true } });
  if (!order) notFound();
  return <main className="shell py-16"><p className="eyebrow text-[var(--accent)]">Purchase complete / Paid</p><h1 className="display mt-5 text-6xl sm:text-8xl">THANK YOU.</h1><p className="mt-6 max-w-2xl text-lg text-[var(--muted)]">Your simulated purchase is complete. Order {order.orderNumber} is now marked paid and saved to your account.</p><div className="mt-10 grid gap-8 lg:grid-cols-[1fr_400px]"><section className="machine-panel p-6 sm:p-8"><p className="micro-label">Order record</p><h2 className="mt-3 text-xl font-black uppercase">Order details</h2><div className="mt-6 grid gap-5">{order.items.map(item => <div key={item.id} className="flex justify-between gap-6 border-t border-[var(--line)] pt-4"><div><strong>{item.productName}</strong><p className="mt-1 text-sm text-[var(--muted)]">{item.optionLabel} / Qty {item.quantity}</p></div><span className="font-bold">{money(item.unitPrice * item.quantity)}</span></div>)}</div><div className="mt-6 flex justify-between border-t border-[var(--line)] pt-5 text-xl font-black"><span>Total</span><span className="text-[var(--accent)]">{money(order.total)}</span></div></section><aside className="machine-panel h-fit p-6"><p className="micro-label text-[var(--accent)]">Status / PAID</p><h2 className="mt-3 text-xl font-black uppercase">Saved to your account</h2><p className="mt-3 text-sm leading-6 text-[var(--muted)]">You can review this order and future purchases from your account.</p><a href="/account/orders" className="machine-button focus-ring mt-6">View my orders</a></aside></div></main>;
}
