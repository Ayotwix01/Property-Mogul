import { createServerFn } from "@tanstack/react-start";
import { and, asc, eq } from "drizzle-orm";
import { z } from "zod";
import { getDatabase } from "@/db";
import { favorites, properties, propertyImages } from "@/db/schema";
import { requireUser } from "@/lib/auth.functions";

const propertyId = z.object({ propertyId: z.string().uuid() });

export const addFavorite = createServerFn({ method: "POST" })
  .validator((data) => propertyId.parse(data))
  .handler(async ({ data }) => {
    const user = await requireUser();
    const database = getDatabase();
    const [property] = await database
      .select({ id: properties.id })
      .from(properties)
      .where(and(eq(properties.id, data.propertyId), eq(properties.status, "PUBLISHED")))
      .limit(1);
    if (!property) throw new Error("Only published properties can be favorited.");
    await database
      .insert(favorites)
      .values({ userId: user.id, propertyId: data.propertyId })
      .onConflictDoNothing();
    return { success: true };
  });

export const removeFavorite = createServerFn({ method: "POST" })
  .validator((data) => propertyId.parse(data))
  .handler(async ({ data }) => {
    const user = await requireUser();
    const database = getDatabase();
    await database
      .delete(favorites)
      .where(and(eq(favorites.userId, user.id), eq(favorites.propertyId, data.propertyId)));
    return { success: true };
  });

export const listFavorites = createServerFn({ method: "GET" }).handler(async () => {
  const user = await requireUser();
  const database = getDatabase();
  const rows = await database
    .select({ favorite: favorites, property: properties })
    .from(favorites)
    .innerJoin(properties, eq(favorites.propertyId, properties.id))
    .where(and(eq(favorites.userId, user.id), eq(properties.status, "PUBLISHED")));
  return Promise.all(
    rows.map(async (row) => {
      const images = await database
        .select({ imageUrl: propertyImages.imageUrl })
        .from(propertyImages)
        .where(eq(propertyImages.propertyId, row.property.id))
        .orderBy(asc(propertyImages.sortOrder));
      return {
        ...row,
        images: images.map(({ imageUrl }) => imageUrl),
        location: row.property.city + ", " + row.property.state,
        priceUnit:
          row.property.rentPeriod || (row.property.listingType === "RENT" ? "per year" : ""),
      };
    }),
  );
});
