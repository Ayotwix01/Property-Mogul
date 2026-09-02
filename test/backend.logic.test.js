import test from "node:test";
import assert from "node:assert/strict";
import {
  addUniqueFavorite,
  canPublishProperty,
  canModifyProperty,
  canTransitionPropertyStatus,
  canViewProperty,
  mapVerificationStatus,
  normalizeRoles,
  removeFavorite,
} from "../src/lib/backend.logic.js";
import {
  hasActiveContactAccess,
  hasValidPaystackSignature,
  hasValidPaystackTransaction,
  toPaystackKobo,
} from "../src/lib/payment.logic.js";

test("normalizes roles and supports both roles without duplicates", () => {
  assert.deepEqual(normalizeRoles(["seeker", "LANDLORD", "seeker"]), ["SEEKER", "LANDLORD"]);
});

test("only a landlord who owns a property can modify it", () => {
  const property = { ownerId: "owner-1" };
  assert.equal(canModifyProperty({ id: "owner-1", roles: ["LANDLORD"] }, property), true);
  assert.equal(canModifyProperty({ id: "owner-2", roles: ["LANDLORD"] }, property), false);
  assert.equal(canModifyProperty({ id: "owner-1", roles: ["SEEKER"] }, property), false);
});

test("only a verified landlord can publish", () => {
  assert.equal(
    canPublishProperty({ roles: ["LANDLORD"], profile: { trustStatus: "VERIFIED" } }),
    true,
  );
  assert.equal(
    canPublishProperty({ roles: ["LANDLORD"], profile: { trustStatus: "PENDING" } }),
    false,
  );
  assert.equal(
    canPublishProperty({ roles: ["SEEKER", "LANDLORD"], profile: { trustStatus: "VERIFIED" } }),
    true,
  );
  assert.equal(
    canPublishProperty({ roles: ["SEEKER"], profile: { trustStatus: "VERIFIED" } }),
    false,
  );
});

test("only published properties are public", () => {
  assert.equal(canViewProperty({ status: "PUBLISHED" }), true);
  assert.equal(canViewProperty({ status: "DRAFT" }), false);
  assert.equal(canViewProperty({ status: "ARCHIVED" }), false);
});

test("property status transitions stay within the listing lifecycle", () => {
  assert.equal(canTransitionPropertyStatus("DRAFT", "PUBLISHED"), true);
  assert.equal(canTransitionPropertyStatus("PUBLISHED", "UNPUBLISHED"), true);
  assert.equal(canTransitionPropertyStatus("ARCHIVED", "PUBLISHED"), false);
});

test("favorites are unique and removable", () => {
  assert.deepEqual(addUniqueFavorite(["property-1"], "property-1"), ["property-1"]);
  assert.deepEqual(addUniqueFavorite(["property-1"], "property-2"), ["property-1", "property-2"]);
  assert.deepEqual(removeFavorite(["property-1", "property-2"], "property-1"), ["property-2"]);
});

test("provider statuses map to database verification statuses", () => {
  assert.equal(mapVerificationStatus("Approved"), "VERIFIED");
  assert.equal(mapVerificationStatus("Declined"), "REJECTED");
  assert.equal(mapVerificationStatus("Expired"), "EXPIRED");
  assert.equal(mapVerificationStatus("In Review"), "PENDING");
});

test("Paystack amounts are calculated server-side in kobo", () => {
  assert.equal(toPaystackKobo(1000), 100000);
  assert.throws(() => toPaystackKobo(0));
  assert.throws(() => toPaystackKobo(10.5));
});

test("Paystack transaction validation rejects tampered payment details", () => {
  const payment = { providerReference: "pm_1", amount: "1000", currency: "NGN" };
  const transaction = { status: "success", reference: "pm_1", amount: 100000, currency: "NGN" };
  assert.equal(hasValidPaystackTransaction(transaction, payment), true);
  assert.equal(hasValidPaystackTransaction({ ...transaction, amount: 1 }, payment), false);
  assert.equal(hasValidPaystackTransaction({ ...transaction, currency: "USD" }, payment), false);
  assert.equal(hasValidPaystackTransaction({ ...transaction, reference: "pm_2" }, payment), false);
  assert.equal(hasValidPaystackTransaction({ ...transaction, status: "failed" }, payment), false);
});

test("Paystack webhook signatures accept only the exact raw payload", async () => {
  const body = JSON.stringify({ event: "charge.success", data: { reference: "pm_1" } });
  const secret = "test-secret";
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-512" },
    false,
    ["sign"],
  );
  const digest = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(body));
  const signature = Array.from(new Uint8Array(digest), (byte) =>
    byte.toString(16).padStart(2, "0"),
  ).join("");
  assert.equal(await hasValidPaystackSignature(body, signature, secret), true);
  assert.equal(await hasValidPaystackSignature(`${body} `, signature, secret), false);
  assert.equal(await hasValidPaystackSignature(body, "invalid", secret), false);
});

test("contact access is inactive when revoked or expired", () => {
  const now = new Date("2026-08-30T00:00:00Z");
  assert.equal(hasActiveContactAccess({}, now), true);
  assert.equal(hasActiveContactAccess({ revokedAt: now }, now), false);
  assert.equal(hasActiveContactAccess({ expiresAt: "2026-08-29T00:00:00Z" }, now), false);
  assert.equal(hasActiveContactAccess({ expiresAt: "2026-08-31T00:00:00Z" }, now), true);
});
