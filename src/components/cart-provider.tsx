"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

export type CartLine = { variantId: string; market: "US"; quantity: number; name: string; option: string; price: number; imageUrl: string; slug: string };
type CartContextValue = { items: CartLine[]; count: number; hydrated: boolean; add: (item: CartLine) => void; remove: (id: string) => void; update: (id: string, quantity: number) => void; clear: () => void };
const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartLine[]>([]);
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => { const timer = window.setTimeout(() => { try { setItems(JSON.parse(localStorage.getItem("rivet-cart") ?? "[]")); } catch { setItems([]); } setHydrated(true); }, 0); return () => window.clearTimeout(timer); }, []);
  const commit = useCallback((updater: (current: CartLine[]) => CartLine[]) => setItems((current) => { const next = updater(current); localStorage.setItem("rivet-cart", JSON.stringify(next)); return next; }), []);
  const value = useMemo(() => ({
    items,
    count: items.reduce((sum, item) => sum + item.quantity, 0),
    hydrated,
    add: (line: CartLine) => commit((current) => {
      const found = current.find((item) => item.variantId === line.variantId);
      return found ? current.map((item) => item.variantId === line.variantId ? { ...item, quantity: Math.min(5, item.quantity + line.quantity) } : item) : [...current, line];
    }),
    remove: (id: string) => commit((current) => current.filter((item) => item.variantId !== id)),
    update: (id: string, quantity: number) => commit((current) => current.map((item) => item.variantId === id ? { ...item, quantity: Math.max(1, Math.min(5, quantity)) } : item)),
    clear: () => commit(() => []),
  }), [items, hydrated, commit]);
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const value = useContext(CartContext);
  if (!value) throw new Error("useCart must be used within CartProvider");
  return value;
}
