import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentCustomer } from "@/lib/customer-auth";
import { prisma } from "@/lib/prisma";
import { money } from "@/lib/demo-products";

export const metadata: Metadata = { title: "My orders" };

export default async function OrdersPage() {
  const customer = await getCurrentCustomer();
  if (!customer) redirect("/login?next=/account/orders");
  const orders = await prisma.order.findMany({ where: { customerId: customer.id }, orderBy: { createdAt: "desc" }, include: { items: { select: { productName: true, quantity: true } } } });
  return <main className="shell py-16"><p className="eyebrow text-[var(--accent)]">Rider profile / Orders</p><h1 className="display mt-5 text-6xl sm:text-8xl">MY ORDERS.</h1><p className="mt-6 text-[var(--muted)]">Purchases associated with {customer.email}.</p>{orders.length ? <div className="mt-10 grid gap-3">{orders.map((order, index) => <Link key={order.id} href={`/order/${order.orderNumber}`} className="focus-ring grid gap-5 border border-[var(--line)] p-6 transition hover:border-[var(--accent)] hover:bg-[var(--surface)] sm:grid-cols-[56px_1fr_auto]"><span className="micro-label">{(index + 1).toString().padStart(2, "0")}</span><div><strong className="text-xl">{order.orderNumber}</strong><p className="mt-2 text-sm text-[var(--muted)]">{order.items.map((item) => `${item.productName} × ${item.quantity}`).join(", ")}</p></div><div className="sm:text-right"><span className="micro-label block text-[var(--accent)]">{order.status}</span><strong className="mt-2 block">{money(order.total)}</strong></div></Link>)}</div> : <div className="machine-panel mt-10 p-6"><p className="text-[var(--muted)]">No purchases yet.</p><Link className="machine-button focus-ring mt-5" href="/bikes">Browse machines</Link></div>}</main>;
}
