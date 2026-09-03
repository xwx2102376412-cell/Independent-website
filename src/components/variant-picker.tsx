"use client";

import { useState } from "react";
import { Check, ShoppingCart } from "@phosphor-icons/react";
import { useCart } from "@/components/cart-provider";
import { money, type StoreProduct } from "@/lib/demo-products";

export function VariantPicker({ product }: { product: StoreProduct }) {
  const [selected, setSelected] = useState(product.variants[0]);
  const [added, setAdded] = useState(false);
  const { add } = useCart();
  const handleAdd = () => {
    add({ variantId: selected.id, market: "US", quantity: 1, name: product.name, option: `${selected.color}, ${selected.batteryWh}Wh, ${selected.tire}`, price: selected.price, imageUrl: product.imageUrl, slug: product.slug });
    setAdded(true); window.setTimeout(() => setAdded(false), 1800);
  };
  return <div><h2 className="text-sm font-bold">Choose configuration</h2><div className="mt-4 grid gap-3">{product.variants.map((variant) => <button type="button" key={variant.id} onClick={() => setSelected(variant)} className={`focus-ring grid w-full grid-cols-[auto_1fr_auto] items-center gap-4 rounded-lg border p-4 text-left ${selected.id === variant.id ? "border-[var(--accent)] bg-[var(--surface)]" : "border-[var(--line)]"}`}><span className="h-7 w-7 rounded-full border border-[var(--line)]" style={{ backgroundColor: variant.colorHex }} /><span><strong className="block">{variant.color}</strong><span className="text-xs text-[var(--muted)]">{variant.batteryWh}Wh / {variant.tire}</span></span><span className="font-black">{money(variant.price)}</span></button>)}</div><button onClick={handleAdd} disabled={selected.stock < 1} className="focus-ring mt-5 flex w-full items-center justify-center gap-3 rounded-lg bg-[var(--accent)] px-6 py-4 font-black text-[#171819] disabled:opacity-50">{added ? <><Check size={20} weight="bold" /> Added to cart</> : <><ShoppingCart size={20} weight="bold" /> Add to cart</>}</button><p className="mt-3 text-center text-xs text-[var(--muted)]">{selected.stock} sample units available. Final price is verified at checkout.</p></div>;
}
