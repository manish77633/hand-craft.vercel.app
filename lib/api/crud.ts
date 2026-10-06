import { isObjectIdOrHexString, type Model } from "mongoose";
type FilterQuery = Record<string, unknown>;
import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { apiError, readJsonObject } from "./errors";
import { pagination } from "./pagination";

type ContentRecord = Record<string, unknown>;

type CrudOptions = {
  filterKeys?: string[];
  populate?: string[];
  slugField?: string;
  defaultSort?: string;
};

function getPopulate(options: CrudOptions) {
  return options.populate?.join(" ");
}

export function createCollectionHandlers(
  model: Model<ContentRecord>,
  options: CrudOptions = {},
) {
  return {
    async GET(request: Request) {
      try {
        await connectToDatabase();

        const { searchParams } = new URL(request.url);
        const { page, limit } = pagination(searchParams);
        const filter: FilterQuery = {};

        for (const key of options.filterKeys ?? []) {
          const value = searchParams.get(key);
          if (value !== null) {
            filter[key] = value === "true" ? true : value === "false" ? false : value;
          }
        }

        const populate = getPopulate(options);
        let query = model
          .find(filter)
          .sort(searchParams.get("sort") ?? options.defaultSort ?? "-createdAt")
          .skip((page - 1) * limit)
          .limit(limit);

        if (populate) query = query.populate(populate);

        const [items, total] = await Promise.all([query.lean().exec(), model.countDocuments(filter)]);

        return NextResponse.json({ items, pagination: { page, limit, total } });
      } catch (error) {
        return apiError(error);
      }
    },

    async POST(request: Request) {
      try {
        await connectToDatabase();
        const body = await readJsonObject(request);
        const item = await model.create(body);
        return NextResponse.json(item, { status: 201 });
      } catch (error) {
        return apiError(error);
      }
    },
  };
}

export function createItemHandlers(
  model: Model<ContentRecord>,
  options: CrudOptions = {},
) {
  function identifierFilter(identifier: string): FilterQuery {
    if (isObjectIdOrHexString(identifier)) return { _id: identifier };
    if (options.slugField) return { [options.slugField]: identifier };
    return { _id: identifier };
  }

  return {
    async GET(_request: Request, context: { params: Promise<{ id: string }> }) {
      try {
        await connectToDatabase();
        const { id } = await context.params;
        const populate = getPopulate(options);
        let query = model.findOne(identifierFilter(id));
        if (populate) query = query.populate(populate);
        const item = await query.lean().exec();

        if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });
        return NextResponse.json(item);
      } catch (error) {
        return apiError(error);
      }
    },

    async PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
      try {
        await connectToDatabase();
        const { id } = await context.params;
        const body = await readJsonObject(request);
        const item = await model.findOneAndUpdate(identifierFilter(id), { $set: body }, {
          returnDocument: "after",
          runValidators: true,
        });

        if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });
        return NextResponse.json(item);
      } catch (error) {
        return apiError(error);
      }
    },

    async DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
      try {
        await connectToDatabase();
        const { id } = await context.params;
        const item = await model.findOneAndDelete(identifierFilter(id));

        if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });
        return new NextResponse(null, { status: 204 });
      } catch (error) {
        return apiError(error);
      }
    },
  };
}

export function createSingletonHandlers(
  model: Model<ContentRecord>,
  options: Pick<CrudOptions, "populate"> = {},
) {
  async function GET() {
    try {
      await connectToDatabase();
      const populate = getPopulate(options);
      let query = model.findOne({ key: "global" });
      if (populate) query = query.populate(populate);
      const item = await query.lean().exec();
      return NextResponse.json(item);
    } catch (error) {
      return apiError(error);
    }
  }

  async function update(request: Request) {
    try {
      await connectToDatabase();
      const body = await readJsonObject(request);
      delete body.key;
      const item = await model.findOneAndUpdate(
        { key: "global" },
        { $set: body, $setOnInsert: { key: "global" } },
        { returnDocument: "after", upsert: true, runValidators: true },
      );
      return NextResponse.json(item);
    } catch (error) {
      return apiError(error);
    }
  }

  return {
    GET,
    PUT: update,
    PATCH: update,
  };
}
