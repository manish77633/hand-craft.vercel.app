import Media from "@/models/Media";
import { createCollectionHandlers } from "@/lib/api/crud";
import { connectToDatabase } from "@/lib/mongodb";
import { apiError } from "@/lib/api/errors";
import { NextResponse } from "next/server";
import { pagination } from "@/lib/api/pagination";

const handlers = createCollectionHandlers(Media, { filterKeys: ["type"] });

export const POST = handlers.POST;

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export async function GET(request: Request) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const { page, limit } = pagination(searchParams);
    const type = searchParams.get("type");
    const search = searchParams.get("q")?.trim();
    const filter: Record<string, unknown> = {};

    if (type === "image" || type === "video") filter.type = type;
    if (search) {
      const expression = new RegExp(escapeRegExp(search), "i");
      filter.$or = [{ filename: expression }, { altText: expression }, { publicId: expression }];
    }

    const [items, total] = await Promise.all([
      Media.find(filter).sort("-createdAt").skip((page - 1) * limit).limit(limit),
      Media.countDocuments(filter),
    ]);

    return NextResponse.json({ items, pagination: { page, limit, total } });
  } catch (error) {
    return apiError(error);
  }
}
