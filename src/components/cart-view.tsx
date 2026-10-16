"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Trash } from "@phosphor-icons/react";
import { useCart } from "@/components/cart-provider";
import { money } from "@/lib/demo-products";

export function CartView() {
  const { items, hydrated, remove, update } = useCart();
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  if (!hydrated) return <section aria-busy="true"><div className="h-14 w-64 animate-pulse bg-[var(--surface)]" /><div className="mt-10 h-48 max-w-3xl animate-pulse bg-[var(--surface)]" /></section>;
  if (!items.length) return <section className="min-h-[52dvh] max-w-2xl"><p className="eyebrow text-[var(--accent)]">Loadout / Empty</p><h1 className="display mt-5 text-5xl sm:text-6xl">YOUR NEXT MACHINE STARTS HERE.</h1><p className="mt-6 text-[var(--muted)]">Choose a bike and its exact configuration to get started.</p><Link href="/bikes" className="machine-button focus-ring mt-8">Browse machines</Link></section>;

  return <>
    <p className="eyebrow text-[var(--accent)]">Loadout / {items.length.toString().padStart(2, "0")}</p><h1 className="display mt-5 text-5xl sm:text-7xl">YOUR CART.</h1>
    <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_380px]">
      <div className="grid gap-4">
        {items.map((item, index) => <article key={item.variantId} className="machine-panel grid grid-cols-[110px_1fr] gap-5 p-4 sm:grid-cols-[180px_1fr]">
          <Image src={item.imageUrl} alt={item.name} width={320} height={240} priority={index === 0} className="aspect-square h-full object-cover saturate-[.7] contrast-[1.08]" />
          <div className="flex min-w-0 flex-col">
            <Link className="focus-ring text-xl font-black" href={`/bikes/${item.slug}`}>{item.name}</Link>
            <p className="mt-1 text-sm text-[var(--muted)]">{item.option}</p><p className="mt-3 font-bold">{money(item.price)}</p>
            <div className="mt-auto flex items-center justify-between pt-5"><div className="flex items-center border border-[var(--line)]"><button className="focus-ring p-2" onClick={() => update(item.variantId, item.quantity - 1)} aria-label="Decrease quantity"><Minus size={16} /></button><span className="w-8 text-center text-sm font-bold">{item.quantity}</span><button className="focus-ring p-2" onClick={() => update(item.variantId, item.quantity + 1)} aria-label="Increase quantity"><Plus size={16} /></button></div><button className="focus-ring p-2 text-[var(--muted)] hover:text-[var(--danger)]" onClick={() => remove(item.variantId)} aria-label={`Remove ${item.name}`}><Trash size={19} /></button></div>
          </div>
        </article>)}
      </div>
      <aside className="machine-panel h-fit p-6"><p className="micro-label">Order protocol</p><h2 className="mt-3 text-xl font-black uppercase">Summary</h2><div className="mt-6 flex justify-between border-y border-[var(--line)] py-4 text-sm"><span>Sample subtotal</span><strong className="text-[var(--accent)]">{money(subtotal)}</strong></div><p className="mt-4 text-xs leading-5 text-[var(--muted)]">Shipping and current inventory are recalculated by the server at checkout. Client prices are never trusted.</p><Link href="/checkout" className="machine-button focus-ring mt-6 w-full">Continue to checkout</Link></aside>
    </div>
  </>;
}
