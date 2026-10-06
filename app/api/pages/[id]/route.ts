import Page from "@/models/Page";
import "@/models/PageSection";
import { createItemHandlers } from "@/lib/api/crud";

const handlers = createItemHandlers(Page, {
  populate: ["sections"],
  slugField: "slug",
});

export const GET = handlers.GET;
export const PATCH = handlers.PATCH;
export const DELETE = handlers.DELETE;
