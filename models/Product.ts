import { model, models, Schema } from "mongoose";

const productSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true, lowercase: true },
    sku: { type: String, trim: true, uppercase: true, unique: true, sparse: true },
    description: { type: String, trim: true, default: "" },
    material: { type: String, trim: true, default: "" },
    dimensions: { type: String, trim: true, default: "" },
    price: { type: Number, required: true, min: 0 },
    category: { type: Schema.Types.ObjectId, ref: "Category", required: true },
    media: [{ type: Schema.Types.ObjectId, ref: "Media" }],
    featured: { type: Boolean, default: false },
    available: { type: Boolean, default: true },
    showInReels: { type: Boolean, default: false },
    reelOrder: { type: Number, default: 0 },
    reelTitle: { type: String, trim: true, default: "" },
  },
  { timestamps: true },
);

const Product = models.Product ?? model("Product", productSchema);

export default Product;
