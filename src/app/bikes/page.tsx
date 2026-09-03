import type { Metadata } from "next";
import { ProductCard } from "@/components/product-card";
import { getProducts } from "@/lib/products";

export const metadata: Metadata = { title: "Electric Bikes", description: "Compare rugged RIVET electric bikes for daily American city riding." };

export default async function BikesPage() {
  const products = await getProducts();
  return <main className="shell py-14 sm:py-20"><div className="max-w-2xl"><p className="eyebrow text-[var(--accent)]">US collection</p><h1 className="display mt-5 text-5xl sm:text-6xl">BIKES FOR ROUGH COMMUTES.</h1><p className="mt-6 text-lg leading-7 text-[var(--muted)]">Three sample platforms, each built around serviceable components and daily utility.</p></div><div className="mt-12 grid gap-7 lg:grid-cols-2">{products.map((product, index) => <div key={product.id} className={index === 2 ? "lg:col-span-2 lg:w-[66%]" : ""}><ProductCard product={product} priority={index < 2} /></div>)}</div></main>;
}
