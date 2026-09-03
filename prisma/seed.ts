import { PrismaClient } from "@prisma/client";
import { demoProducts } from "../src/lib/demo-products";

const prisma = new PrismaClient();

async function main() {
  for (const item of demoProducts) {
    await prisma.product.upsert({
      where: { slug: item.slug },
      update: {},
      create: {
        name: item.name,
        slug: item.slug,
        tagline: item.tagline,
        description: item.description,
        imageUrl: item.imageUrl,
        featured: item.featured,
        status: "ACTIVE",
        marketVersions: {
          create: {
            market: "US",
            currency: "USD",
            basePrice: Math.min(...item.variants.map((variant) => variant.price)),
            motorWatts: item.motorWatts,
            speedMph: item.speedMph,
            rangeMiles: item.rangeMiles,
            variants: {
              create: item.variants.map((variant) => ({
                sku: variant.sku,
                color: variant.color,
                colorHex: variant.colorHex,
                batteryWh: variant.batteryWh,
                motorWatts: variant.motorWatts,
                tire: variant.tire,
                price: variant.price,
                inventory: { create: { onHand: variant.stock } },
              })),
            },
          },
        },
      },
    });
  }
}

main().finally(() => prisma.$disconnect());
