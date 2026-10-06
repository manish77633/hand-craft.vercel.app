import { Error as MongooseError } from "mongoose";
import { NextResponse } from "next/server";

type MongoError = Error & { code?: number };

export class ApiRequestError extends Error {}

export function apiError(error: unknown) {
  if (error instanceof ApiRequestError) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  if (error instanceof MongooseError.ValidationError) {
    return NextResponse.json(
      { error: "Validation failed", details: error.errors },
      { status: 400 },
    );
  }

  if (error instanceof MongooseError.CastError) {
    return NextResponse.json({ error: "Invalid identifier or field value" }, { status: 400 });
  }

  if (error instanceof Error && (error as MongoError).code === 11000) {
    const keyPattern = (error as unknown as { keyPattern?: Record<string, unknown> }).keyPattern;
    const field = keyPattern ? Object.keys(keyPattern)[0] : null;
    if (field === "sku") {
      return NextResponse.json({ error: "A product with this SKU already exists. SKU must be unique." }, { status: 409 });
    }
    if (field === "slug") {
      return NextResponse.json({ error: "A record with this slug already exists." }, { status: 409 });
    }
    return NextResponse.json({ error: "A record with that unique value already exists." }, { status: 409 });
  }

  console.error(error);
  return NextResponse.json({ error: "Internal server error" }, { status: 500 });
}

export async function readJsonObject(request: Request) {
  let value: unknown;
  try { value = await request.json(); } catch { throw new ApiRequestError("Request body must contain valid JSON"); }

  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new ApiRequestError("Request body must be a JSON object");
  }

  const body = value as Record<string, unknown>;
  for (const key of Object.keys(body)) {
    if (key.startsWith("$") || key.includes(".") || ["__proto__", "constructor", "prototype"].includes(key)) throw new ApiRequestError("Invalid field name");
  }
  for (const key of ["_id", "__v", "createdAt", "updatedAt"]) delete body[key];
  return body;
}
