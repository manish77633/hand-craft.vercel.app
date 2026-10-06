import { model, models, Schema } from "mongoose";
import { isSafeUrl } from "@/lib/safe-url";

const buttonSchema = new Schema(
  {
    label: { type: String, trim: true },
    url: { type: String, trim: true, validate: { validator: isSafeUrl, message: "Use a relative path or a valid https, mailto or tel link." } },
  },
  { _id: false },
);

const pageSectionSchema = new Schema(
  {
    type: { type: String, required: true, trim: true },
    heading: { type: String, trim: true, default: "" },
    subheading: { type: String, trim: true, default: "" },
    description: { type: String, trim: true, default: "" },
    faqs: { type: [new Schema({ question: { type: String, required: true, trim: true }, answer: { type: String, required: true, trim: true } }, { _id: false })], default: undefined },
    items: { type: [new Schema({ title: { type: String, required: true, trim: true }, description: { type: String, trim: true, default: "" }, url: { type: String, trim: true, validate: isSafeUrl }, label: { type: String, trim: true } }, { _id: false })], default: undefined },
    media: [{ type: Schema.Types.ObjectId, ref: "Media" }],
    button: { type: buttonSchema, default: null },
    products: [{ type: Schema.Types.ObjectId, ref: "Product" }],
    productSource: { type: String, enum: ["automatic", "manual"], default: "automatic" },
    categories: [{ type: Schema.Types.ObjectId, ref: "Category" }],
    visible: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true },
);

const PageSection = models.PageSection ?? model("PageSection", pageSectionSchema);

export default PageSection;
