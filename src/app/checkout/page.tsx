import type { Metadata } from "next";
import { CheckoutForm } from "@/components/checkout-form";
import { getCurrentCustomer } from "@/lib/customer-auth";
import { redirect } from "next/navigation";
export const metadata: Metadata = { title: "Checkout" };
export default async function CheckoutPage() { const customer = await getCurrentCustomer(); if (!customer) redirect("/login?next=/checkout"); return <main className="shell py-14 sm:py-20"><div className="max-w-3xl"><p className="eyebrow text-[var(--accent)]">Checkout protocol / 01</p><h1 className="display mt-5 text-5xl sm:text-7xl">DELIVERY DETAILS.</h1><p className="mt-6 max-w-2xl text-[var(--muted)]">Complete the simulated purchase for {customer.email}. This development checkout supports the contiguous United States only.</p></div><CheckoutForm /></main>; }
