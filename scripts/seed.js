import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { getDatabase } from "../src/db/index.js";
import {
  favorites,
  inquiries,
  messages,
  profiles,
  properties,
  propertyImages,
  userRoles,
  users,
  viewingRequests,
} from "../src/db/schema.js";

const seedEmails = {
  seeker: "qa.seeker@propertymogul.test",
  landlord: "qa.landlord@propertymogul.test",
  both: "qa.both@propertymogul.test",
  admin: "qa.admin@propertymogul.test",
};

const environment = globalThis.process?.env || {};

if (environment.NODE_ENV === "production") {
  throw new Error("The development seed cannot run with NODE_ENV=production.");
}
if (!environment.DATABASE_URL) throw new Error("DATABASE_URL is required to seed the database.");
if (!environment.SEED_PASSWORD || environment.SEED_PASSWORD.length < 8) {
  throw new Error("SEED_PASSWORD is required and must be at least 8 characters.");
}

const database = getDatabase();
const passwordHash = await bcrypt.hash(environment.SEED_PASSWORD, 12);

async function ensureUser(email, displayName, roles, trustStatus = "NOT_STARTED") {
  let [user] = await database.select().from(users).where(eq(users.email, email)).limit(1);
  if (!user) {
    [user] = await database
      .insert(users)
      .values({
        email,
        passwordHash,
        termsAcceptedAt: new Date(),
        termsVersion: "2026-08-30",
      })
      .returning();
  } else {
    [user] = await database
      .update(users)
      .set({ passwordHash, status: "ACTIVE", updatedAt: new Date() })
      .where(eq(users.id, user.id))
      .returning();
  }

  await database.delete(userRoles).where(eq(userRoles.userId, user.id));
  await database.insert(userRoles).values(roles.map((role) => ({ userId: user.id, role })));
  const [profile] = await database
    .select({ id: profiles.id })
    .from(profiles)
    .where(eq(profiles.userId, user.id))
    .limit(1);
  if (profile) {
    await database
      .update(profiles)
      .set({ displayName, trustStatus, phone: "+2348000000000", location: "Lagos, Nigeria" })
      .where(eq(profiles.userId, user.id));
  } else {
    await database.insert(profiles).values({
      userId: user.id,
      displayName,
      trustStatus,
      phone: "+2348000000000",
      location: "Lagos, Nigeria",
    });
  }
  return user;
}

const seeker = await ensureUser(seedEmails.seeker, "QA Seeker", ["SEEKER"]);
const landlord = await ensureUser(
  seedEmails.landlord,
  "QA Verified Landlord",
  ["LANDLORD"],
  "VERIFIED",
);
await ensureUser(seedEmails.both, "QA Both Role", ["SEEKER", "LANDLORD"], "VERIFIED");
await ensureUser(seedEmails.admin, "QA Admin", ["ADMIN"]);

await database.delete(properties).where(eq(properties.ownerId, landlord.id));

const listingData = [
  {
    title: "QA Lekki Phase 1 Terrace",
    propertyType: "Terrace",
    listingType: "RENT",
    price: "8500000",
    rentPeriod: "YEARLY",
    bedrooms: 3,
    bathrooms: 3,
    toilets: 4,
    neighborhood: "Lekki Phase 1",
    city: "Lekki",
    state: "Lagos",
    address: "QA Street, Lekki Phase 1, Lagos",
    status: "PUBLISHED",
    description:
      "Synthetic QA listing for testing search, favorites, inquiries, and viewing requests.",
    imageUrl:
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
  },
  {
    title: "QA Ikeja Garden Apartment",
    propertyType: "Apartment",
    listingType: "RENT",
    price: "4200000",
    rentPeriod: "YEARLY",
    bedrooms: 2,
    bathrooms: 2,
    toilets: 3,
    neighborhood: "GRA Ikeja",
    city: "Ikeja",
    state: "Lagos",
    address: "QA Avenue, GRA Ikeja, Lagos",
    status: "PUBLISHED",
    description: "Synthetic two-bedroom apartment for filter and sorting verification.",
    imageUrl:
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80",
  },
  {
    title: "QA Wuse District Flat",
    propertyType: "Flat",
    listingType: "SALE",
    price: "68000000",
    bedrooms: 3,
    bathrooms: 3,
    toilets: 4,
    neighborhood: "Wuse 2",
    city: "Abuja",
    state: "FCT",
    address: "QA Crescent, Wuse 2, Abuja",
    status: "PUBLISHED",
    description: "Synthetic Abuja sale listing for location and category testing.",
    imageUrl:
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80",
  },
  {
    title: "QA Maitama Development Draft",
    propertyType: "Detached House",
    listingType: "SALE",
    price: "125000000",
    bedrooms: 4,
    bathrooms: 4,
    toilets: 5,
    neighborhood: "Maitama",
    city: "Abuja",
    state: "FCT",
    address: "QA Close, Maitama, Abuja",
    status: "DRAFT",
    description: "Synthetic draft listing that must remain hidden from public browse results.",
    imageUrl:
      "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=1200&q=80",
  },
];

const inserted = [];
for (const listing of listingData) {
  const { imageUrl, ...propertyData } = listing;
  const [property] = await database
    .insert(properties)
    .values({
      ...propertyData,
      ownerId: landlord.id,
      publishedAt: listing.status === "PUBLISHED" ? new Date() : null,
    })
    .returning();
  await database.insert(propertyImages).values({ propertyId: property.id, imageUrl });
  inserted.push(property);
}

const featured = inserted[0];
const [inquiry] = await database
  .insert(inquiries)
  .values({
    propertyId: featured.id,
    seekerId: seeker.id,
    landlordId: landlord.id,
    message: "QA inquiry: I would like to confirm the viewing availability for this listing.",
  })
  .returning();
await database
  .insert(messages)
  .values({ inquiryId: inquiry.id, senderId: seeker.id, body: inquiry.message });
await database.insert(viewingRequests).values({
  inquiryId: inquiry.id,
  propertyId: featured.id,
  seekerId: seeker.id,
  landlordId: landlord.id,
  requestedDate: new Date(Date.now() + 86400000 * 3),
  status: "REQUESTED",
});
await database
  .insert(favorites)
  .values({ userId: seeker.id, propertyId: featured.id })
  .onConflictDoNothing();

console.log(
  JSON.stringify(
    {
      accounts: seedEmails,
      propertyCount: inserted.length,
      inquiryId: inquiry.id,
      note: "TEST ONLY seed data. Remove it before production use.",
    },
    null,
    2,
  ),
);
