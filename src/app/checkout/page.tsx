import type { Metadata } from "next";
import { CheckoutForm } from "@/components/checkout-form";
export const metadata: Metadata = { title: "Checkout" };
export default function CheckoutPage() { return <main className="shell py-14 sm:py-20"><div className="max-w-2xl"><p className="eyebrow text-[var(--accent)]">Secure local checkout</p><h1 className="display mt-4 text-5xl">DELIVERY DETAILS.</h1><p className="mt-5 text-[var(--muted)]">This development checkout supports the contiguous United States only.</p></div><CheckoutForm /></main>; }
