export type StoreCategory = "Gift Cards" | "Devices" | "Add-ons";

export type StoreProduct = {
  id: string;
  name: string;
  category: StoreCategory;
  price: number;
  priceLabel: string;
  description: string;
  imageSrc?: string;
  highlights: string[];
  model: string;
  period?: "monthly" | "one-time";
  accent: "success" | "brand" | "muted";
  featured?: boolean;
};

export const storeCatalog: StoreProduct[] = [
  {
    id: "visa-gift-card",
    name: "Visa Gift Card",
    category: "Gift Cards",
    price: 25,
    priceLabel: "$25 - $200",
    description: "Use anywhere Visa is accepted.",
    imageSrc: "/images/store/visa-gift-cardsm.png",
    highlights: ["Flexible value", "Accepted widely", "Gift ready"],
    model: "Gift card",
    accent: "brand",
    featured: true,
  },
  {
    id: "walmart-gift-card",
    name: "Walmart Gift Card",
    category: "Gift Cards",
    price: 10,
    priceLabel: "$10 - $500",
    description: "Shop at Walmart stores or online.",
    imageSrc: "/images/store/walmart.png",
    highlights: ["In-store use", "Online use", "Wide value range"],
    model: "Gift card",
    accent: "success",
  },
  {
    id: "signal-extender",
    name: "Signal Extender",
    category: "Devices",
    price: 99,
    priceLabel: "$99",
    description: "Expand Wi‑Fi coverage into rooms where signal is weaker.",
    imageSrc: "/images/store/signal_extender.jpeg",
    highlights: ["Coverage boost", "Quick setup", "Home ready"],
    model: "Signal extender",
    accent: "brand",
    featured: true,
  },
  {
    id: "wifi-range-extender",
    name: "Wi‑Fi Range Extender",
    category: "Devices",
    price: 39,
    priceLabel: "$39",
    description: "Improve signal reach for spots farther away from the gateway.",
    imageSrc: "/images/store/wifi_range_extender.jpg",
    highlights: ["Compact", "Easy placement", "Coverage support"],
    model: "Range extender",
    accent: "success",
  },
  {
    id: "premium-support",
    name: "Premium Support",
    category: "Add-ons",
    price: 5,
    priceLabel: "$5 / month",
    description: "24/7 priority technical support.",
    highlights: ["Priority help", "24/7 access", "Faster response"],
    model: "Support add-on",
    period: "monthly",
    accent: "muted",
  },
  {
    id: "data-boost",
    name: "Data Boost",
    category: "Add-ons",
    price: 10,
    priceLabel: "$10 one-time",
    description: "Extra 5GB of high-speed data.",
    highlights: ["5GB extra", "Instant top-up", "One-time"],
    model: "Usage add-on",
    period: "one-time",
    accent: "brand",
  },
  {
    id: "family-plan",
    name: "Family Plan",
    category: "Add-ons",
    price: 15,
    priceLabel: "$15 / month",
    description: "Add up to 4 family members.",
    highlights: ["Up to 4 members", "Shared account", "Monthly add-on"],
    model: "Plan add-on",
    period: "monthly",
    accent: "success",
  },
];

export const storeCategories: StoreCategory[] = [
  "Gift Cards",
  "Devices",
  "Add-ons",
];

export function getStoreProductById(productId: string) {
  return storeCatalog.find((product) => product.id === productId) ?? null;
}
