import PageSection from "@/models/PageSection";
import "@/models/Category";
import "@/models/Media";
import "@/models/Product";
import { createItemHandlers } from "@/lib/api/crud";

const handlers = createItemHandlers(PageSection, {
  populate: ["media", "products", "categories"],
});

export const GET = handlers.GET;
export const PATCH = handlers.PATCH;
export const DELETE = handlers.DELETE;
