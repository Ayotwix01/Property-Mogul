import { createServerFn } from "@tanstack/react-start";
import { aliasedTable, and, count, desc, eq, inArray } from "drizzle-orm";
import { z } from "zod";
import { getDatabase } from "@/db";
import {
  auditLogs,
  payments,
  profiles,
  properties,
  reports,
  userRoles,
  users,
  verificationRequests,
} from "@/db/schema";
import { requireUser } from "@/lib/auth.functions";
import { canPublishProperty } from "@/lib/backend.logic";
import {
  ADMIN_PROPERTY_STATUSES,
  ADMIN_USER_STATUSES,
  assertAdminUser,
  canChangeAdminUserStatus,
  canModeratePropertyStatus,
} from "@/lib/admin.logic";

async function requireAdmin() {
  return assertAdminUser(await requireUser("ADMIN"));
}

const pageInput = z.object({
  page: z.number().int().positive().default(1),
  pageSize: z.number().int().positive().max(50).default(20),
});

const queueInput = pageInput.extend({
  verificationStatus: z
    .enum(["NOT_STARTED", "PENDING", "VERIFIED", "REJECTED", "EXPIRED"])
    .default("PENDING"),
  reportStatus: z.enum(["OPEN", "REVIEWING", "RESOLVED", "DISMISSED"]).default("OPEN"),
  propertyStatus: z.enum(["DRAFT", "PUBLISHED", "UNPUBLISHED", "ARCHIVED"]).optional(),
  userStatus: z.enum(["ACTIVE", "SUSPENDED", "DELETED"]).optional(),
  userRole: z.enum(["SEEKER", "LANDLORD", "ADMIN"]).optional(),
});

function pageBounds({ page, pageSize }) {
  return { limit: pageSize, offset: (page - 1) * pageSize };
}

async function loadUsers(database, input) {
  let userIds;
  if (input.userRole) {
    const roleRows = await database
      .select({ userId: userRoles.userId })
      .from(userRoles)
      .where(eq(userRoles.role, input.userRole));
    userIds = roleRows.map(({ userId }) => userId);
    if (!userIds.length) return [];
  }
  const where = and(
    input.userStatus ? eq(users.status, input.userStatus) : undefined,
    userIds ? inArray(users.id, userIds) : undefined,
  );
  const { limit, offset } = pageBounds(input);
  const rows = await database
    .select({ user: users, profile: profiles })
    .from(users)
    .leftJoin(profiles, eq(profiles.userId, users.id))
    .where(where)
    .orderBy(desc(users.createdAt))
    .limit(limit)
    .offset(offset);
  const roles = await database.select().from(userRoles);
  return rows.map(({ user, profile }) => ({
    id: user.id,
    email: user.email,
    status: user.status,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    profile: profile
      ? {
          displayName: profile.displayName,
          location: profile.location,
          trustStatus: profile.trustStatus,
        }
      : null,
    roles: roles.filter((role) => role.userId === user.id).map((role) => role.role),
  }));
}

async function loadProperties(database, input) {
  const { limit, offset } = pageBounds(input);
  const rows = await database
    .select({ property: properties, owner: users, profile: profiles })
    .from(properties)
    .innerJoin(users, eq(users.id, properties.ownerId))
    .leftJoin(profiles, eq(profiles.userId, properties.ownerId))
    .where(input.propertyStatus ? eq(properties.status, input.propertyStatus) : undefined)
    .orderBy(desc(properties.updatedAt))
    .limit(limit)
    .offset(offset);
  return rows.map(({ property, owner, profile }) => ({
    ...property,
    owner: {
      id: owner.id,
      email: owner.email,
      status: owner.status,
      displayName: profile?.displayName || "Property owner",
      trustStatus: profile?.trustStatus || "NOT_STARTED",
    },
  }));
}

async function loadReports(database, input) {
  const { limit, offset } = pageBounds(input);
  const rows = await database
    .select({ report: reports, reporter: users, profile: profiles })
    .from(reports)
    .innerJoin(users, eq(users.id, reports.reporterId))
    .leftJoin(profiles, eq(profiles.userId, reports.reporterId))
    .where(eq(reports.status, input.reportStatus))
    .orderBy(desc(reports.createdAt))
    .limit(limit)
    .offset(offset);
  const propertyIds = rows
    .filter(({ report }) => report.targetType === "PROPERTY")
    .map(({ report }) => report.targetId);
  const userIds = rows
    .filter(({ report }) => report.targetType === "USER")
    .map(({ report }) => report.targetId);
  const propertyRows = propertyIds.length
    ? await database.select().from(properties).where(inArray(properties.id, propertyIds))
    : [];
  const userRows = userIds.length
    ? await database
        .select({ user: users, profile: profiles })
        .from(users)
        .leftJoin(profiles, eq(profiles.userId, users.id))
        .where(inArray(users.id, userIds))
    : [];
  return rows.map(({ report, reporter, profile }) => {
    const target =
      report.targetType === "PROPERTY"
        ? propertyRows.find((property) => property.id === report.targetId)
        : userRows.find(({ user }) => user.id === report.targetId);
    return {
      ...report,
      reporter: {
        id: reporter.id,
        email: reporter.email,
        displayName: profile?.displayName || "User",
      },
      target: target
        ? "user" in target
          ? {
              id: target.user.id,
              type: "USER",
              label: target.profile?.displayName || target.user.email,
              status: target.user.status,
            }
          : { id: target.id, type: "PROPERTY", label: target.title, status: target.status }
        : null,
    };
  });
}

async function loadVerifications(database, input) {
  const { limit, offset } = pageBounds(input);
  const rows = await database
    .select({ request: verificationRequests, user: users, profile: profiles })
    .from(verificationRequests)
    .innerJoin(users, eq(users.id, verificationRequests.userId))
    .leftJoin(profiles, eq(profiles.userId, verificationRequests.userId))
    .where(eq(verificationRequests.status, input.verificationStatus))
    .orderBy(desc(verificationRequests.createdAt))
    .limit(limit)
    .offset(offset);
  return rows.map(({ request, user, profile }) => ({
    ...request,
    user: {
      id: user.id,
      email: user.email,
      displayName: profile?.displayName || "User",
      trustStatus: profile?.trustStatus || "NOT_STARTED",
    },
  }));
}

async function loadPayments(database, input) {
  const { limit, offset } = pageBounds(input);
  const seeker = aliasedTable(users, "payment_seeker");
  const rows = await database
    .select({ payment: payments, property: properties, seeker })
    .from(payments)
    .innerJoin(properties, eq(properties.id, payments.propertyId))
    .innerJoin(seeker, eq(seeker.id, payments.seekerId))
    .orderBy(desc(payments.createdAt))
    .limit(limit)
    .offset(offset);
  return rows.map(({ payment, property, seeker }) => ({
    ...payment,
    property: { id: property.id, title: property.title },
    seeker: { id: seeker.id, email: seeker.email },
  }));
}

export const getAdminQueues = createServerFn({ method: "GET" })
  .validator((data) => queueInput.parse(data || {}))
  .handler(async ({ data }) => {
    await requireAdmin();
    const database = getDatabase();
    const [verifications, openReports, userStats, roleStats, listingStats, verifiedStats, audit] =
      await Promise.all([
        loadVerifications(database, data),
        loadReports(database, data),
        database.select({ total: count() }).from(users),
        database
          .select({ role: userRoles.role, total: count() })
          .from(userRoles)
          .groupBy(userRoles.role),
        database
          .select({ total: count() })
          .from(properties)
          .where(eq(properties.status, "PUBLISHED")),
        database
          .select({ total: count() })
          .from(profiles)
          .where(eq(profiles.trustStatus, "VERIFIED")),
        database.select().from(auditLogs).orderBy(desc(auditLogs.createdAt)).limit(20),
      ]);
    return {
      verifications,
      reports: openReports,
      stats: {
        users: Number(userStats[0]?.total || 0),
        roles: roleStats,
        publishedListings: Number(listingStats[0]?.total || 0),
        verifiedProfiles: Number(verifiedStats[0]?.total || 0),
      },
      audit,
    };
  });

export const getAdminUsers = createServerFn({ method: "POST" })
  .validator((data) => queueInput.parse(data || {}))
  .handler(async ({ data }) => {
    await requireAdmin();
    return loadUsers(getDatabase(), data);
  });

export const getAdminProperties = createServerFn({ method: "POST" })
  .validator((data) => queueInput.parse(data || {}))
  .handler(async ({ data }) => {
    await requireAdmin();
    return loadProperties(getDatabase(), data);
  });

export const getAdminPayments = createServerFn({ method: "POST" })
  .validator((data) => pageInput.parse(data || {}))
  .handler(async ({ data }) => {
    await requireAdmin();
    return loadPayments(getDatabase(), data);
  });

const auditInput = z.object({
  action: z.string().min(1).max(80),
  targetType: z.string().min(1).max(40),
  targetId: z.string().uuid(),
  reason: z.string().max(2000).optional(),
});
export const recordAdminAction = createServerFn({ method: "POST" })
  .validator((data) => auditInput.parse(data))
  .handler(async ({ data }) => {
    const admin = await requireAdmin();
    const [entry] = await getDatabase()
      .insert(auditLogs)
      .values({ ...data, adminId: admin.id })
      .returning({ id: auditLogs.id });
    return entry;
  });

const verificationDecision = z.object({
  requestId: z.string().uuid(),
  status: z.enum(["VERIFIED", "REJECTED"]),
  reason: z.string().max(2000).optional(),
});
export const decideVerification = createServerFn({ method: "POST" })
  .validator((data) => verificationDecision.parse(data))
  .handler(async ({ data }) => {
    const admin = await requireAdmin();
    const database = getDatabase();
    const [current] = await database
      .select({ id: verificationRequests.id, status: verificationRequests.status })
      .from(verificationRequests)
      .where(eq(verificationRequests.id, data.requestId))
      .limit(1);
    if (!current) throw new Error("Verification request not found.");
    if (current.status !== "PENDING")
      throw new Error("Only pending verification requests can be decided.");
    const [request] = await database
      .update(verificationRequests)
      .set({ status: data.status, reviewedAt: new Date(), updatedAt: new Date() })
      .where(eq(verificationRequests.id, data.requestId))
      .returning({ id: verificationRequests.id, userId: verificationRequests.userId });
    await database
      .update(profiles)
      .set({ trustStatus: data.status, updatedAt: new Date() })
      .where(eq(profiles.userId, request.userId));
    await database.insert(auditLogs).values({
      adminId: admin.id,
      action: "VERIFICATION_" + data.status,
      targetType: "VERIFICATION_REQUEST",
      targetId: request.id,
      reason: data.reason,
    });
    return { success: true };
  });

const reportDecision = z.object({
  reportId: z.string().uuid(),
  status: z.enum(["REVIEWING", "RESOLVED", "DISMISSED"]),
  reason: z.string().max(2000).optional(),
});
export const decideReport = createServerFn({ method: "POST" })
  .validator((data) => reportDecision.parse(data))
  .handler(async ({ data }) => {
    const admin = await requireAdmin();
    const database = getDatabase();
    const [report] = await database
      .update(reports)
      .set({ status: data.status })
      .where(eq(reports.id, data.reportId))
      .returning({ id: reports.id });
    if (!report) throw new Error("Report not found.");
    await database.insert(auditLogs).values({
      adminId: admin.id,
      action: "REPORT_" + data.status,
      targetType: "REPORT",
      targetId: report.id,
      reason: data.reason,
    });
    return { success: true };
  });

const propertyDecision = z.object({
  propertyId: z.string().uuid(),
  status: z.enum(ADMIN_PROPERTY_STATUSES),
  reason: z.string().max(2000).optional(),
});
export const decidePropertyStatus = createServerFn({ method: "POST" })
  .validator((data) => propertyDecision.parse(data))
  .handler(async ({ data }) => {
    const admin = await requireAdmin();
    const database = getDatabase();
    const [current] = await database
      .select({ property: properties, owner: users, profile: profiles })
      .from(properties)
      .innerJoin(users, eq(users.id, properties.ownerId))
      .leftJoin(profiles, eq(profiles.userId, properties.ownerId))
      .where(eq(properties.id, data.propertyId))
      .limit(1);
    if (!current) throw new Error("Property not found.");
    if (
      !canModeratePropertyStatus(current.property.status, data.status, {
        roles: ["ADMIN"],
        profile: current.profile,
      })
    )
      throw new Error(
        `Cannot change a ${current.property.status.toLowerCase()} property to ${data.status.toLowerCase()}.`,
      );
    if (
      data.status === "PUBLISHED" &&
      !canPublishProperty({ roles: ["LANDLORD"], profile: current.profile })
    )
      throw new Error("The owner must be verified before this property can be published.");
    const [property] = await database
      .update(properties)
      .set({
        status: data.status,
        publishedAt: data.status === "PUBLISHED" ? new Date() : null,
        updatedAt: new Date(),
      })
      .where(eq(properties.id, data.propertyId))
      .returning({ id: properties.id });
    await database.insert(auditLogs).values({
      adminId: admin.id,
      action: "PROPERTY_" + data.status,
      targetType: "PROPERTY",
      targetId: property.id,
      reason: data.reason,
    });
    return { success: true };
  });

const userDecision = z.object({
  userId: z.string().uuid(),
  status: z.enum(ADMIN_USER_STATUSES),
  reason: z.string().max(2000).optional(),
});
export const decideUserStatus = createServerFn({ method: "POST" })
  .validator((data) => userDecision.parse(data))
  .handler(async ({ data }) => {
    const admin = await requireAdmin();
    if (!canChangeAdminUserStatus(admin.id, data.userId, data.status))
      throw new Error("You cannot suspend or delete your own admin account.");
    const database = getDatabase();
    const [user] = await database
      .update(users)
      .set({ status: data.status, updatedAt: new Date() })
      .where(eq(users.id, data.userId))
      .returning({ id: users.id });
    if (!user) throw new Error("User not found.");
    await database.insert(auditLogs).values({
      adminId: admin.id,
      action: "USER_" + data.status,
      targetType: "USER",
      targetId: user.id,
      reason: data.reason,
    });
    return { success: true };
  });
