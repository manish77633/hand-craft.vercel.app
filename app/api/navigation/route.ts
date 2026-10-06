import Navigation from "@/models/Navigation";
import { createCollectionHandlers } from "@/lib/api/crud";

const handlers = createCollectionHandlers(Navigation, {
  filterKeys: ["visible"],
  populate: ["page"],
  defaultSort: "order createdAt",
});

export const GET = handlers.GET;
export const POST = handlers.POST;
