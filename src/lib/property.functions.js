import { createServerFn } from "@tanstack/react-start";
import { and, asc, count, desc, eq, gte, ilike, inArray, lte, or } from "drizzle-orm";
import { z } from "zod";
import { getDatabase } from "@/db";
import { profiles, propertyImages, properties, users } from "@/db/schema";
import { requireUser } from "@/lib/auth.functions";
import { canPublishProperty, canTransitionPropertyStatus } from "@/lib/backend.logic";

const searchSchema = z.object({
  location: z.string().trim().max(100).optional(),
  minPrice: z.number().nonnegative().optional(),
  maxPrice: z.number().nonnegative().optional(),
  bedrooms: z.number().int().nonnegative().optional(),
  bathrooms: z.number().int().nonnegative().optional(),
  propertyType: z.string().trim().max(80).optional(),
  listingType: z.enum(["RENT", "SALE"]).optional(),
  verificationStatus: z
    .enum(["NOT_STARTED", "PENDING", "VERIFIED", "REJECTED", "EXPIRED"])
    .optional(),
  sort: z.enum(["newest", "price_asc", "price_desc", "beds"]).default("newest"),
  page: z.number().int().positive().default(1),
  pageSize: z.number().int().positive().max(50).default(20),
});

const propertyInput = z.object({
  title: z.string().trim().min(3).max(240),
  description: z.string().trim().max(10000).optional(),
  propertyType: z.string().trim().min(2).max(80),
  listingType: z.enum(["RENT", "SALE"]),
  price: z.number().positive(),
  currency: z.string().length(3).default("NGN"),
  rentPeriod: z.string().trim().max(40).optional(),
  bedrooms: z.number().int().nonnegative().optional(),
  bathrooms: z.number().int().nonnegative().optional(),
  toilets: z.number().int().nonnegative().optional(),
  squareFeet: z.number().int().positive().optional(),
  address: z.string().trim().max(500).optional(),
  neighborhood: z.string().trim().max(120).optional(),
  city: z.string().trim().min(2).max(100),
  state: z.string().trim().min(2).max(100),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  amenities: z.array(z.string().trim().max(80)).max(50).default([]),
});

function searchConditions(data) {
  const conditions = [eq(properties.status, "PUBLISHED")];
  if (data.location) {
    const pattern = "%" + data.location + "%";
    conditions.push(
      or(
        ilike(properties.city, pattern),
        ilike(properties.state, pattern),
        ilike(properties.address, pattern),
        ilike(properties.neighborhood, pattern),
      ),
    );
  }
  if (data.minPrice !== undefined) conditions.push(gte(properties.price, String(data.minPrice)));
  if (data.maxPrice !== undefined) conditions.push(lte(properties.price, String(data.maxPrice)));
  if (data.bedrooms !== undefined) conditions.push(gte(properties.bedrooms, data.bedrooms));
  if (data.bathrooms !== undefined) conditions.push(gte(properties.bathrooms, data.bathrooms));
  if (data.propertyType) conditions.push(eq(properties.propertyType, data.propertyType));
  if (data.listingType) conditions.push(eq(properties.listingType, data.listingType));
  if (data.verificationStatus) {
    conditions.push(eq(properties.verificationStatus, data.verificationStatus));
  }
  return and(...conditions);
}

function toUiProperty(property, images = [], owner = null) {
  return {
    ...property,
    images,
    location: property.city + ", " + property.state,
    category: property.propertyType,
    priceUnit: property.rentPeriod || (property.listingType === "RENT" ? "per year" : ""),
    beds: property.bedrooms,
    baths: property.bathrooms,
    sqft: property.squareFeet,
    tags: [
      {
        label: property.verificationStatus === "VERIFIED" ? "VERIFIED" : "AVAILABLE",
        tone: property.verificationStatus === "VERIFIED" ? "success" : "primary",
      },
    ],
    specs: [
      { icon: "bed", label: property.bedrooms ? property.bedrooms + " Beds" : "Property" },
      { icon: "bathtub", label: property.bathrooms ? property.bathrooms + " Baths" : "— Baths" },
      {
        icon: "square_foot",
        label: property.squareFeet ? property.squareFeet + " sqft" : "Size unavailable",
      },
    ],
    totalUnits: "—",
    owner,
  };
}

export async function searchPublishedProperties(data) {
  const validated = searchSchema.parse(data);
  const database = getDatabase();
  const offset = (validated.page - 1) * validated.pageSize;
  const order =
    validated.sort === "price_asc"
      ? asc(properties.price)
      : validated.sort === "price_desc"
        ? desc(properties.price)
        : validated.sort === "beds"
          ? desc(properties.bedrooms)
          : desc(properties.createdAt);
  const [rows, total] = await Promise.all([
    database
      .select()
      .from(properties)
      .where(searchConditions(validated))
      .orderBy(order)
      .limit(validated.pageSize)
      .offset(offset),
    database.select({ total: count() }).from(properties).where(searchConditions(validated)),
  ]);
  const propertiesWithImages = await Promise.all(
    rows.map(async (property) => {
      const images = await database
        .select({ imageUrl: propertyImages.imageUrl })
        .from(propertyImages)
        .where(eq(propertyImages.propertyId, property.id))
        .orderBy(asc(propertyImages.sortOrder));
      return toUiProperty(
        property,
        images.map(({ imageUrl }) => imageUrl),
      );
    }),
  );
  return {
    properties: propertiesWithImages,
    total: Number(total[0]?.total || 0),
    page: validated.page,
    pageSize: validated.pageSize,
  };
}

export const listPublishedProperties = createServerFn({ method: "POST" })
  .validator((data) => searchSchema.parse(data))
  .handler(async ({ data }) => searchPublishedProperties(data));

export async function getPublishedPropertiesByIds(ids) {
  const validatedIds = z.array(z.string().uuid()).max(12).parse(ids);
  if (!validatedIds.length) return [];
  const database = getDatabase();
  const rows = await database
    .select()
    .from(properties)
    .where(and(eq(properties.status, "PUBLISHED"), inArray(properties.id, validatedIds)));
  return Promise.all(
    validatedIds
      .map((id) => rows.find((property) => property.id === id))
      .filter(Boolean)
      .map(async (property) => {
        const images = await database
          .select({ imageUrl: propertyImages.imageUrl })
          .from(propertyImages)
          .where(eq(propertyImages.propertyId, property.id))
          .orderBy(asc(propertyImages.sortOrder));
        return toUiProperty(
          property,
          images.map(({ imageUrl }) => imageUrl),
        );
      }),
  );
}

export const getPublishedProperty = createServerFn({ method: "POST" })
  .validator((data) => z.object({ id: z.string().uuid() }).parse(data))
  .handler(async ({ data }) => {
    const database = getDatabase();
    const [property] = await database
      .select()
      .from(properties)
      .where(and(eq(properties.id, data.id), eq(properties.status, "PUBLISHED")))
      .limit(1);
    if (!property) throw new Error("Property not found.");
    const images = await database
      .select({ imageUrl: propertyImages.imageUrl })
      .from(propertyImages)
      .where(eq(propertyImages.propertyId, property.id))
      .orderBy(asc(propertyImages.sortOrder));
    const [owner] = await database
      .select({
        name: profiles.displayName,
        title: profiles.bio,
        trustStatus: profiles.trustStatus,
      })
      .from(users)
      .leftJoin(profiles, eq(profiles.userId, users.id))
      .where(eq(users.id, property.ownerId))
      .limit(1);
    return toUiProperty(
      property,
      images.map(({ imageUrl }) => imageUrl),
      owner
        ? {
            ...owner,
            name: owner.name || "Property Owner",
            title: owner.title || "Property Owner",
          }
        : null,
    );
  });

export const listOwnProperties = createServerFn({ method: "GET" }).handler(async () => {
  const user = await requireUser("LANDLORD");
  const database = getDatabase();
  const rows = await database
    .select()
    .from(properties)
    .where(eq(properties.ownerId, user.id))
    .orderBy(desc(properties.updatedAt));
  return Promise.all(
    rows.map(async (property) => {
      const images = await database
        .select({ imageUrl: propertyImages.imageUrl })
        .from(propertyImages)
        .where(eq(propertyImages.propertyId, property.id))
        .orderBy(asc(propertyImages.sortOrder));
      return toUiProperty(
        property,
        images.map(({ imageUrl }) => imageUrl),
      );
    }),
  );
});

export const getOwnProperty = createServerFn({ method: "POST" })
  .validator((data) => z.object({ id: z.string().uuid() }).parse(data))
  .handler(async ({ data }) => {
    const user = await requireUser("LANDLORD");
    const database = getDatabase();
    const [property] = await database
      .select()
      .from(properties)
      .where(and(eq(properties.id, data.id), eq(properties.ownerId, user.id)))
      .limit(1);
    if (!property) throw new Error("Property not found or not owned by you.");
    const images = await database
      .select({ imageUrl: propertyImages.imageUrl })
      .from(propertyImages)
      .where(eq(propertyImages.propertyId, property.id))
      .orderBy(asc(propertyImages.sortOrder));
    return toUiProperty(
      property,
      images.map(({ imageUrl }) => imageUrl),
    );
  });

export const createProperty = createServerFn({ method: "POST" })
  .validator((data) => propertyInput.parse(data))
  .handler(async ({ data }) => {
    const user = await requireUser("LANDLORD");
    const database = getDatabase();
    const [property] = await database
      .insert(properties)
      .values({ ...data, ownerId: user.id, status: "DRAFT" })
      .returning();
    return property;
  });

export const updateOwnProperty = createServerFn({ method: "POST" })
  .validator((data) =>
    z.object({ id: z.string().uuid(), changes: propertyInput.partial() }).parse(data),
  )
  .handler(async ({ data }) => {
    const user = await requireUser("LANDLORD");
    const database = getDatabase();
    const [property] = await database
      .update(properties)
      .set({ ...data.changes, updatedAt: new Date() })
      .where(and(eq(properties.id, data.id), eq(properties.ownerId, user.id)))
      .returning();
    if (!property) throw new Error("Property not found or not owned by you.");
    return property;
  });

export const setOwnPropertyStatus = createServerFn({ method: "POST" })
  .validator((data) =>
    z
      .object({
        id: z.string().uuid(),
        status: z.enum(["PUBLISHED", "UNPUBLISHED", "ARCHIVED"]),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    const user = await requireUser("LANDLORD");
    const database = getDatabase();
    const [current] = await database
      .select({ status: properties.status })
      .from(properties)
      .where(and(eq(properties.id, data.id), eq(properties.ownerId, user.id)))
      .limit(1);
    if (!current) throw new Error("Property not found or not owned by you.");
    if (!canTransitionPropertyStatus(current.status, data.status)) {
      throw new Error(
        `Cannot change a ${current.status.toLowerCase()} property to ${data.status.toLowerCase()}.`,
      );
    }
    if (data.status === "PUBLISHED" && !canPublishProperty(user)) {
      throw new Error("Identity verification is required before publishing a property.");
    }
    const [property] = await database
      .update(properties)
      .set({
        status: data.status,
        publishedAt: data.status === "PUBLISHED" ? new Date() : null,
        updatedAt: new Date(),
      })
      .where(and(eq(properties.id, data.id), eq(properties.ownerId, user.id)))
      .returning();
    if (!property) throw new Error("Property not found or not owned by you.");
    return property;
  });
