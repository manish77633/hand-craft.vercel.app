import Product from "@/models/Product";
import "@/models/Category";
import "@/models/Media";
import { createItemHandlers } from "@/lib/api/crud";
import PageSection from "@/models/PageSection";
import { connectToDatabase } from "@/lib/mongodb";
import { apiError, readJsonObject } from "@/lib/api/errors";
import { normalizeProductMedia, validateProductCategory } from "@/lib/api/product-media";
import { isObjectIdOrHexString } from "mongoose";
import { NextResponse } from "next/server";

const handlers = createItemHandlers(Product, {
  populate: ["category", "media"],
  slugField: "slug",
});

export const GET = handlers.GET;

function productFilter(identifier: string) {
  return isObjectIdOrHexString(identifier) ? { _id: identifier } : { slug: identifier };
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    await connectToDatabase();
    const { id } = await context.params;
    const body = await readJsonObject(request);
    if (body.category !== undefined) await validateProductCategory(body.category);
    if (body.media !== undefined) body.media = await normalizeProductMedia(body.media);
    const updateOps: Record<string, unknown> = { $set: body };
    if (body.sku !== undefined) {
      if (body.sku) {
        body.sku = String(body.sku).trim().toUpperCase();
      } else {
        delete body.sku;
        updateOps.$unset = { sku: 1 };
      }
    }
    const product = await Product.findOneAndUpdate(productFilter(id), updateOps, { returnDocument: "after", runValidators: true });
    if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(product);
  } catch (error) {
    return apiError(error);
  }
}

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    await connectToDatabase();
    const { id } = await context.params;
    const product = await Product.findOne(productFilter(id));
    if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (await PageSection.exists({ products: product._id })) {
      return NextResponse.json({ error: "This product is linked from a page section." }, { status: 409 });
    }
    await product.deleteOne();
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return apiError(error);
  }
}
