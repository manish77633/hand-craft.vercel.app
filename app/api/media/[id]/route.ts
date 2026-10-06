import Media from "@/models/Media";
import { createItemHandlers } from "@/lib/api/crud";
import Category from "@/models/Category";
import PageSection from "@/models/PageSection";
import Product from "@/models/Product";
import SiteSettings from "@/models/SiteSettings";
import { connectToDatabase } from "@/lib/mongodb";
import { getCloudinary } from "@/lib/cloudinary";
import { apiError } from "@/lib/api/errors";
import { NextResponse } from "next/server";

const handlers = createItemHandlers(Media);

export const GET = handlers.GET;
export const PATCH = handlers.PATCH;

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    await connectToDatabase();
    const { id } = await context.params;
    const media = await Media.findById(id);

    if (!media) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const [product, category, pageSection, siteSettings] = await Promise.all([
      Product.exists({ media: media._id }),
      Category.exists({ image: media._id }),
      PageSection.exists({ media: media._id }),
      SiteSettings.exists({ logo: media._id }),
    ]);
    const usedBy = [
      product && "products",
      category && "categories",
      pageSection && "page sections",
      siteSettings && "site settings",
    ].filter(Boolean);

    if (usedBy.length) {
      return NextResponse.json(
        { error: "This media item is currently in use", usedBy },
        { status: 409 },
      );
    }

    const cloudinary = getCloudinary();
    const result = await cloudinary.uploader.destroy(media.publicId, {
      resource_type: media.type,
      invalidate: true,
    });

    if (result.result !== "ok" && result.result !== "not found") {
      throw new Error(`Cloudinary deletion failed: ${result.result}`);
    }

    await media.deleteOne();
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return apiError(error);
  }
}
