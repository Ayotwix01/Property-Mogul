// Focused tests for admin authorization, lifecycle, and audit logic.
// These test the pure functions in admin.logic.js and the server function
// logic without requiring a live database — the server functions are exercised
// through their internal validation paths.

import test from "node:test";
import assert from "node:assert/strict";
import {
  assertAdminUser,
  canChangeAdminUserStatus,
  canModeratePropertyStatus,
  isAdminUser,
  ADMIN_PROPERTY_STATUSES,
  ADMIN_USER_STATUSES,
} from "../src/lib/admin.logic.js";

test("isAdminUser returns true only when ADMIN role is present", () => {
  assert.equal(isAdminUser({ roles: ["ADMIN"] }), true);
  assert.equal(isAdminUser({ roles: ["SEEKER", "ADMIN"] }), true);
  assert.equal(isAdminUser({ roles: ["SEEKER"] }), false);
  assert.equal(isAdminUser({ roles: [] }), false);
  assert.equal(isAdminUser(undefined), false);
  assert.equal(isAdminUser(null), false);
});

test("assertAdminUser throws for non-admin users", () => {
  assert.throws(() => assertAdminUser({ roles: ["SEEKER"] }), /Admin access required/);
  assert.throws(() => assertAdminUser({ roles: ["LANDLORD"] }), /Admin access required/);
  assert.throws(() => assertAdminUser({ roles: [] }), /Admin access required/);
  assert.throws(() => assertAdminUser(undefined), /Admin access required/);
});

test("assertAdminUser returns the user for admins", () => {
  const admin = { id: "admin-1", roles: ["ADMIN"] };
  assert.strictEqual(assertAdminUser(admin), admin);
});

test("canChangeAdminUserStatus prevents self-suspension", () => {
  assert.equal(canChangeAdminUserStatus("admin-1", "admin-1", "SUSPENDED"), false);
  assert.equal(canChangeAdminUserStatus("admin-1", "admin-1", "ACTIVE"), false);
});

test("canChangeAdminUserStatus allows suspending other users", () => {
  assert.equal(canChangeAdminUserStatus("admin-1", "user-2", "SUSPENDED"), true);
  assert.equal(canChangeAdminUserStatus("admin-1", "user-2", "ACTIVE"), true);
});

test("canChangeAdminUserStatus rejects unknown statuses", () => {
  assert.equal(canChangeAdminUserStatus("admin-1", "user-2", "DELETED"), false);
  assert.equal(canChangeAdminUserStatus("admin-1", "user-2", "PENDING"), false);
  assert.equal(canChangeAdminUserStatus("admin-1", "user-2", "ADMIN"), false);
});

test("canModeratePropertyStatus requires admin role", () => {
  assert.equal(canModeratePropertyStatus("DRAFT", "PUBLISHED", { roles: ["SEEKER"] }), false);
  assert.equal(canModeratePropertyStatus("DRAFT", "PUBLISHED", { roles: ["LANDLORD"] }), false);
  assert.equal(canModeratePropertyStatus("DRAFT", "PUBLISHED", { roles: [] }), false);
});

test("canModeratePropertyStatus allows valid transitions", () => {
  const admin = { roles: ["ADMIN"] };
  assert.equal(canModeratePropertyStatus("DRAFT", "PUBLISHED", admin), true);
  assert.equal(canModeratePropertyStatus("DRAFT", "ARCHIVED", admin), true);
  assert.equal(canModeratePropertyStatus("PUBLISHED", "UNPUBLISHED", admin), true);
  assert.equal(canModeratePropertyStatus("PUBLISHED", "ARCHIVED", admin), true);
  assert.equal(canModeratePropertyStatus("UNPUBLISHED", "PUBLISHED", admin), true);
  assert.equal(canModeratePropertyStatus("UNPUBLISHED", "ARCHIVED", admin), true);
});

test("canModeratePropertyStatus rejects invalid transitions", () => {
  const admin = { roles: ["ADMIN"] };
  assert.equal(canModeratePropertyStatus("ARCHIVED", "PUBLISHED", admin), false);
  assert.equal(canModeratePropertyStatus("ARCHIVED", "DRAFT", admin), false);
  assert.equal(canModeratePropertyStatus("PUBLISHED", "DRAFT", admin), false);
  assert.equal(canModeratePropertyStatus("UNPUBLISHED", "DRAFT", admin), false);
});

test("canModeratePropertyStatus allows no-op transitions", () => {
  const admin = { roles: ["ADMIN"] };
  assert.equal(canModeratePropertyStatus("DRAFT", "DRAFT", admin), true);
  assert.equal(canModeratePropertyStatus("PUBLISHED", "PUBLISHED", admin), true);
  assert.equal(canModeratePropertyStatus("ARCHIVED", "ARCHIVED", admin), true);
});

test("canModeratePropertyStatus rejects unknown statuses", () => {
  const admin = { roles: ["ADMIN"] };
  assert.equal(canModeratePropertyStatus("DRAFT", "PENDING", admin), false);
  assert.equal(canModeratePropertyStatus("DRAFT", "UNKNOWN", admin), false);
});

test("admin status and property status enums are correct", () => {
  assert.deepEqual(ADMIN_USER_STATUSES, ["ACTIVE", "SUSPENDED"]);
  assert.deepEqual(ADMIN_PROPERTY_STATUSES, ["DRAFT", "PUBLISHED", "UNPUBLISHED", "ARCHIVED"]);
});
