import { model, models, Schema } from "mongoose";

const mediaSchema = new Schema(
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
  { timestamps: true },
);

const Media = models.Media ?? model("Media", mediaSchema);

export default Media;
