import { model, models, Schema } from "mongoose";
import { linkSchema, socialLinkSchema } from "./shared";

const footerSchema = new Schema(
  {
    key: { type: String, default: "global", unique: true, immutable: true },
    description: { type: String, trim: true, default: "" },
    links: { type: [linkSchema], default: [] },
    socialLinks: { type: [socialLinkSchema], default: [] },
    copyright: { type: String, trim: true, default: "" },
  },
  { timestamps: true },
);

const Footer = models.Footer ?? model("Footer", footerSchema);

export default Footer;
