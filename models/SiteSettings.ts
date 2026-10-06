import { model, models, Schema } from "mongoose";
import { seoSchema, socialLinkSchema } from "./shared";

const contactSchema = new Schema(
  {
    email: { type: String, trim: true },
    phone: { type: String, trim: true },
    address: { type: String, trim: true },
  },
  { _id: false },
);

const siteSettingsSchema = new Schema(
  {
    key: { type: String, default: "global", unique: true, immutable: true },
    logo: { type: Schema.Types.ObjectId, ref: "Media", default: null },
    whatsapp: { type: String, trim: true, default: "", validate: { validator: (value: string) => !value || /^\d{8,15}$/.test(value), message: "WhatsApp number must contain 8–15 digits, including country code." } },
    contact: { type: contactSchema, default: () => ({}) },
    socialLinks: { type: [socialLinkSchema], default: [] },
    defaultSeo: { type: seoSchema, default: () => ({}) },
  },
  { timestamps: true },
);

const SiteSettings = models.SiteSettings ?? model("SiteSettings", siteSettingsSchema);

export default SiteSettings;
