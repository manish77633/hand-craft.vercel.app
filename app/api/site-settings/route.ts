import SiteSettings from "@/models/SiteSettings";
import "@/models/Media";
import { createSingletonHandlers } from "@/lib/api/crud";

const handlers = createSingletonHandlers(SiteSettings, { populate: ["logo"] });

export const GET = handlers.GET;
export const PUT = handlers.PUT;
export const PATCH = handlers.PATCH;
