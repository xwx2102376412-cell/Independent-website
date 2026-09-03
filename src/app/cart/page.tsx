import type { Metadata } from "next";
import { CartView } from "@/components/cart-view";
export const metadata: Metadata = { title: "Cart" };
export default function CartPage() { return <main className="shell py-14 sm:py-20"><CartView /></main>; }
