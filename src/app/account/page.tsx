import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentCustomer } from "@/lib/customer-auth";
import { prisma } from "@/lib/prisma";
import { CustomerLogoutButton } from "@/components/customer-logout-button";

export const metadata: Metadata = { title: "My account" };

export default async function AccountPage() {
  const customer = await getCurrentCustomer();
  if (!customer) redirect("/login?next=/account");
  const [orderCount, latestOrder] = await Promise.all([
    prisma.order.count({ where: { customerId: customer.id } }),
    prisma.order.findFirst({ where: { customerId: customer.id }, orderBy: { createdAt: "desc" }, select: { orderNumber: true, status: true, total: true } }),
  ]);
  return <main className="shell py-16"><p className="eyebrow text-[var(--accent)]">Rider profile / Active</p><h1 className="display mt-5 text-6xl sm:text-8xl">YOUR ACCOUNT.</h1><p className="mt-6 text-[var(--muted)]">Signed in as {customer.email}</p><div className="mt-10 grid gap-5 md:grid-cols-2"><Link href="/account/orders" className="machine-panel focus-ring p-6 sm:p-8"><span className="micro-label">Order history</span><strong className="mt-5 block text-5xl tracking-[-.08em] text-[var(--accent)]">{orderCount.toString().padStart(2, "0")}</strong><span className="mt-4 block text-sm font-black uppercase tracking-[.1em]">View my orders</span></Link><section className="machine-panel p-6 sm:p-8"><span className="micro-label">Latest order</span>{latestOrder ? <><strong className="mt-5 block text-xl">{latestOrder.orderNumber}</strong><p className="mt-3 text-sm text-[var(--muted)]"><span className="text-[var(--accent)]">{latestOrder.status}</span> / ${(latestOrder.total / 100).toFixed(2)}</p></> : <p className="mt-5 text-sm text-[var(--muted)]">No purchases yet.</p>}</section></div><div className="mt-8"><CustomerLogoutButton /></div></main>;
}
