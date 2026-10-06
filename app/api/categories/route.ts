import Category from "@/models/Category";
import "@/models/Media";
import { createCollectionHandlers } from "@/lib/api/crud";

const handlers = createCollectionHandlers(Category, {
  filterKeys: ["active"],
  populate: ["image"],
  slugField: "slug",
  defaultSort: "order name",
});

export const GET = handlers.GET;
export const POST = handlers.POST;
