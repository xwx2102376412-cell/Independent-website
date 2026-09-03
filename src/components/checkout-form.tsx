"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/components/cart-provider";
import { money } from "@/lib/demo-products";

const fields = [
  ["firstName", "First name", "given-name"], ["lastName", "Last name", "family-name"], ["email", "Email", "email"], ["phone", "Phone (optional)", "tel"],
  ["address1", "Street address", "address-line1"], ["address2", "Apartment or suite (optional)", "address-line2"], ["city", "City", "address-level2"], ["state", "State code", "address-level1"], ["postalCode", "ZIP code", "postal-code"],
] as const;

export function CheckoutForm() {
  const { items, hydrated, clear } = useCart(); const router = useRouter(); const [error, setError] = useState(""); const [loading, setLoading] = useState(false);
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0); const estimatedShipping = subtotal >= 150000 ? 0 : 9900;
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setLoading(true); setError(""); const data = Object.fromEntries(new FormData(event.currentTarget));
    try { const response = await fetch("/api/checkout", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ ...data, items: items.map(({ variantId, market, quantity }) => ({ variantId, market, quantity })) }) }); const result = await response.json(); if (!response.ok) throw new Error(result.error ?? "Checkout could not be created."); clear(); router.push(`/order/${result.orderNumber}`); } catch (err) { setError(err instanceof Error ? err.message : "Checkout could not be created."); } finally { setLoading(false); }
  }
  if (!hydrated) return <div className="mt-10 h-48 max-w-3xl animate-pulse rounded-xl bg-[var(--surface)]" aria-busy="true" />;
  if (!items.length) return <p className="mt-10 rounded-lg border border-[var(--line)] p-5">Your cart is empty.</p>;
  return <form onSubmit={submit} className="mt-10 grid gap-10 lg:grid-cols-[1fr_380px]"><div className="grid gap-5 sm:grid-cols-2">{fields.map(([name, label, autoComplete], i) => <label key={name} className={`grid gap-2 ${[2,4,5].includes(i) ? "sm:col-span-2" : ""}`}><span className="text-sm font-bold">{label}</span><input required={!label.includes("optional")} name={name} type={name === "email" ? "email" : "text"} autoComplete={autoComplete} maxLength={150} className="focus-ring rounded-lg border border-[var(--line)] bg-[var(--surface)] px-4 py-3 placeholder:text-[var(--muted)]" /></label>)}<input type="hidden" name="country" value="US" />{error && <p role="alert" className="sm:col-span-2 rounded-lg border border-red-700 bg-red-950/20 p-4 text-sm text-red-700 dark:text-red-300">{error}</p>}</div><aside className="h-fit rounded-xl border border-[var(--line)] bg-[var(--surface)] p-6"><h2 className="text-xl font-black">Server-verified total</h2><div className="mt-5 grid gap-3 text-sm"><div className="flex justify-between"><span>Displayed subtotal</span><span>{money(subtotal)}</span></div><div className="flex justify-between"><span>Estimated shipping</span><span>{money(estimatedShipping)}</span></div><div className="flex justify-between"><span>Tax</span><span>$0 / calculated later</span></div></div><div className="mt-5 border-t border-[var(--line)] pt-5 text-xs leading-5 text-[var(--muted)]">The server reloads SKU, market, inventory, and price before creating a pending order.</div><button disabled={loading} className="focus-ring mt-6 w-full rounded-lg bg-[var(--accent)] px-5 py-4 font-black text-[#171819] disabled:opacity-60">{loading ? "Creating order..." : "Create pending order"}</button></aside></form>;
}
