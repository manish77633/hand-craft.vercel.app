import { model, models, Schema } from "mongoose";

const navigationSchema = new Schema(
  {
    label: { type: String, required: true, trim: true },
    url: { type: String, trim: true, default: "" },
    page: { type: Schema.Types.ObjectId, ref: "Page", default: null },
    visible: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true },
);

const Navigation = models.Navigation ?? model("Navigation", navigationSchema);

export default Navigation;
