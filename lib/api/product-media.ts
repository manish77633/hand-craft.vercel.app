import { Types } from "mongoose";
import Media from "@/models/Media";
import Category from "@/models/Category";
import { ApiRequestError } from "./errors";
export async function validateProductCategory(value: unknown) {
  if (typeof value !== "string" || !Types.ObjectId.isValid(value) || !await Category.exists({ _id: value })) throw new ApiRequestError("Choose an existing product category.");
}

export async function normalizeProductMedia(value: unknown) {
  if (!Array.isArray(value)) throw new ApiRequestError("Product media must be an array.");

  const ids = [...new Set(value.map(String))];
  if (ids.some(id => !Types.ObjectId.isValid(id))) throw new ApiRequestError("Product media contains an invalid identifier.");

  const media = await Media.find({ _id: { $in: ids } }).select("_id type").lean();
  if (media.length !== ids.length) throw new ApiRequestError("One or more selected media items no longer exist.");

  const typeById = new Map(media.map(item => [String(item._id), item.type]));
  const videos = ids.filter(id => typeById.get(id) === "video");
  const images = ids.filter(id => typeById.get(id) === "image");

  if (videos.length > 1) throw new ApiRequestError("A product can have only one video.");
  if (images.length > 4) throw new ApiRequestError("A product can have no more than four images.");

  return [...videos, ...images];
}
