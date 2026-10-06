import { model, models, Schema } from "mongoose";

const pageSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true, lowercase: true },
    status: { type: String, enum: ["draft", "published"], default: "draft" },
    seoTitle: { type: String, trim: true, default: "" },
    seoDescription: { type: String, trim: true, default: "" },
    sections: [{ type: Schema.Types.ObjectId, ref: "PageSection" }],
  },
  { timestamps: true },
);

const Page = models.Page ?? model("Page", pageSchema);

export default Page;
