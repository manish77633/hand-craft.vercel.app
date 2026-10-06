import { NextResponse } from "next/server";
import { getCloudinary } from "@/lib/cloudinary";
import { apiError } from "@/lib/api/errors";

export async function POST() {
  try {
    const cloudinary = getCloudinary();
    const timestamp = Math.round(Date.now() / 1000);
    const folder = "ammaai";
    const signature = cloudinary.utils.api_sign_request(
      { folder, timestamp },
      process.env.CLOUDINARY_API_SECRET!,
    );

    return NextResponse.json({
      timestamp,
      folder,
      signature,
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      apiKey: process.env.CLOUDINARY_API_KEY,
    });
  } catch (error) {
    return apiError(error);
  }
}
