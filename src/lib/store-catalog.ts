export type StoreCategory = "Merchandise" | "IPTV" | "Phone" | "Add-ons";

export type ProductVariant = {
  id: string;
  name: string;
  imageSrc: string;
  price?: number;
  color?: string;
  colorHex?: string;
  size?: string;
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

function createApparelVariants({
  colors,
  sizes,
}: {
  colors: Array<{ id: string; name: string; imageSrc: string; colorHex: string }>;
  sizes: string[];
}) {
  return colors.flatMap((color) =>
    sizes.map((size) => ({
      id: `${color.id}-${size.toLowerCase()}`,
      name: `${color.name} / ${size}`,
      imageSrc: color.imageSrc,
      color: color.name,
      colorHex: color.colorHex,
      size,
    })),
  );
}

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
    selectedVariant: "black-m",
    variants: createApparelVariants({
      colors: [
        {
          id: "black",
          name: "Black",
          imageSrc: "/images/store/BlackHoodie.png",
          colorHex: "#111111",
        },
        {
          id: "white",
          name: "White",
          imageSrc: "/images/store/WhiteHoodie.png",
          colorHex: "#F5F5F5",
        },
      ],
      sizes: ["S", "M", "L", "XL"],
    }),
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
    selectedVariant: "black-m",
    variants: createApparelVariants({
      colors: [
        {
          id: "black",
          name: "Black",
          imageSrc: "/images/store/BlackShirt.png",
          colorHex: "#111111",
        },
        {
          id: "white",
          name: "White",
          imageSrc: "/images/store/WhiteShirt.png",
          colorHex: "#F5F5F5",
        },
      ],
      sizes: ["S", "M", "L", "XL"],
    }),
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
        color: "Black",
        colorHex: "#111111",
      },
      {
        id: "green",
        name: "Green",
        imageSrc: "/images/store/GreenTumbler.png",
        color: "Green",
        colorHex: "#4CAF50",
      },
      {
        id: "purple",
        name: "Purple",
        imageSrc: "/images/store/PurpleTumbler.png",
        color: "Purple",
        colorHex: "#8E44AD",
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
        color: "Green",
        colorHex: "#4CAF50",
      },
      {
        id: "purple",
        name: "Purple",
        imageSrc: "/images/store/PurpleMug.png",
        color: "Purple",
        colorHex: "#8E44AD",
      },
      {
        id: "white",
        name: "White",
        imageSrc: "/images/store/WhiteMug.png",
        color: "White",
        colorHex: "#F5F5F5",
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
        color: "Green",
        colorHex: "#4CAF50",
      },
      {
        id: "white",
        name: "White",
        imageSrc: "/images/store/WhiteToteBag.png",
        color: "White",
        colorHex: "#F5F5F5",
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

export function getStoreProductVariant(
  product: StoreProduct,
  variantId?: string | null,
) {
  if (!product.variants?.length) {
    return null;
  }

  if (!variantId) {
    return product.variants[0] ?? null;
  }

  return (
    product.variants.find((variant) => variant.id === variantId) ??
    product.variants[0] ??
    null
  );
}

export function getStoreVariantColors(product: StoreProduct) {
  return Array.from(
    new Map(
      (product.variants ?? [])
        .filter((variant) => variant.color)
        .map((variant) => [
          variant.color as string,
          {
            color: variant.color as string,
            colorHex: variant.colorHex ?? "#DADDE4",
            imageSrc: variant.imageSrc,
          },
        ]),
    ).values(),
  );
}

export function getStoreVariantSizes(product: StoreProduct, color?: string | null) {
  return Array.from(
    new Set(
      (product.variants ?? [])
        .filter((variant) => !color || variant.color === color)
        .map((variant) => variant.size)
        .filter((size): size is string => Boolean(size)),
    ),
  );
}
