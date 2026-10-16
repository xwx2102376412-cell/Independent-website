import type { Metadata } from "next";
import { ProductCard } from "@/components/product-card";
import { getProducts } from "@/lib/products";

export const metadata: Metadata = { title: "Electric Machines", description: "Compare TUKEN OX electric bikes for daily American city riding." };

export default async function BikesPage() {
  const products = await getProducts();
  return <main><section className="grid-noise border-b border-[var(--line)]"><div className="shell grid gap-8 py-16 lg:grid-cols-[1fr_.7fr] lg:items-end lg:py-24"><div><p className="eyebrow text-[var(--accent)]">US machine collection / 03</p><h1 className="display mt-6 text-6xl sm:text-8xl">BUILT TO<br />MOVE CITIES.</h1></div><p className="max-w-lg text-lg leading-7 text-[var(--muted)] lg:justify-self-end">Three electric platforms with bicycle agility, motorcycle attitude, and serviceable daily hardware.</p></div></section><section className="shell py-14 sm:py-20"><div className="grid gap-6 lg:grid-cols-2">{products.map((product, index) => <div key={product.id} className={index === 2 ? "lg:col-span-2 lg:w-[66%] lg:justify-self-end" : ""}><ProductCard product={product} priority={index < 2} /></div>)}</div></section></main>;
}
