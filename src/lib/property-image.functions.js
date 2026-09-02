import { createServerFn } from "@tanstack/react-start";
import { and, asc, eq } from "drizzle-orm";
import { z } from "zod";
import { getDatabase } from "@/db";
import { properties, propertyImages } from "@/db/schema";
import { requireUser } from "@/lib/auth.functions";

const imageInput = z.object({
  propertyId: z.string().uuid(),
  imageUrl: z.string().url().max(2000),
});

const imageIdInput = z.object({ imageId: z.string().uuid() });

async function requireOwnedProperty(database, propertyId, userId) {
  const [property] = await database
    .select({ id: properties.id })
    .from(properties)
    .where(and(eq(properties.id, propertyId), eq(properties.ownerId, userId)))
    .limit(1);
  if (!property) throw new Error("Property not found or not owned by you.");
}

export const addPropertyImage = createServerFn({ method: "POST" })
  .validator((data) => imageInput.parse(data))
  .handler(async ({ data }) => {
    const user = await requireUser("LANDLORD");
    const database = getDatabase();
    await requireOwnedProperty(database, data.propertyId, user.id);
    const existing = await database
      .select({ id: propertyImages.id })
      .from(propertyImages)
      .where(eq(propertyImages.propertyId, data.propertyId));
    const [image] = await database
      .insert(propertyImages)
      .values({ propertyId: data.propertyId, imageUrl: data.imageUrl, sortOrder: existing.length })
      .returning();
    return image;
  });

export const deletePropertyImage = createServerFn({ method: "POST" })
  .validator((data) => imageIdInput.parse(data))
  .handler(async ({ data }) => {
    const user = await requireUser("LANDLORD");
    const database = getDatabase();
    const [image] = await database
      .select({ id: propertyImages.id, propertyId: propertyImages.propertyId })
      .from(propertyImages)
      .where(eq(propertyImages.id, data.imageId))
      .limit(1);
    if (!image) throw new Error("Image not found.");
    await requireOwnedProperty(database, image.propertyId, user.id);
    await database.delete(propertyImages).where(eq(propertyImages.id, data.imageId));
    return { success: true };
  });

export const listOwnPropertyImages = createServerFn({ method: "POST" })
  .validator((data) => z.object({ propertyId: z.string().uuid() }).parse(data))
  .handler(async ({ data }) => {
    const user = await requireUser("LANDLORD");
    const database = getDatabase();
    await requireOwnedProperty(database, data.propertyId, user.id);
    return database
      .select()
      .from(propertyImages)
      .where(eq(propertyImages.propertyId, data.propertyId))
      .orderBy(asc(propertyImages.sortOrder));
  });
