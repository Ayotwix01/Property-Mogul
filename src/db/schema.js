import {
  index,
  integer,
  jsonb,
  numeric,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

export const userStatus = pgEnum("user_status", ["ACTIVE", "SUSPENDED", "DELETED"]);
export const userRole = pgEnum("user_role", ["SEEKER", "LANDLORD", "ADMIN"]);
export const listingType = pgEnum("listing_type", ["RENT", "SALE"]);
export const propertyStatus = pgEnum("property_status", [
  "DRAFT",
  "PUBLISHED",
  "UNPUBLISHED",
  "ARCHIVED",
]);
export const verificationStatus = pgEnum("verification_status", [
  "NOT_STARTED",
  "PENDING",
  "VERIFIED",
  "REJECTED",
  "EXPIRED",
]);
export const verificationType = pgEnum("verification_type", [
  "IDENTITY",
  "PROPERTY",
  "AUTHORITY_TO_RENT",
]);
export const inquiryStatus = pgEnum("inquiry_status", ["NEW", "RESPONDED", "CLOSED", "ARCHIVED"]);
export const viewingStatus = pgEnum("viewing_status", [
  "REQUESTED",
  "ACCEPTED",
  "DECLINED",
  "CANCELLED",
  "COMPLETED",
]);
export const reportCategory = pgEnum("report_category", [
  "SCAM",
  "FRAUD",
  "HARASSMENT",
  "INAPPROPRIATE_CONTENT",
  "FAKE_LISTING",
  "OTHER",
]);
export const reportStatus = pgEnum("report_status", ["OPEN", "REVIEWING", "RESOLVED", "DISMISSED"]);
export const paymentStatus = pgEnum("payment_status", [
  "PENDING",
  "SUCCESS",
  "FAILED",
  "CANCELLED",
  "REFUNDED",
]);
export const paymentPurpose = pgEnum("payment_purpose", ["LANDLORD_CONTACT_ACCESS"]);

export const users = pgTable(
  "users",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    email: varchar("email", { length: 320 }).notNull(),
    passwordHash: text("password_hash"),
    status: userStatus("status").default("ACTIVE").notNull(),
    termsAcceptedAt: timestamp("terms_accepted_at", { withTimezone: true }),
    termsVersion: varchar("terms_version", { length: 40 }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [uniqueIndex("users_email_unique").on(table.email)],
);

export const userRoles = pgTable(
  "user_roles",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    role: userRole("role").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [uniqueIndex("user_roles_user_role_unique").on(table.userId, table.role)],
);

export const profiles = pgTable(
  "profiles",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    displayName: varchar("display_name", { length: 160 }),
    phone: varchar("phone", { length: 40 }),
    contactPreferences: jsonb("contact_preferences"),
    profileImageUrl: text("profile_image_url"),
    bio: text("bio"),
    location: varchar("location", { length: 160 }),
    disclosure: jsonb("disclosure"),
    trustStatus: verificationStatus("trust_status").default("NOT_STARTED").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [uniqueIndex("profiles_user_unique").on(table.userId)],
);

export const properties = pgTable(
  "properties",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    ownerId: uuid("owner_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    title: varchar("title", { length: 240 }).notNull(),
    description: text("description"),
    propertyType: varchar("property_type", { length: 80 }).notNull(),
    listingType: listingType("listing_type").notNull(),
    price: numeric("price", { precision: 14, scale: 2 }).notNull(),
    currency: varchar("currency", { length: 3 }).default("NGN").notNull(),
    rentPeriod: varchar("rent_period", { length: 40 }),
    bedrooms: integer("bedrooms"),
    bathrooms: integer("bathrooms"),
    toilets: integer("toilets"),
    squareFeet: integer("square_feet"),
    address: text("address"),
    neighborhood: varchar("neighborhood", { length: 120 }),
    city: varchar("city", { length: 100 }).notNull(),
    state: varchar("state", { length: 100 }).notNull(),
    latitude: numeric("latitude", { precision: 10, scale: 7 }),
    longitude: numeric("longitude", { precision: 10, scale: 7 }),
    amenities: jsonb("amenities").default([]).notNull(),
    status: propertyStatus("status").default("DRAFT").notNull(),
    verificationStatus: verificationStatus("verification_status").default("NOT_STARTED").notNull(),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("properties_published_search_idx").on(
      table.status,
      table.city,
      table.listingType,
      table.price,
    ),
    index("properties_owner_idx").on(table.ownerId),
  ],
);

export const propertyImages = pgTable(
  "property_images",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    propertyId: uuid("property_id")
      .notNull()
      .references(() => properties.id, { onDelete: "cascade" }),
    imageUrl: text("image_url").notNull(),
    storageKey: text("storage_key"),
    sortOrder: integer("sort_order").default(0).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [index("property_images_property_idx").on(table.propertyId, table.sortOrder)],
);

export const favorites = pgTable(
  "favorites",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    propertyId: uuid("property_id")
      .notNull()
      .references(() => properties.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("favorites_user_property_unique").on(table.userId, table.propertyId),
    index("favorites_user_idx").on(table.userId),
  ],
);

export const sessions = pgTable(
  "sessions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    tokenHash: text("token_hash").notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    revokedAt: timestamp("revoked_at", { withTimezone: true }),
  },
  (table) => [
    uniqueIndex("sessions_token_hash_unique").on(table.tokenHash),
    index("sessions_user_idx").on(table.userId),
  ],
);

export const oauthAccounts = pgTable(
  "oauth_accounts",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    provider: varchar("provider", { length: 40 }).notNull(),
    providerAccountId: varchar("provider_account_id", { length: 240 }).notNull(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("oauth_accounts_provider_account_unique").on(
      table.provider,
      table.providerAccountId,
    ),
    index("oauth_accounts_user_idx").on(table.userId),
  ],
);

export const oauthStates = pgTable(
  "oauth_states",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    provider: varchar("provider", { length: 40 }).notNull(),
    stateHash: varchar("state_hash", { length: 64 }).notNull(),
    providerAccountId: varchar("provider_account_id", { length: 240 }),
    email: varchar("email", { length: 320 }),
    displayName: varchar("display_name", { length: 160 }),
    profileImageUrl: text("profile_image_url"),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    usedAt: timestamp("used_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("oauth_states_hash_unique").on(table.stateHash),
    index("oauth_states_expiry_idx").on(table.expiresAt),
  ],
);

export const verificationRequests = pgTable(
  "verification_requests",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    propertyId: uuid("property_id").references(() => properties.id, { onDelete: "set null" }),
    type: verificationType("type").notNull(),
    provider: varchar("provider", { length: 80 }),
    providerReference: varchar("provider_reference", { length: 240 }),
    status: verificationStatus("status").default("NOT_STARTED").notNull(),
    submittedAt: timestamp("submitted_at", { withTimezone: true }),
    reviewedAt: timestamp("reviewed_at", { withTimezone: true }),
    expiresAt: timestamp("expires_at", { withTimezone: true }),
    metadata: jsonb("metadata"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("verification_requests_user_idx").on(table.userId, table.status),
    index("verification_requests_provider_idx").on(table.provider, table.providerReference),
  ],
);

export const inquiries = pgTable(
  "inquiries",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    propertyId: uuid("property_id")
      .notNull()
      .references(() => properties.id, { onDelete: "cascade" }),
    seekerId: uuid("seeker_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    landlordId: uuid("landlord_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    message: text("message").notNull(),
    status: inquiryStatus("status").default("NEW").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("inquiries_seeker_idx").on(table.seekerId),
    index("inquiries_landlord_idx").on(table.landlordId),
  ],
);

export const messages = pgTable(
  "messages",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    inquiryId: uuid("inquiry_id")
      .notNull()
      .references(() => inquiries.id, { onDelete: "cascade" }),
    senderId: uuid("sender_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    body: text("body").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    readAt: timestamp("read_at", { withTimezone: true }),
  },
  (table) => [index("messages_inquiry_idx").on(table.inquiryId, table.createdAt)],
);

export const viewingRequests = pgTable(
  "viewing_requests",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    inquiryId: uuid("inquiry_id")
      .notNull()
      .references(() => inquiries.id, { onDelete: "cascade" }),
    propertyId: uuid("property_id")
      .notNull()
      .references(() => properties.id, { onDelete: "cascade" }),
    seekerId: uuid("seeker_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    landlordId: uuid("landlord_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    requestedDate: timestamp("requested_date", { withTimezone: true }).notNull(),
    message: text("message"),
    status: viewingStatus("status").default("REQUESTED").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("viewing_requests_seeker_idx").on(table.seekerId),
    index("viewing_requests_landlord_idx").on(table.landlordId),
  ],
);

export const reports = pgTable(
  "reports",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    reporterId: uuid("reporter_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    targetType: varchar("target_type", { length: 40 }).notNull(),
    targetId: uuid("target_id").notNull(),
    category: reportCategory("category").notNull(),
    description: text("description"),
    status: reportStatus("status").default("OPEN").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [index("reports_reporter_idx").on(table.reporterId)],
);

export const blocks = pgTable(
  "blocks",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    blockerId: uuid("blocker_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    blockedId: uuid("blocked_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [uniqueIndex("blocks_blocker_blocked_unique").on(table.blockerId, table.blockedId)],
);

export const payments = pgTable(
  "payments",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    seekerId: uuid("seeker_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    propertyId: uuid("property_id")
      .notNull()
      .references(() => properties.id, { onDelete: "cascade" }),
    landlordId: uuid("landlord_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    amount: numeric("amount", { precision: 14, scale: 2 }).notNull(),
    currency: varchar("currency", { length: 3 }).notNull(),
    provider: varchar("provider", { length: 80 }).notNull(),
    providerReference: varchar("provider_reference", { length: 240 }),
    status: paymentStatus("status").default("PENDING").notNull(),
    purpose: paymentPurpose("purpose").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
    paidAt: timestamp("paid_at", { withTimezone: true }),
  },
  (table) => [
    uniqueIndex("payments_provider_reference_unique").on(table.provider, table.providerReference),
    index("payments_seeker_idx").on(table.seekerId, table.createdAt),
  ],
);

export const contactAccess = pgTable(
  "contact_access",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    seekerId: uuid("seeker_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    propertyId: uuid("property_id")
      .notNull()
      .references(() => properties.id, { onDelete: "cascade" }),
    landlordId: uuid("landlord_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    paymentId: uuid("payment_id")
      .notNull()
      .references(() => payments.id, { onDelete: "cascade" }),
    grantedAt: timestamp("granted_at", { withTimezone: true }).defaultNow().notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }),
    revokedAt: timestamp("revoked_at", { withTimezone: true }),
  },
  (table) => [
    uniqueIndex("contact_access_seeker_property_unique").on(table.seekerId, table.propertyId),
  ],
);

export const auditLogs = pgTable(
  "audit_logs",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    adminId: uuid("admin_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    action: varchar("action", { length: 80 }).notNull(),
    targetType: varchar("target_type", { length: 40 }).notNull(),
    targetId: uuid("target_id").notNull(),
    reason: text("reason"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [index("audit_logs_target_idx").on(table.targetType, table.targetId)],
);
