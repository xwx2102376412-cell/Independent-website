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
  return <div><h2 className="micro-label text-[var(--foreground)]">Select configuration</h2><div className="mt-4 grid gap-2">{product.variants.map((variant, index) => <button type="button" key={variant.id} onClick={() => setSelected(variant)} className={`focus-ring grid w-full grid-cols-[auto_1fr_auto] items-center gap-4 border p-4 text-left transition ${selected.id === variant.id ? "border-[var(--accent)] bg-[var(--surface-strong)]" : "border-[var(--line)] hover:border-[var(--line-strong)]"}`}><span className="micro-label">0{index + 1}</span><span><strong className="block uppercase tracking-[-.02em]">{variant.color}</strong><span className="text-xs text-[var(--muted)]">{variant.batteryWh}Wh / {variant.tire}</span></span><span className="font-black">{money(variant.price)}</span></button>)}</div><button onClick={handleAdd} disabled={selected.stock < 1} className="machine-button focus-ring mt-5 w-full disabled:opacity-50">{added ? <><Check size={20} weight="bold" /> Added to cart</> : <><ShoppingCart size={20} weight="bold" /> Add to cart</>}</button><p className="mt-3 text-center text-[10px] font-bold uppercase tracking-[.12em] text-[var(--muted)]">{selected.stock} sample units available / Server verified</p></div>;
}
