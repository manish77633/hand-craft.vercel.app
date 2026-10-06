import { Schema } from "mongoose";
import { isSafeUrl } from "@/lib/safe-url";

export const socialLinkSchema = new Schema(
  {
    platform: { type: String, required: true, trim: true },
    url: { type: String, required: true, trim: true, validate: { validator: (value: string) => /^https?:\/\//i.test(value) && isSafeUrl(value), message: "Social links must use http or https." } },
  },
  { _id: false },
);

export const linkSchema = new Schema(
  {
    label: { type: String, required: true, trim: true },
    url: { type: String, required: true, trim: true, validate: isSafeUrl },
  },
  { _id: false },
);

export const seoSchema = new Schema(
  {
    title: { type: String, trim: true },
    description: { type: String, trim: true },
  },
  { _id: false },
);
