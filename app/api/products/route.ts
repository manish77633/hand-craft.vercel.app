import Product from "@/models/Product";
import "@/models/Category";
import "@/models/Media";
import { createCollectionHandlers } from "@/lib/api/crud";
import { connectToDatabase } from "@/lib/mongodb";
import { apiError, readJsonObject } from "@/lib/api/errors";
import { normalizeProductMedia, validateProductCategory } from "@/lib/api/product-media";
import { NextResponse } from "next/server";
import { pagination } from "@/lib/api/pagination";

const handlers = createCollectionHandlers(Product, {
  filterKeys: ["category", "featured", "available"],
  populate: ["category", "media"],
  slugField: "slug",
});

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get("q")?.trim();
  if (!search) return handlers.GET(request);

  try {
    await connectToDatabase();
    const { page, limit } = pagination(searchParams);
    const regex = new RegExp(escapeRegExp(search), "i");
    const filter: Record<string, unknown> = {
      $or: [{ title: regex }, { slug: regex }, { sku: regex }],
    };
    const category = searchParams.get("category");
    if (category) filter.category = category;
    for (const key of ["featured", "available"]) { const value = searchParams.get(key); if (value === "true" || value === "false") filter[key] = value === "true"; }

    const [items, total] = await Promise.all([
      Product.find(filter)
        .populate("category media")
        .sort(searchParams.get("sort") ?? "-createdAt")
        .skip((page - 1) * limit)
        .limit(limit)
        .lean()
        .exec(),
      Product.countDocuments(filter),
    ]);

    return NextResponse.json({ items, pagination: { page, limit, total } });
  } catch (error) {
    return apiError(error);
  }
}

export async function POST(request: Request) {
  try {
    await connectToDatabase();
    const body = await readJsonObject(request);
    await validateProductCategory(body.category);
    body.media = await normalizeProductMedia(body.media ?? []);
    if (body.sku) {
      body.sku = String(body.sku).trim().toUpperCase();
    } else {
      delete body.sku;
    }
    const product = await Product.create(body);
    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    return apiError(error);
  }
}
