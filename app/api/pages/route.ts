import Page from "@/models/Page";
import "@/models/PageSection";
import { createCollectionHandlers } from "@/lib/api/crud";

const handlers = createCollectionHandlers(Page, {
  filterKeys: ["status"],
  populate: ["sections"],
  slugField: "slug",
});

export const GET = handlers.GET;
export const POST = handlers.POST;
