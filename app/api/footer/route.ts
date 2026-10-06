import Footer from "@/models/Footer";
import { createSingletonHandlers } from "@/lib/api/crud";

const handlers = createSingletonHandlers(Footer);

export const GET = handlers.GET;
export const PUT = handlers.PUT;
export const PATCH = handlers.PATCH;
