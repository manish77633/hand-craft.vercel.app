import Category from "@/models/Category";
import "@/models/Media";
import { createItemHandlers } from "@/lib/api/crud";
import PageSection from "@/models/PageSection";
import Product from "@/models/Product";
import { connectToDatabase } from "@/lib/mongodb";
import { apiError } from "@/lib/api/errors";
import { isObjectIdOrHexString } from "mongoose";
import { NextResponse } from "next/server";

const handlers = createItemHandlers(Category, {
  populate: ["image"],
  slugField: "slug",
});

export const GET = handlers.GET;
export const PATCH = handlers.PATCH;

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    await connectToDatabase();
    const { id } = await context.params;
    const filter = isObjectIdOrHexString(id) ? { _id: id } : { slug: id };
    const category = await Category.findOne(filter);
    if (!category) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const [product, pageSection] = await Promise.all([
      Product.exists({ category: category._id }),
      PageSection.exists({ categories: category._id }),
    ]);
    if (product || pageSection) {
      return NextResponse.json({ error: "This category is in use by products or page sections." }, { status: 409 });
    }

    await category.deleteOne();
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return apiError(error);
  }
}
