import path from "node:path";
import { fileURLToPath } from "node:url";
import mongoose from "mongoose";
import { v2 as cloudinary } from "cloudinary";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

const mongoUri = process.env.MONGODB_URI;
const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

if (!mongoUri || !cloudName || !apiKey || !apiSecret) {
  console.error("Missing required environment variables (MONGODB_URI, CLOUDINARY_*)");
  process.exit(1);
}

cloudinary.config({
  cloud_name: cloudName,
  api_key: apiKey,
  api_secret: apiSecret,
  secure: true,
});

// Define schemas
const mediaSchema = new mongoose.Schema(
  {
    filename: { type: String, required: true, trim: true },
    type: { type: String, enum: ["image", "video"], required: true },
    cloudinaryUrl: { type: String, required: true, trim: true },
    publicId: { type: String, required: true, unique: true, trim: true },
    thumbnail: { type: String, trim: true },
    width: { type: Number, min: 0 },
    height: { type: Number, min: 0 },
    duration: { type: Number, min: 0 },
    altText: { type: String, trim: true, default: "" },
  },
  { timestamps: true }
);

const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true, lowercase: true },
    description: { type: String, trim: true, default: "" },
    image: { type: mongoose.Schema.Types.ObjectId, ref: "Media", default: null },
    order: { type: Number, default: 0 },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const productSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true, lowercase: true },
    sku: { type: String, trim: true, uppercase: true, unique: true, sparse: true },
    description: { type: String, trim: true, default: "" },
    price: { type: Number, required: true, min: 0 },
    category: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true },
    media: [{ type: mongoose.Schema.Types.ObjectId, ref: "Media" }],
    featured: { type: Boolean, default: false },
    available: { type: Boolean, default: true },
    showInReels: { type: Boolean, default: false },
    reelOrder: { type: Number, default: 0 },
    reelTitle: { type: String, trim: true, default: "" },
  },
  { timestamps: true }
);

const buttonSchema = new mongoose.Schema(
  {
    label: { type: String, trim: true },
    url: { type: String, trim: true },
  },
  { _id: false }
);

const pageSectionSchema = new mongoose.Schema(
  {
    type: { type: String, required: true, trim: true },
    heading: { type: String, trim: true, default: "" },
    subheading: { type: String, trim: true, default: "" },
    description: { type: String, trim: true, default: "" },
    media: [{ type: mongoose.Schema.Types.ObjectId, ref: "Media" }],
    button: { type: buttonSchema, default: null },
    products: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
    categories: [{ type: mongoose.Schema.Types.ObjectId, ref: "Category" }],
    visible: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const pageSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true, lowercase: true },
    status: { type: String, enum: ["draft", "published"], default: "draft" },
    seoTitle: { type: String, trim: true, default: "" },
    seoDescription: { type: String, trim: true, default: "" },
    sections: [{ type: mongoose.Schema.Types.ObjectId, ref: "PageSection" }],
  },
  { timestamps: true }
);

const Media = mongoose.models.Media ?? mongoose.model("Media", mediaSchema);
const Category = mongoose.models.Category ?? mongoose.model("Category", categorySchema);
const Product = mongoose.models.Product ?? mongoose.model("Product", productSchema);
const PageSection = mongoose.models.PageSection ?? mongoose.model("PageSection", pageSectionSchema);
const Page = mongoose.models.Page ?? mongoose.model("Page", pageSchema);

const IMAGES = [
  {
    filename: "hero.png",
    publicId: "ammaai/hero",
    altText: "Handcrafted cushions, jute bags, and ceramic vases for a warm artisan home",
    localPath: "public/images/hero.png",
  },
  {
    filename: "embroidered-tote.png",
    publicId: "ammaai/embroidered-tote",
    altText: "Gulnaar embroidered jute tote with botanical needlework",
    localPath: "public/images/embroidered-tote.png",
  },
  {
    filename: "painted-vase.png",
    publicId: "ammaai/painted-vase",
    altText: "Vanmala hand-painted ceramic vase with botanical motif",
    localPath: "public/images/painted-vase.png",
  },
  {
    filename: "embroidered-cushion.png",
    publicId: "ammaai/embroidered-cushion",
    altText: "Kusum textured embroidered cushion cover in earthy tones",
    localPath: "public/images/embroidered-cushion.png",
  },
  {
    filename: "brass-earrings.png",
    publicId: "ammaai/brass-earrings",
    altText: "Mrittika handcrafted hammered brass earrings with ceramic beads",
    localPath: "public/images/brass-earrings.png",
  },
  {
    filename: "artisan.png",
    publicId: "ammaai/artisan",
    altText: "Artisan handcrafting delicate embroidery in the studio",
    localPath: "public/images/artisan.png",
  },
  {
    filename: "footer-botanical.png",
    publicId: "ammaai/footer-botanical",
    altText: "Botanical floral illustration accent",
    localPath: "public/images/footer-botanical.png",
  },
];

async function seedMedia() {
  console.log("Checking and syncing media...");
  const mediaMap = {};

  for (const item of IMAGES) {
    let mediaDoc = await Media.findOne({
      $or: [{ publicId: item.publicId }, { filename: item.filename }],
    });

    if (mediaDoc) {
      console.log(`  [REUSE DB Media] ${item.filename} (ID: ${mediaDoc.publicId})`);
      mediaMap[item.filename] = mediaDoc;
      continue;
    }

    let cldResource = null;
    try {
      cldResource = await cloudinary.api.resource(item.publicId, { resource_type: "image" });
      console.log(`  [REUSE Cloudinary Asset] ${item.publicId}`);
    } catch {
      // Asset not found in Cloudinary, upload from local
      const filePath = path.join(rootDir, item.localPath);
      console.log(`  [UPLOAD Cloudinary] ${filePath} -> ${item.publicId}`);
      cldResource = await cloudinary.uploader.upload(filePath, {
        public_id: item.publicId,
        overwrite: false,
        resource_type: "image",
      });
    }

    const secureUrl = cldResource.secure_url;
    const thumbnail = secureUrl.replace("/upload/", "/upload/c_thumb,w_300,h_300/");

    mediaDoc = await Media.findOneAndUpdate(
      { publicId: item.publicId },
      {
        $set: {
          filename: item.filename,
          type: "image",
          cloudinaryUrl: secureUrl,
          publicId: item.publicId,
          thumbnail,
          width: cldResource.width || 800,
          height: cldResource.height || 800,
          altText: item.altText,
        },
      },
      { upsert: true, new: true }
    );

    mediaMap[item.filename] = mediaDoc;
  }

  // Handle ONE dummy video
  let videoDoc = await Media.findOne({ type: "video" });
  if (videoDoc) {
    console.log(`  [REUSE DB Video] ${videoDoc.filename} (${videoDoc.publicId})`);
  } else {
    // Check if Cloudinary sample video exists
    const sampleId = "samples/cld-sample-video";
    let videoUrl = "https://res.cloudinary.com/dudgd6wng/video/upload/v1761134023/samples/cld-sample-video.mp4";
    let foundId = sampleId;

    try {
      const cldVid = await cloudinary.api.resource(sampleId, { resource_type: "video" });
      videoUrl = cldVid.secure_url;
      foundId = cldVid.public_id;
      console.log(`  [REUSE Cloudinary Sample Video] ${foundId}`);
    } catch {
      console.log(`  [FALLBACK Video] using Cloudinary sample URL`);
    }

    const thumbnail = videoUrl
      .replace("/upload/", "/upload/so_0,w_800,c_limit/")
      .replace(/\.[a-z0-9]+$/i, ".jpg");

    videoDoc = await Media.findOneAndUpdate(
      { publicId: foundId },
      {
        $set: {
          filename: "sample-craft-video.mp4",
          type: "video",
          cloudinaryUrl: videoUrl,
          publicId: foundId,
          thumbnail,
          duration: 10,
          altText: "Artisan craft in motion",
        },
      },
      { upsert: true, new: true }
    );
    console.log(`  [CREATED DB Video Record] ID: ${videoDoc._id}`);
  }

  return { mediaMap, videoDoc };
}

async function seedCategories(mediaMap) {
  console.log("Checking and syncing categories...");
  const CATEGORIES = [
    {
      slug: "bags",
      name: "Bags",
      description: "Tactile carryalls made for everyday stories.",
      imageFile: "embroidered-tote.png",
      order: 1,
      active: true,
    },
    {
      slug: "home-decor",
      name: "Home Decor",
      description: "Quiet objects that make a room feel lived in.",
      imageFile: "painted-vase.png",
      order: 2,
      active: true,
    },
    {
      slug: "textiles",
      name: "Textiles",
      description: "Soft layers, hand-worked in earthy colour.",
      imageFile: "embroidered-cushion.png",
      order: 3,
      active: true,
    },
    {
      slug: "jewellery",
      name: "Jewellery",
      description: "Small-batch pieces with a maker’s touch.",
      imageFile: "brass-earrings.png",
      order: 4,
      active: true,
    },
  ];

  const categoryMap = {};
  for (const cat of CATEGORIES) {
    const doc = await Category.findOneAndUpdate(
      { slug: cat.slug },
      {
        $set: {
          name: cat.name,
          slug: cat.slug,
          description: cat.description,
          image: mediaMap[cat.imageFile]?._id ?? null,
          order: cat.order,
          active: cat.active,
        },
      },
      { upsert: true, new: true }
    );
    categoryMap[cat.slug] = doc;
    console.log(`  Synced category: ${doc.name} (/${doc.slug})`);
  }
  return categoryMap;
}

async function seedProducts(mediaMap, videoDoc, categoryMap) {
  console.log("Checking and syncing products with unique SKUs and ordered media...");
  const PRODUCTS = [
    {
      slug: "gulnaar-embroidered-tote",
      title: "Gulnaar Embroidered Tote",
      sku: "MH-BAG-001",
      description:
        "A richly textured jute tote finished with hand-worked floral embroidery. Spacious, structured, and made to bring character to everyday carrying.",
      price: 2999,
      categorySlug: "bags",
      // WITH VIDEO: Video -> Image
      media: [videoDoc._id, mediaMap["embroidered-tote.png"]._id],
      featured: true,
      available: true,
      showInReels: true,
      reelOrder: 1,
      reelTitle: "Gulnaar Embroidered Tote",
    },
    {
      slug: "bagh-mini-tote",
      title: "Bagh Mini Tote",
      sku: "MH-BAG-002",
      description:
        "A compact companion in natural jute with dense botanical needlework and comfortable braided handles.",
      price: 2199,
      categorySlug: "bags",
      media: [mediaMap["embroidered-tote.png"]._id],
      featured: false,
      available: true,
      showInReels: false,
      reelOrder: 0,
      reelTitle: "",
    },
    {
      slug: "vanmala-painted-vase",
      title: "Vanmala Painted Vase",
      sku: "MH-DECOR-001",
      description:
        "A hand-thrown warm ivory vase, painted with a delicate botanical motif. Each surface keeps the subtle marks of its maker.",
      price: 1899,
      categorySlug: "home-decor",
      media: [mediaMap["painted-vase.png"]._id],
      featured: true,
      available: true,
      showInReels: true,
      reelOrder: 2,
      reelTitle: "Vanmala Painted Vase",
    },
    {
      slug: "pushp-table-vase",
      title: "Pushp Table Vase",
      sku: "MH-DECOR-002",
      description:
        "A small hand-painted vase that brings a quiet floral accent to shelves, desks, and bedside tables.",
      price: 1299,
      categorySlug: "home-decor",
      media: [mediaMap["painted-vase.png"]._id],
      featured: false,
      available: true,
      showInReels: false,
      reelOrder: 0,
      reelTitle: "",
    },
    {
      slug: "kusum-embroidered-cushion",
      title: "Kusum Embroidered Cushion",
      sku: "MH-TEX-001",
      description:
        "A tactile cotton cushion cover with garden-inspired embroidery in earthy rust and forest green.",
      price: 1499,
      categorySlug: "textiles",
      media: [mediaMap["embroidered-cushion.png"]._id],
      featured: true,
      available: true,
      showInReels: true,
      reelOrder: 3,
      reelTitle: "Kusum Embroidered Cushion",
    },
    {
      slug: "gulmohar-cushion",
      title: "Gulmohar Cushion Cover",
      sku: "MH-TEX-002",
      description:
        "Warm, dimensional embroidery on a substantial cotton ground, inspired by a sunlit courtyard garden.",
      price: 1699,
      categorySlug: "textiles",
      media: [mediaMap["embroidered-cushion.png"]._id],
      featured: false,
      available: true,
      showInReels: false,
      reelOrder: 0,
      reelTitle: "",
    },
    {
      slug: "mrittika-brass-earrings",
      title: "Mrittika Brass Earrings",
      sku: "MH-JEW-001",
      description:
        "Lightweight hammered brass drops paired with small speckled ceramic beads, shaped for effortless everyday wear.",
      price: 1199,
      categorySlug: "jewellery",
      media: [mediaMap["brass-earrings.png"]._id],
      featured: true,
      available: true,
      showInReels: true,
      reelOrder: 4,
      reelTitle: "Mrittika Brass Earrings",
    },
    {
      slug: "kansa-drop-earrings",
      title: "Kansa Drop Earrings",
      sku: "MH-JEW-002",
      description:
        "Artisan-finished brass earrings with a gentle patina and tiny handmade ceramic beads.",
      price: 999,
      categorySlug: "jewellery",
      media: [mediaMap["brass-earrings.png"]._id],
      featured: false,
      available: true,
      showInReels: false,
      reelOrder: 0,
      reelTitle: "",
    },
  ];

  const productMap = {};
  for (const p of PRODUCTS) {
    const categoryId = categoryMap[p.categorySlug]._id;
    const doc = await Product.findOneAndUpdate(
      { slug: p.slug },
      {
        $set: {
          title: p.title,
          slug: p.slug,
          sku: p.sku,
          description: p.description,
          price: p.price,
          category: categoryId,
          media: p.media,
          featured: p.featured,
          available: p.available,
          showInReels: p.showInReels,
          reelOrder: p.reelOrder,
          reelTitle: p.reelTitle,
        },
      },
      { upsert: true, new: true }
    );
    productMap[p.slug] = doc;
    console.log(`  Synced product: ${doc.title} [SKU: ${doc.sku}]`);
  }
  return productMap;
}

async function seedPages(mediaMap, categoryMap, productMap) {
  console.log("Checking and syncing 8 CMS pages and sections...");

  const pageDefinitions = [
    {
      title: "Home",
      slug: "home",
      seoTitle: "Ammaai · Handcrafted Treasures for Mindful Living",
      seoDescription: "Explore artisanal home decor, hand-embroidered totes, and bespoke handcrafted treasures.",
      sections: [
        {
          type: "hero",
          heading: "Handcrafted\nTreasures",
          subheading: "Handmade with heart",
          description: "Artisanal products for a more mindful home.",
          media: [mediaMap["hero.png"]._id],
          button: { label: "Explore Collection", url: "/collections" },
          products: [],
          categories: [],
          visible: true,
          order: 0,
        },
        {
          type: "featured-products",
          heading: "Featured Collection",
          subheading: "A considered edit",
          description: "",
          media: [],
          button: { label: "View All", url: "/collections" },
          products: [
            productMap["gulnaar-embroidered-tote"]._id,
            productMap["vanmala-painted-vase"]._id,
            productMap["kusum-embroidered-cushion"]._id,
            productMap["mrittika-brass-earrings"]._id,
          ],
          categories: [],
          visible: true,
          order: 1,
        },
        {
          type: "category-grid",
          heading: "Find your kind of beautiful.",
          subheading: "Explore by category",
          description: "",
          media: [],
          button: { label: "Explore all", url: "/collections" },
          products: [],
          categories: [
            categoryMap["bags"]._id,
            categoryMap["home-decor"]._id,
            categoryMap["textiles"]._id,
            categoryMap["jewellery"]._id,
          ],
          visible: true,
          order: 2,
        },
        {
          type: "made-in-motion",
          heading: "Made in Motion",
          subheading: "See the craft in motion",
          description: "A closer look at the pieces, textures, and details made by hand.",
          media: [],
          products: [],
          categories: [],
          visible: true,
          order: 3,
        },
        {
          type: "story",
          heading: "A human touch you can feel.",
          subheading: "Our story",
          description:
            "Ammaai began with a simple belief: what we bring into our homes should carry a story. Our collection celebrates the texture and beautiful variations that make handmade work personal.",
          media: [mediaMap["artisan.png"]._id],
          button: { label: "Discover our story", url: "/about" },
          products: [],
          categories: [],
          visible: true,
          order: 4,
        },
        {
          type: "experience",
          heading: "The little things make it personal.",
          subheading: "The Ammaai experience",
          description: "A simple way to explore, save, and ask about pieces you love.",
          media: [
            mediaMap["embroidered-tote.png"]._id,
            mediaMap["artisan.png"]._id,
            mediaMap["painted-vase.png"]._id,
          ],
          products: [],
          categories: [],
          visible: true,
          order: 5,
        },
        {
          type: "cta",
          heading: "Carry the feeling home",
          subheading: "Crafted for living",
          description: "Explore handmade favourites, save what you love, and ask us about the details.",
          media: [],
          button: { label: "Explore Collection", url: "/collections" },
          products: [],
          categories: [],
          visible: false,
          order: 6,
        },
        {
          type: "faq",
          heading: "Frequently asked questions",
          subheading: "A few helpful details",
          description: "A few helpful details before you reach out.",
          media: [],
          products: [],
          categories: [],
          visible: true,
          order: 7,
        },
      ],
    },
    {
      title: "Bags",
      slug: "bags",
      seoTitle: "Handmade Bags & Totes · Ammaai",
      seoDescription: "Tactile carryalls made for everyday stories in natural jute and cotton embroidery.",
      sections: [
        {
          type: "collection-hero",
          heading: "Bags",
          subheading: "Shop by category",
          description: "Tactile carryalls made for everyday stories.",
          media: [mediaMap["embroidered-tote.png"]._id],
          visible: true,
          order: 0,
        },
        {
          type: "product-grid",
          heading: "All pieces",
          visible: true,
          order: 1,
        },
        {
          type: "category-story",
          heading: "Tactile carryalls made for everyday stories.",
          description: "Spacious, structured, and made to bring character to everyday carrying.",
          media: [mediaMap["embroidered-tote.png"]._id],
          visible: true,
          order: 2,
        },
      ],
    },
    {
      title: "Home Decor",
      slug: "home-decor",
      seoTitle: "Artisanal Home Decor · Ammaai",
      seoDescription: "Quiet hand-painted ceramic objects that make a room feel lived in.",
      sections: [
        {
          type: "collection-hero",
          heading: "Home Decor",
          subheading: "Shop by category",
          description: "Quiet objects that make a room feel lived in.",
          media: [mediaMap["painted-vase.png"]._id],
          visible: true,
          order: 0,
        },
        {
          type: "product-grid",
          heading: "All pieces",
          visible: true,
          order: 1,
        },
        {
          type: "category-story",
          heading: "Quiet objects that make a room feel lived in.",
          description: "Each surface keeps the subtle marks of its maker.",
          media: [mediaMap["painted-vase.png"]._id],
          visible: true,
          order: 2,
        },
      ],
    },
    {
      title: "Textiles",
      slug: "textiles",
      seoTitle: "Embroidered Textiles & Cushions · Ammaai",
      seoDescription: "Soft layers, hand-worked in earthy colour with garden-inspired embroidery.",
      sections: [
        {
          type: "collection-hero",
          heading: "Textiles",
          subheading: "Shop by category",
          description: "Soft layers, hand-worked in earthy colour.",
          media: [mediaMap["embroidered-cushion.png"]._id],
          visible: true,
          order: 0,
        },
        {
          type: "product-grid",
          heading: "All pieces",
          visible: true,
          order: 1,
        },
        {
          type: "category-story",
          heading: "Soft layers, hand-worked in earthy colour.",
          description: "Warm, dimensional embroidery on a substantial cotton ground.",
          media: [mediaMap["embroidered-cushion.png"]._id],
          visible: true,
          order: 2,
        },
      ],
    },
    {
      title: "Jewellery",
      slug: "jewellery",
      seoTitle: "Artisan Handcrafted Jewellery · Ammaai",
      seoDescription: "Small-batch hammered brass drops and ceramic bead earrings.",
      sections: [
        {
          type: "collection-hero",
          heading: "Jewellery",
          subheading: "Shop by category",
          description: "Small-batch pieces with a maker’s touch.",
          media: [mediaMap["brass-earrings.png"]._id],
          visible: true,
          order: 0,
        },
        {
          type: "product-grid",
          heading: "All pieces",
          visible: true,
          order: 1,
        },
        {
          type: "category-story",
          heading: "Small-batch pieces with a maker’s touch.",
          description: "Lightweight hammered brass drops paired with small speckled ceramic beads.",
          media: [mediaMap["brass-earrings.png"]._id],
          visible: true,
          order: 2,
        },
      ],
    },
    {
      title: "Story",
      slug: "story",
      seoTitle: "Our Story · Ammaai",
      seoDescription: "The Ammaai point of view: thoughtful pieces, honest texture, and handmade character.",
      sections: [
        {
          type: "story-hero",
          heading: "A little more meaning in the everyday.",
          subheading: "About Ammaai",
          description: "An appreciation for pieces that show the beauty of the hand and bring warmth to the places we call home.",
          media: [mediaMap["artisan.png"]._id],
          button: { label: "Explore our collection", url: "/collections" },
          visible: true,
          order: 0,
        },
        {
          type: "story-content",
          heading: "Made with intention. Lived with love.",
          subheading: "Our point of view",
          description: "Ammaai began with a simple thought: the things around us can do more than fill a space. A hand worked surface, an earthy colour, or a familiar texture can make an ordinary moment feel special. This is the spirit behind the collection.",
          media: [
            mediaMap["embroidered-cushion.png"]._id,
            mediaMap["painted-vase.png"]._id,
            mediaMap["embroidered-tote.png"]._id,
          ],
          visible: true,
          order: 1,
        },
        {
          type: "values",
          heading: "Beautiful in the details.",
          subheading: "What matters to us",
          description: "Find a piece that feels like you.",
          button: { label: "Explore Collection", url: "/collections" },
          visible: true,
          order: 2,
        },
      ],
    },
    {
      title: "Experience",
      slug: "experience",
      seoTitle: "Contact Us · Ammaai",
      seoDescription: "Ask Ammaai about handmade products, availability, care, and custom requests.",
      sections: [
        {
          type: "experience-hero",
          heading: "Let’s make it personal.",
          subheading: "Contact Ammaai",
          description: "Have a question about a handmade piece? Tell us what you have in mind. We’re happy to help you find the right details.",
          media: [mediaMap["artisan.png"]._id],
          button: {
            label: "Chat on WhatsApp",
            url: "https://wa.me/919999999999?text=Hi%20Ammaai!%20I'd%20like%20to%20know%20more%20about%20your%20handmade%20collection.",
          },
          visible: true,
          order: 0,
        },
        {
          type: "experience-features",
          heading: "Every question is welcome.",
          subheading: "How can we help?",
          description: "Feel free to browse pieces, discuss custom requests, or ask for guidance.",
          visible: true,
          order: 1,
        },
        {
          type: "experience-cta",
          heading: "Tell us what you’re looking for.",
          subheading: "Write to us",
          description: "Share the details here and continue the conversation in WhatsApp. Your message stays in your hands until you press send.",
          media: [mediaMap["painted-vase.png"]._id],
          visible: true,
          order: 2,
        },
      ],
    },
    {
      title: "FAQ",
      slug: "faq",
      seoTitle: "Frequently Asked Questions · Ammaai",
      seoDescription: "Answers to common questions about ordering, materials, care, and custom requests.",
      sections: [
        {
          type: "faq-hero",
          heading: "Good to know.",
          subheading: "Before we chat",
          description: "Answers to common questions about ordering, materials, and custom requests.",
          visible: true,
          order: 0,
        },
        {
          type: "faq-list",
          heading: "Frequently asked questions",
          subheading: "Common enquiries",
          description: "Find quick answers to common questions.",
          visible: true,
          order: 1,
        },
      ],
    },
  ];

  for (const pageDef of pageDefinitions) {
    let existingPage = await Page.findOne({ slug: pageDef.slug });
    const sectionIds = [];

    for (let i = 0; i < pageDef.sections.length; i++) {
      const s = pageDef.sections[i];
      let sectionDoc = null;

      // If page exists and has existing sections, reuse or update them
      if (existingPage?.sections?.[i]) {
        sectionDoc = await PageSection.findByIdAndUpdate(
          existingPage.sections[i],
          {
            $set: {
              type: s.type,
              heading: s.heading ?? "",
              subheading: s.subheading ?? "",
              description: s.description ?? "",
              media: s.media ?? [],
              button: s.button ?? null,
              products: s.products ?? [],
              categories: s.categories ?? [],
              visible: s.visible ?? true,
              order: s.order ?? i,
            },
          },
          { new: true, upsert: true }
        );
      } else {
        sectionDoc = await PageSection.create({
          type: s.type,
          heading: s.heading ?? "",
          subheading: s.subheading ?? "",
          description: s.description ?? "",
          media: s.media ?? [],
          button: s.button ?? null,
          products: s.products ?? [],
          categories: s.categories ?? [],
          visible: s.visible ?? true,
          order: s.order ?? i,
        });
      }

      sectionIds.push(sectionDoc._id);
    }

    const savedPage = await Page.findOneAndUpdate(
      { slug: pageDef.slug },
      {
        $set: {
          title: pageDef.title,
          slug: pageDef.slug,
          status: "published",
          seoTitle: pageDef.seoTitle,
          seoDescription: pageDef.seoDescription,
          sections: sectionIds,
        },
      },
      { upsert: true, new: true }
    );
    console.log(`  Synced page: ${savedPage.title} (/${savedPage.slug}) with ${sectionIds.length} sections`);
  }
}

async function run() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(mongoUri, { bufferCommands: false });
    console.log("Connected to MongoDB successfully.");

    const { mediaMap, videoDoc } = await seedMedia();
    const categoryMap = await seedCategories(mediaMap);
    const productMap = await seedProducts(mediaMap, videoDoc, categoryMap);
    await seedPages(mediaMap, categoryMap, productMap);

    console.log("\n=================================");
    console.log("SUCCESS: Database seeding complete!");
    console.log("=================================\n");
  } catch (error) {
    console.error("Seeding failed with error:", error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB.");
    process.exit(0);
  }
}

run();
