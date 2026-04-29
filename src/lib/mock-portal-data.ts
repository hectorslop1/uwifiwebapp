export type WalletCard = {
  id: string;
  brand: string;
  last4: string;
  expiry: string;
  isDefault: boolean;
};

export type Affiliate = {
  id: string;
  name: string;
  email: string;
  role: string;
  status: "Active" | "Pending";
};

export type StoreProduct = {
  id: string;
  name: string;
  category: "Gateways" | "Mesh" | "Accessories" | "Services";
  price: number;
  description: string;
  highlights: string[];
  compatibility: string;
  leadTime: string;
  accent: "success" | "brand" | "muted";
  featured?: boolean;
};

export const walletSummary = {
  availablePoints: 4280,
  usdEquivalent: 42.8,
  tier: "Silver",
  nextTierAt: 5000,
  pointsEarnedThisMonth: 320,
};

export const walletHistory = [
  { label: "Week 1", points: 80 },
  { label: "Week 2", points: 110 },
  { label: "Week 3", points: 65 },
  { label: "Week 4", points: 140 },
];

export const walletCards: WalletCard[] = [
  { id: "visa-4242", brand: "Visa", last4: "4242", expiry: "04/28", isDefault: true },
  { id: "amex-0088", brand: "Amex", last4: "0088", expiry: "11/27", isDefault: false },
];

export const affiliates: Affiliate[] = [
  {
    id: "aff-1",
    name: "Ana Rios",
    email: "ana.rios@uwifi.com",
    role: "Household admin",
    status: "Active",
  },
  {
    id: "aff-2",
    name: "Marco Lopez",
    email: "marco.lopez@uwifi.com",
    role: "Billing viewer",
    status: "Pending",
  },
];

export const storeProducts: StoreProduct[] = [
  {
    id: "uwifi-gateway-pro",
    name: "U-WiFi Gateway Pro",
    category: "Gateways",
    price: 220,
    description:
      "Primary residential gateway with cleaner coverage management, better stability and a more premium installation footprint.",
    highlights: ["Wi-Fi 6", "Dual-band", "Low-latency routing"],
    compatibility: "Best for customers upgrading the main gateway.",
    leadTime: "Ships in 2 business days",
    accent: "success",
    featured: true,
  },
  {
    id: "uwifi-mesh-node",
    name: "U-WiFi Mesh Node",
    category: "Mesh",
    price: 129,
    description:
      "Extends coverage into larger homes while keeping the same SSID and a much cleaner roaming experience.",
    highlights: ["Mesh roaming", "Compact footprint", "Simple pairing"],
    compatibility: "Pairs with the Gateway Pro and current Wi-Fi plans.",
    leadTime: "Ships in 3 business days",
    accent: "brand",
  },
  {
    id: "uwifi-install-kit",
    name: "Professional Setup Visit",
    category: "Services",
    price: 89,
    description:
      "A guided installation service for customers who want hardware placement, activation and account verification done for them.",
    highlights: ["On-site setup", "Placement guidance", "Activation support"],
    compatibility: "Recommended for new gateway or mesh purchases.",
    leadTime: "Book within 48 hours",
    accent: "muted",
  },
  {
    id: "uwifi-cable-pack",
    name: "Cable + Mount Pack",
    category: "Accessories",
    price: 39,
    description:
      "Mounting bracket, cable routing essentials and a cleaner install finish for visible gateway locations.",
    highlights: ["Wall mount", "Cable guide", "Finishing kit"],
    compatibility: "Fits current gateway generation.",
    leadTime: "Ships next business day",
    accent: "muted",
  },
];

export const checkoutItems = [
  {
    id: "uwifi-gateway-pro",
    name: "U-WiFi Gateway Pro",
    quantity: 1,
    price: 220,
  },
  {
    id: "uwifi-install-kit",
    name: "Professional Setup Visit",
    quantity: 1,
    price: 89,
  },
];
