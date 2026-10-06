import { model, models, Schema } from "mongoose";

const categorySchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true, lowercase: true },
    description: { type: String, trim: true, default: "" },
    image: { type: Schema.Types.ObjectId, ref: "Media", default: null },
    order: { type: Number, default: 0 },
    active: { type: Boolean, default: true },
  },
  { timestamps: true },
);

const Category = models.Category ?? model("Category", categorySchema);

export default Category;
