import { createServerFn } from "@tanstack/react-start";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { getDatabase } from "@/db";
import { profiles, userRoles } from "@/db/schema";
import { requireUser } from "@/lib/auth.functions";

const profileInput = z.object({
  displayName: z.string().trim().min(2).max(160),
  phone: z.string().trim().max(40).optional(),
  bio: z.string().trim().max(1000).optional(),
  location: z.string().trim().max(160).optional(),
  disclosure: z.record(z.string(), z.string()).default({}),
});

export const getMyProfile = createServerFn({ method: "GET" }).handler(async () => {
  const user = await requireUser();
  const database = getDatabase();
  const [profile] = await database
    .select()
    .from(profiles)
    .where(eq(profiles.userId, user.id))
    .limit(1);
  const roles = await database
    .select({ role: userRoles.role })
    .from(userRoles)
    .where(eq(userRoles.userId, user.id));
  return {
    user: { id: user.id, email: user.email, status: user.status },
    roles: roles.map(({ role }) => role),
    profile: profile || null,
  };
});

export const updateMyProfile = createServerFn({ method: "POST" })
  .validator((data) => profileInput.parse(data))
  .handler(async ({ data }) => {
    const user = await requireUser();
    const database = getDatabase();
    const [profile] = await database
      .insert(profiles)
      .values({ userId: user.id, ...data })
      .onConflictDoUpdate({
        target: profiles.userId,
        set: { ...data, updatedAt: new Date() },
      })
      .returning();
    return profile;
  });
