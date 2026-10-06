import PageSection from "@/models/PageSection";
import "@/models/Category";
import "@/models/Media";
import "@/models/Product";
import { createCollectionHandlers } from "@/lib/api/crud";

const handlers = createCollectionHandlers(PageSection, {
  filterKeys: ["type", "visible"],
  populate: ["media", "products", "categories"],
  defaultSort: "order createdAt",
});

export const GET = handlers.GET;
export const POST = handlers.POST;
