import { createServerFn } from "@tanstack/react-start";
import { and, desc, eq, inArray, ne, or } from "drizzle-orm";
import { z } from "zod";
import { getDatabase } from "@/db";
import {
  blocks,
  inquiries,
  messages,
  profiles,
  properties,
  reports,
  viewingRequests,
} from "@/db/schema";
import { requireUser } from "@/lib/auth.functions";

const inquiryInput = z.object({
  propertyId: z.string().uuid(),
  message: z.string().trim().min(10).max(2000),
  requestedDate: z.coerce.date().optional(),
});
const inquiryIdInput = z.object({ inquiryId: z.string().uuid() });
const messageInput = z.object({
  inquiryId: z.string().uuid(),
  body: z.string().trim().min(1).max(2000),
});
const statusInput = z.object({
  inquiryId: z.string().uuid(),
  status: z.enum(["RESPONDED", "CLOSED"]),
});
const viewingStatusInput = z.object({
  viewingId: z.string().uuid(),
  status: z.enum(["ACCEPTED", "DECLINED", "COMPLETED"]),
});
const reportInput = z.object({
  targetType: z.enum(["PROPERTY", "INQUIRY", "USER"]),
  targetId: z.string().uuid(),
  category: z.enum([
    "SCAM",
    "FRAUD",
    "HARASSMENT",
    "INAPPROPRIATE_CONTENT",
    "FAKE_LISTING",
    "OTHER",
  ]),
  description: z.string().trim().max(2000).optional(),
});
const userIdInput = z.object({ userId: z.string().uuid() });

async function getInquiry(database, inquiryId, userId) {
  const [inquiry] = await database
    .select()
    .from(inquiries)
    .where(and(eq(inquiries.id, inquiryId), inArray(inquiries.seekerId, [userId])))
    .limit(1);
  const [landlordInquiry] = await database
    .select()
    .from(inquiries)
    .where(and(eq(inquiries.id, inquiryId), eq(inquiries.landlordId, userId)))
    .limit(1);
  return inquiry || landlordInquiry || null;
}

async function hasConversationWithUser(database, currentUserId, otherUserId) {
  const [inquiry] = await database
    .select({ id: inquiries.id })
    .from(inquiries)
    .where(
      or(
        and(eq(inquiries.seekerId, currentUserId), eq(inquiries.landlordId, otherUserId)),
        and(eq(inquiries.seekerId, otherUserId), eq(inquiries.landlordId, currentUserId)),
      ),
    )
    .limit(1);
  return Boolean(inquiry);
}

export const createInquiry = createServerFn({ method: "POST" })
  .validator((data) => inquiryInput.parse(data))
  .handler(async ({ data }) => {
    const user = await requireUser("SEEKER");
    const database = getDatabase();
    const [property] = await database
      .select({ id: properties.id, ownerId: properties.ownerId })
      .from(properties)
      .where(and(eq(properties.id, data.propertyId), eq(properties.status, "PUBLISHED")))
      .limit(1);
    if (!property) throw new Error("Property is not available.");
    if (property.ownerId === user.id)
      throw new Error("You cannot contact yourself about your property.");
    const [blocked] = await database
      .select({ id: blocks.id })
      .from(blocks)
      .where(
        or(
          and(eq(blocks.blockerId, user.id), eq(blocks.blockedId, property.ownerId)),
          and(eq(blocks.blockerId, property.ownerId), eq(blocks.blockedId, user.id)),
        ),
      )
      .limit(1);
    if (blocked) throw new Error("Communication is unavailable between these accounts.");
    const [inquiry] = await database
      .insert(inquiries)
      .values({
        propertyId: property.id,
        seekerId: user.id,
        landlordId: property.ownerId,
        message: data.message,
      })
      .returning();
    await database
      .insert(messages)
      .values({ inquiryId: inquiry.id, senderId: user.id, body: data.message });
    if (data.requestedDate)
      await database.insert(viewingRequests).values({
        inquiryId: inquiry.id,
        propertyId: property.id,
        seekerId: user.id,
        landlordId: property.ownerId,
        requestedDate: data.requestedDate,
        status: "REQUESTED",
      });
    return { id: inquiry.id };
  });

export const listMyInquiries = createServerFn({ method: "GET" }).handler(async () => {
  const user = await requireUser();
  const database = getDatabase();
  return database
    .select({
      inquiry: inquiries,
      property: properties,
      counterpart: {
        userId: profiles.userId,
        displayName: profiles.displayName,
        bio: profiles.bio,
        location: profiles.location,
        trustStatus: profiles.trustStatus,
      },
    })
    .from(inquiries)
    .innerJoin(properties, eq(inquiries.propertyId, properties.id))
    .leftJoin(profiles, eq(inquiries.landlordId, profiles.userId))
    .where(inArray(inquiries.seekerId, [user.id]))
    .orderBy(desc(inquiries.updatedAt));
});

export const listReceivedInquiries = createServerFn({ method: "GET" }).handler(async () => {
  const user = await requireUser("LANDLORD");
  return getDatabase()
    .select({
      inquiry: inquiries,
      property: properties,
      counterpart: {
        userId: profiles.userId,
        displayName: profiles.displayName,
        bio: profiles.bio,
        location: profiles.location,
        trustStatus: profiles.trustStatus,
        disclosure: profiles.disclosure,
      },
    })
    .from(inquiries)
    .innerJoin(properties, eq(inquiries.propertyId, properties.id))
    .leftJoin(profiles, eq(inquiries.seekerId, profiles.userId))
    .where(eq(inquiries.landlordId, user.id))
    .orderBy(desc(inquiries.updatedAt));
});

export const listMyViewingRequests = createServerFn({ method: "GET" }).handler(async () => {
  const user = await requireUser("SEEKER");
  return getDatabase()
    .select({
      viewing: viewingRequests,
      property: {
        id: properties.id,
        title: properties.title,
        city: properties.city,
        state: properties.state,
        address: properties.address,
      },
      counterpart: {
        userId: profiles.userId,
        displayName: profiles.displayName,
        bio: profiles.bio,
        location: profiles.location,
        trustStatus: profiles.trustStatus,
      },
    })
    .from(viewingRequests)
    .innerJoin(properties, eq(viewingRequests.propertyId, properties.id))
    .leftJoin(profiles, eq(viewingRequests.landlordId, profiles.userId))
    .where(eq(viewingRequests.seekerId, user.id))
    .orderBy(desc(viewingRequests.createdAt));
});

export const listReceivedViewingRequests = createServerFn({ method: "GET" }).handler(async () => {
  const user = await requireUser("LANDLORD");
  return getDatabase()
    .select({
      viewing: viewingRequests,
      property: {
        id: properties.id,
        title: properties.title,
        city: properties.city,
        state: properties.state,
        address: properties.address,
      },
      counterpart: {
        userId: profiles.userId,
        displayName: profiles.displayName,
        bio: profiles.bio,
        location: profiles.location,
        trustStatus: profiles.trustStatus,
        disclosure: profiles.disclosure,
      },
    })
    .from(viewingRequests)
    .innerJoin(properties, eq(viewingRequests.propertyId, properties.id))
    .leftJoin(profiles, eq(viewingRequests.seekerId, profiles.userId))
    .where(eq(viewingRequests.landlordId, user.id))
    .orderBy(desc(viewingRequests.createdAt));
});

export const getInquiryMessages = createServerFn({ method: "POST" })
  .validator((data) => inquiryIdInput.parse(data))
  .handler(async ({ data }) => {
    const user = await requireUser();
    const database = getDatabase();
    const inquiry = await getInquiry(database, data.inquiryId, user.id);
    if (!inquiry) throw new Error("Inquiry not found.");
    await database
      .update(messages)
      .set({ readAt: new Date() })
      .where(and(eq(messages.inquiryId, inquiry.id), ne(messages.senderId, user.id)));
    return database
      .select({
        id: messages.id,
        inquiryId: messages.inquiryId,
        senderId: messages.senderId,
        body: messages.body,
        createdAt: messages.createdAt,
        readAt: messages.readAt,
        senderProfile: {
          displayName: profiles.displayName,
        },
      })
      .from(messages)
      .leftJoin(profiles, eq(messages.senderId, profiles.userId))
      .where(eq(messages.inquiryId, inquiry.id))
      .orderBy(messages.createdAt);
  });

export const sendMessage = createServerFn({ method: "POST" })
  .validator((data) => messageInput.parse(data))
  .handler(async ({ data }) => {
    const user = await requireUser();
    const database = getDatabase();
    const inquiry = await getInquiry(database, data.inquiryId, user.id);
    if (!inquiry || inquiry.status === "CLOSED" || inquiry.status === "ARCHIVED")
      throw new Error("This conversation is unavailable.");
    const [blocked] = await database
      .select({ id: blocks.id })
      .from(blocks)
      .where(
        or(
          and(
            eq(blocks.blockerId, user.id),
            eq(
              blocks.blockedId,
              inquiry.seekerId === user.id ? inquiry.landlordId : inquiry.seekerId,
            ),
          ),
          and(
            eq(
              blocks.blockerId,
              inquiry.seekerId === user.id ? inquiry.landlordId : inquiry.seekerId,
            ),
            eq(blocks.blockedId, user.id),
          ),
        ),
      )
      .limit(1);
    if (blocked) throw new Error("Communication is unavailable between these accounts.");
    const [message] = await database
      .insert(messages)
      .values({ inquiryId: inquiry.id, senderId: user.id, body: data.body })
      .returning();
    await database
      .update(inquiries)
      .set({ status: "RESPONDED", updatedAt: new Date() })
      .where(eq(inquiries.id, inquiry.id));
    return message;
  });

export const updateInquiryStatus = createServerFn({ method: "POST" })
  .validator((data) => statusInput.parse(data))
  .handler(async ({ data }) => {
    const user = await requireUser("LANDLORD");
    const database = getDatabase();
    const [updated] = await database
      .update(inquiries)
      .set({ status: data.status, updatedAt: new Date() })
      .where(and(eq(inquiries.id, data.inquiryId), eq(inquiries.landlordId, user.id)))
      .returning();
    if (!updated) throw new Error("Inquiry not found.");
    return updated;
  });

export const updateViewingStatus = createServerFn({ method: "POST" })
  .validator((data) => viewingStatusInput.parse(data))
  .handler(async ({ data }) => {
    const user = await requireUser("LANDLORD");
    const database = getDatabase();
    const [updated] = await database
      .update(viewingRequests)
      .set({ status: data.status, updatedAt: new Date() })
      .where(and(eq(viewingRequests.id, data.viewingId), eq(viewingRequests.landlordId, user.id)))
      .returning();
    if (!updated) throw new Error("Viewing request not found.");
    return updated;
  });

export const cancelViewingRequest = createServerFn({ method: "POST" })
  .validator((data) => z.object({ viewingId: z.string().uuid() }).parse(data))
  .handler(async ({ data }) => {
    const user = await requireUser("SEEKER");
    const database = getDatabase();
    const [updated] = await database
      .update(viewingRequests)
      .set({ status: "CANCELLED", updatedAt: new Date() })
      .where(
        and(
          eq(viewingRequests.id, data.viewingId),
          eq(viewingRequests.seekerId, user.id),
          eq(viewingRequests.status, "REQUESTED"),
        ),
      )
      .returning();
    if (!updated) throw new Error("Viewing request cannot be cancelled.");
    return updated;
  });

export const createReport = createServerFn({ method: "POST" })
  .validator((data) => reportInput.parse(data))
  .handler(async ({ data }) => {
    const user = await requireUser();
    const database = getDatabase();
    if (data.targetType === "PROPERTY") {
      const [property] = await database
        .select({ id: properties.id })
        .from(properties)
        .where(and(eq(properties.id, data.targetId), eq(properties.status, "PUBLISHED")))
        .limit(1);
      if (!property) throw new Error("Property not found.");
    } else if (data.targetType === "INQUIRY") {
      const inquiry = await getInquiry(database, data.targetId, user.id);
      if (!inquiry) throw new Error("Inquiry not found.");
    } else {
      const [target] = await database
        .select({ id: profiles.userId })
        .from(profiles)
        .where(eq(profiles.userId, data.targetId))
        .limit(1);
      if (!target || target.id === user.id) throw new Error("User not found.");
      if (!(await hasConversationWithUser(database, user.id, target.id))) {
        throw new Error("You can only report users you have contacted through Property Mogul.");
      }
    }
    const [report] = await database
      .insert(reports)
      .values({ ...data, reporterId: user.id })
      .returning({ id: reports.id, status: reports.status });
    return report;
  });

export const blockUser = createServerFn({ method: "POST" })
  .validator((data) => userIdInput.parse(data))
  .handler(async ({ data }) => {
    const user = await requireUser();
    if (user.id === data.userId) throw new Error("You cannot block yourself.");
    const database = getDatabase();
    const [target] = await database
      .select({ id: profiles.userId })
      .from(profiles)
      .where(eq(profiles.userId, data.userId))
      .limit(1);
    if (!target || !(await hasConversationWithUser(database, user.id, target.id))) {
      throw new Error("You can only block users you have contacted through Property Mogul.");
    }
    await database
      .insert(blocks)
      .values({ blockerId: user.id, blockedId: data.userId })
      .onConflictDoNothing();
    return { success: true };
  });

export const listBlockedUsers = createServerFn({ method: "GET" }).handler(async () => {
  const user = await requireUser();
  return getDatabase()
    .select({
      block: blocks,
      profile: {
        userId: profiles.userId,
        displayName: profiles.displayName,
        location: profiles.location,
      },
    })
    .from(blocks)
    .leftJoin(profiles, eq(blocks.blockedId, profiles.userId))
    .where(eq(blocks.blockerId, user.id))
    .orderBy(desc(blocks.createdAt));
});

export const unblockUser = createServerFn({ method: "POST" })
  .validator((data) => userIdInput.parse(data))
  .handler(async ({ data }) => {
    const user = await requireUser();
    await getDatabase()
      .delete(blocks)
      .where(and(eq(blocks.blockerId, user.id), eq(blocks.blockedId, data.userId)));
    return { success: true };
  });
