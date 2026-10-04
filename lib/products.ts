export type Product = {
  id: string;
  slug: string;
  name: string;
  description: string;
  price: number;
  category: "bags" | "home-decor" | "jewellery" | "textiles";
  categoryLabel: string;
  image: string;
  material?: string;
  dimensions?: string;
  featured?: boolean;
  isNew?: boolean;
  available: boolean;
};

export const products: Product[] = [
  {
    id: "p1", slug: "gulnaar-embroidered-tote", name: "Gulnaar Embroidered Tote",
    description: "A richly textured jute tote finished with hand-worked floral embroidery. Spacious, structured, and made to bring character to everyday carrying.",
    price: 2999, category: "bags", categoryLabel: "Bags", image: "/images/embroidered-tote.png",
    material: "Natural jute, cotton embroidery", dimensions: "38 × 29 × 12 cm", featured: true, isNew: true, available: true,
  },
  {
    id: "p2", slug: "vanmala-painted-vase", name: "Vanmala Painted Vase",
    description: "A hand-thrown warm ivory vase, painted with a delicate botanical motif. Each surface keeps the subtle marks of its maker.",
    price: 1899, category: "home-decor", categoryLabel: "Home Decor", image: "/images/painted-vase.png",
    material: "Hand-thrown ceramic", dimensions: "22 × 14 cm", featured: true, available: true,
  },
  {
    id: "p3", slug: "kusum-embroidered-cushion", name: "Kusum Embroidered Cushion",
    description: "A tactile cotton cushion cover with garden-inspired embroidery in earthy rust and forest green.",
    price: 1499, category: "textiles", categoryLabel: "Textiles", image: "/images/embroidered-cushion.png",
    material: "Natural cotton, cotton thread", dimensions: "45 × 45 cm", featured: true, isNew: true, available: true,
  },
  {
    id: "p4", slug: "mrittika-brass-earrings", name: "Mrittika Brass Earrings",
    description: "Lightweight hammered brass drops paired with small speckled ceramic beads, shaped for effortless everyday wear.",
    price: 1199, category: "jewellery", categoryLabel: "Jewellery", image: "/images/brass-earrings.png",
    material: "Brass, ceramic", dimensions: "6 cm drop", featured: true, available: true,
  },
  {
    id: "p5", slug: "bagh-mini-tote", name: "Bagh Mini Tote",
    description: "A compact companion in natural jute with dense botanical needlework and comfortable braided handles.",
    price: 2199, category: "bags", categoryLabel: "Bags", image: "/images/embroidered-tote.png",
    material: "Natural jute, cotton embroidery", dimensions: "30 × 24 × 10 cm", available: true,
  },
  {
    id: "p6", slug: "pushp-table-vase", name: "Pushp Table Vase",
    description: "A small hand-painted vase that brings a quiet floral accent to shelves, desks, and bedside tables.",
    price: 1299, category: "home-decor", categoryLabel: "Home Decor", image: "/images/painted-vase.png",
    material: "Hand-thrown ceramic", dimensions: "16 × 11 cm", available: true,
  },
  {
    id: "p7", slug: "gulmohar-cushion", name: "Gulmohar Cushion Cover",
    description: "Warm, dimensional embroidery on a substantial cotton ground, inspired by a sunlit courtyard garden.",
    price: 1699, category: "textiles", categoryLabel: "Textiles", image: "/images/embroidered-cushion.png",
    material: "Natural cotton", dimensions: "45 × 45 cm", available: true,
  },
  {
    id: "p8", slug: "kansa-drop-earrings", name: "Kansa Drop Earrings",
    description: "Artisan-finished brass earrings with a gentle patina and tiny handmade ceramic beads.",
    price: 999, category: "jewellery", categoryLabel: "Jewellery", image: "/images/brass-earrings.png",
    material: "Brass, ceramic", dimensions: "5.5 cm drop", available: true,
  },
];

export const categories = [
  { slug: "bags", name: "Bags", copy: "Tactile carryalls made for everyday stories.", image: "/images/embroidered-tote.png" },
  { slug: "home-decor", name: "Home Decor", copy: "Quiet objects that make a room feel lived in.", image: "/images/painted-vase.png" },
  { slug: "textiles", name: "Textiles", copy: "Soft layers, hand-worked in earthy colour.", image: "/images/embroidered-cushion.png" },
  { slug: "jewellery", name: "Jewellery", copy: "Small-batch pieces with a maker’s touch.", image: "/images/brass-earrings.png" },
] as const;

export function formatPrice(price: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(price);
}

export const getProduct = (slug: string) => products.find((product) => product.slug === slug);
