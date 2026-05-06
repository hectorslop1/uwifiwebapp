export type StoreCategory = "Merchandise" | "IPTV" | "Phone" | "Add-ons";

export type ProductVariant = {
  id: string;
  name: string;
  imageSrc: string;
  price?: number;
};

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
  variants?: ProductVariant[];
  selectedVariant?: string;
};

export const storeCatalog: StoreProduct[] = [
  // Merchandise Products
  {
    id: "hoodie",
    name: "Hoodie",
    category: "Merchandise",
    price: 45,
    priceLabel: "$45",
    description: "Comfortable U-Wifi branded hoodie",
    imageSrc: "/images/store/BlackHoodie.png",
    highlights: ["Comfortable fit", "U-Wifi branded", "Premium quality"],
    model: "Hoodie",
    accent: "brand",
    featured: true,
    selectedVariant: "black",
    variants: [
      {
        id: "black",
        name: "Black",
        imageSrc: "/images/store/BlackHoodie.png",
      },
      {
        id: "white",
        name: "White",
        imageSrc: "/images/store/WhiteHoodie.png",
      },
    ],
  },
  {
    id: "tshirt",
    name: "T-Shirt",
    category: "Merchandise",
    price: 25,
    priceLabel: "$25",
    description: "Classic U-Wifi t-shirt",
    imageSrc: "/images/store/BlackShirt.png",
    highlights: ["Classic design", "U-Wifi logo", "Cotton blend"],
    model: "T-Shirt",
    accent: "brand",
    selectedVariant: "black",
    variants: [
      {
        id: "black",
        name: "Black",
        imageSrc: "/images/store/BlackShirt.png",
      },
      {
        id: "white",
        name: "White",
        imageSrc: "/images/store/WhiteShirt.png",
      },
    ],
  },
  {
    id: "tumbler",
    name: "Tumbler",
    category: "Merchandise",
    price: 20,
    priceLabel: "$20",
    description: "Insulated tumbler for hot or cold drinks",
    imageSrc: "/images/store/BlackTumbler.png",
    highlights: ["Insulated", "Hot & cold", "U-Wifi branded"],
    model: "Tumbler",
    accent: "muted",
    selectedVariant: "black",
    variants: [
      {
        id: "black",
        name: "Black",
        imageSrc: "/images/store/BlackTumbler.png",
      },
      {
        id: "green",
        name: "Green",
        imageSrc: "/images/store/GreenTumbler.png",
      },
      {
        id: "purple",
        name: "Purple",
        imageSrc: "/images/store/PurpleTumbler.png",
      },
    ],
  },
  {
    id: "mug",
    name: "Mug",
    category: "Merchandise",
    price: 15,
    priceLabel: "$15",
    description: "Ceramic mug with U-Wifi logo",
    imageSrc: "/images/store/GreenMug.png",
    highlights: ["Ceramic", "U-Wifi logo", "Dishwasher safe"],
    model: "Mug",
    accent: "success",
    selectedVariant: "green",
    variants: [
      {
        id: "green",
        name: "Green",
        imageSrc: "/images/store/GreenMug.png",
      },
      {
        id: "purple",
        name: "Purple",
        imageSrc: "/images/store/PurpleMug.png",
      },
      {
        id: "white",
        name: "White",
        imageSrc: "/images/store/WhiteMug.png",
      },
    ],
  },
  {
    id: "tote-bag",
    name: "Tote Bag",
    category: "Merchandise",
    price: 18,
    priceLabel: "$18",
    description: "Reusable tote bag",
    imageSrc: "/images/store/GreenToteBag.png",
    highlights: ["Reusable", "Eco-friendly", "U-Wifi branded"],
    model: "Tote Bag",
    accent: "success",
    selectedVariant: "green",
    variants: [
      {
        id: "green",
        name: "Green",
        imageSrc: "/images/store/GreenToteBag.png",
      },
      {
        id: "white",
        name: "White",
        imageSrc: "/images/store/WhiteToteBag.png",
      },
    ],
  },

  // IPTV Options
  {
    id: "hdtv-antenna",
    name: "HDTV Antenna",
    category: "IPTV",
    price: 0,
    priceLabel: "External",
    description: "Local Channels - GE Extendable HDTV Antenna",
    highlights: ["Local channels", "No subscription", "One-time purchase"],
    model: "External service",
    accent: "brand",
    featured: true,
  },
  {
    id: "directv",
    name: "DirectTV",
    category: "IPTV",
    price: 0,
    priceLabel: "External",
    description: "Premium satellite TV service",
    imageSrc: "/images/store/directv.png",
    highlights: ["Premium content", "Satellite service", "Multiple packages"],
    model: "External service",
    accent: "success",
  },
  {
    id: "hulu",
    name: "Hulu",
    category: "IPTV",
    price: 0,
    priceLabel: "External",
    description: "Stream TV shows and movies",
    imageSrc: "/images/store/hulu.png",
    highlights: ["Streaming service", "TV shows & movies", "On-demand"],
    model: "External service",
    accent: "brand",
  },

  // Phone Options
  {
    id: "t-mobile",
    name: "T-Mobile",
    category: "Phone",
    price: 0,
    priceLabel: "External",
    description: "Get the latest smartphones and plans",
    imageSrc: "/images/store/T-Mobile.png",
    highlights: ["Latest smartphones", "Flexible plans", "5G network"],
    model: "External service",
    accent: "brand",
    featured: true,
  },


  // Add-ons
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
  "Merchandise",
  "IPTV",
  "Phone",
  "Add-ons",
];

export function getStoreProductById(productId: string) {
  return storeCatalog.find((product) => product.id === productId) ?? null;
}
