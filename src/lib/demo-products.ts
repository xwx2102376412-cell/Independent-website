export type StoreVariant = {
  id: string;
  sku: string;
  color: string;
  colorHex: string;
  batteryWh: number;
  motorWatts: number;
  tire: string;
  price: number;
  stock: number;
};

export type StoreProduct = {
  id: string;
  name: string;
  slug: string;
  tagline: string;
  description: string;
  imageUrl: string;
  featured: boolean;
  motorWatts: number;
  speedMph: number;
  rangeMiles: number;
  variants: StoreVariant[];
};

export const demoProducts: StoreProduct[] = [
  {
    id: "demo-gridline",
    name: "Gridline 1",
    slug: "gridline-1",
    tagline: "The weekday workhorse.",
    description: "A balanced commuter with upright geometry, integrated lights, full fenders, and a rack ready for the daily load.",
    imageUrl: "/images/rivet-hero.png",
    featured: true,
    motorWatts: 500,
    speedMph: 20,
    rangeMiles: 45,
    variants: [
      { id: "demo-gridline-black-672", sku: "GRD-US-BLK-500-672-RD", color: "Forge Black", colorHex: "#242528", batteryWh: 672, motorWatts: 500, tire: "Commuter 2.4 in", price: 149900, stock: 12 },
      { id: "demo-gridline-silver-672", sku: "GRD-US-SLV-500-672-RD", color: "Cold Silver", colorHex: "#8A8D91", batteryWh: 672, motorWatts: 500, tire: "Commuter 2.4 in", price: 149900, stock: 8 },
    ],
  },
  {
    id: "demo-longhaul",
    name: "Longhaul ST",
    slug: "longhaul-st",
    tagline: "More miles. Fewer compromises.",
    description: "A low-step frame, larger battery, and cargo-ready hardware make longer commutes feel straightforward.",
    imageUrl: "/images/rivet-range.png",
    featured: true,
    motorWatts: 500,
    speedMph: 20,
    rangeMiles: 65,
    variants: [
      { id: "demo-longhaul-black-864", sku: "LHS-US-BLK-500-864-RD", color: "Forge Black", colorHex: "#242528", batteryWh: 864, motorWatts: 500, tire: "All-weather 2.5 in", price: 189900, stock: 7 },
      { id: "demo-longhaul-orange-864", sku: "LHS-US-ORG-500-864-RD", color: "Signal Orange", colorHex: "#D45B24", batteryWh: 864, motorWatts: 500, tire: "All-weather 2.5 in", price: 194900, stock: 5 },
    ],
  },
  {
    id: "demo-crosscut",
    name: "Crosscut X",
    slug: "crosscut-x",
    tagline: "City armor for rough routes.",
    description: "High-volume tires and a reinforced rack handle broken pavement during the week and loose surfaces on weekends.",
    imageUrl: "/images/rivet-trail.png",
    featured: true,
    motorWatts: 750,
    speedMph: 28,
    rangeMiles: 55,
    variants: [
      { id: "demo-crosscut-orange-960", sku: "CRX-US-ORG-750-960-FAT", color: "Signal Orange", colorHex: "#D45B24", batteryWh: 960, motorWatts: 750, tire: "Fat 4.0 in", price: 229900, stock: 4 },
      { id: "demo-crosscut-black-960", sku: "CRX-US-BLK-750-960-FAT", color: "Forge Black", colorHex: "#242528", batteryWh: 960, motorWatts: 750, tire: "Fat 4.0 in", price: 224900, stock: 6 },
    ],
  },
];

export const money = (cents: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(cents / 100);
