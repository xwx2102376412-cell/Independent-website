import { connection } from "next/server";
import { prisma } from "@/lib/prisma";
import { demoProducts, type StoreProduct } from "@/lib/demo-products";

export async function getProducts(): Promise<StoreProduct[]> {
  if (!process.env.DATABASE_URL) return demoProducts;
  await connection();
  try {
    const products = await prisma.product.findMany({
      where: { status: "ACTIVE", marketVersions: { some: { market: "US" } } },
      include: { marketVersions: { where: { market: "US" }, include: { variants: { where: { active: true }, include: { inventory: true } } } } },
      orderBy: [{ featured: "desc" }, { createdAt: "asc" }],
    });
    return products.map((product) => {
      const market = product.marketVersions[0];
      return {
        id: product.id,
        name: product.name,
        slug: product.slug,
        tagline: product.tagline,
        description: product.description,
        imageUrl: product.imageUrl,
        imageUrls: product.imageUrls.length > 0 ? product.imageUrls : [product.imageUrl],
        featured: product.featured,
        motorWatts: market.motorWatts,
        speedMph: market.speedMph,
        rangeMiles: market.rangeMiles,
        variants: market.variants.map((variant) => ({ ...variant, stock: variant.inventory?.onHand ?? 0 })),
      };
    });
  } catch {
    return demoProducts;
  }
}

export async function getProduct(slug: string) {
  return (await getProducts()).find((product) => product.slug === slug) ?? null;
}
