"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";

export type CartLine = { variantId: string; market: "US"; quantity: number; name: string; option: string; price: number; imageUrl: string; slug: string };
type CartContextValue = { items: CartLine[]; count: number; hydrated: boolean; add: (item: CartLine) => void; remove: (id: string) => void; update: (id: string, quantity: number) => void; clear: () => void };
const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartLine[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const syncStarted = useRef(false);
  useEffect(() => { const timer = window.setTimeout(() => { try { setItems(JSON.parse(localStorage.getItem("rivet-cart") ?? "[]")); } catch { setItems([]); } setHydrated(true); }, 0); return () => window.clearTimeout(timer); }, []);
  useEffect(() => {
    if (!hydrated || syncStarted.current) return;
    syncStarted.current = true;
    let cancelled = false;
    (async () => {
      const me = await fetch("/api/auth/me", { cache: "no-store" }).then((response) => response.json()).catch(() => ({ authenticated: false }));
      if (!me.authenticated || cancelled) return;
      setAuthenticated(true);
      const local = JSON.parse(localStorage.getItem("rivet-cart") ?? "[]") as CartLine[];
      const merged = await fetch("/api/cart", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ items: local.map(({ variantId, quantity }) => ({ variantId, quantity })) }) }).then((response) => response.ok ? response.json() : null).catch(() => null);
      if (!cancelled && merged?.items) { setItems(merged.items); localStorage.removeItem("rivet-cart"); }
    })();
    return () => { cancelled = true; };
  }, [hydrated]);
  const persist = useCallback((method: string, body: unknown) => {
    void fetch("/api/cart", { method, headers: { "content-type": "application/json" }, body: JSON.stringify(body) }).then(async (response) => { if (!response.ok) return; const result = await response.json(); setItems(result.items); localStorage.removeItem("rivet-cart"); });
  }, []);
  const commit = useCallback((updater: (current: CartLine[]) => CartLine[], server?: { method: string; body: unknown }) => setItems((current) => { const next = updater(current); if (authenticated) { localStorage.removeItem("rivet-cart"); if (server) persist(server.method, server.body); } else localStorage.setItem("rivet-cart", JSON.stringify(next)); return next; }), [authenticated, persist]);
  const value = useMemo(() => ({
    items,
    count: items.reduce((sum, item) => sum + item.quantity, 0),
    hydrated,
    add: (line: CartLine) => commit((current) => {
      const found = current.find((item) => item.variantId === line.variantId);
      return found ? current.map((item) => item.variantId === line.variantId ? { ...item, quantity: Math.min(5, item.quantity + line.quantity) } : item) : [...current, line];
    }, { method: "POST", body: { items: [{ variantId: line.variantId, quantity: line.quantity }] } }),
    remove: (id: string) => commit((current) => current.filter((item) => item.variantId !== id), { method: "DELETE", body: { variantId: id } }),
    update: (id: string, quantity: number) => { const nextQuantity = Math.max(1, Math.min(5, quantity)); commit((current) => current.map((item) => item.variantId === id ? { ...item, quantity: nextQuantity } : item), { method: "PATCH", body: { variantId: id, quantity: nextQuantity } }); },
    clear: () => commit(() => [], { method: "DELETE", body: { all: true } }),
  }), [items, hydrated, commit]);
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const value = useContext(CartContext);
  if (!value) throw new Error("useCart must be used within CartProvider");
  return value;
}
