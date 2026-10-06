import Navigation from "@/models/Navigation";
import { createItemHandlers } from "@/lib/api/crud";

const handlers = createItemHandlers(Navigation, { populate: ["page"] });

export const GET = handlers.GET;
export const PATCH = handlers.PATCH;
export const DELETE = handlers.DELETE;
