import assert from "node:assert/strict";
import test from "node:test";
import { normalizeGoogleRoles, parseGoogleIdentity } from "../src/lib/google-oauth.logic.js";

test("accepts only verified Google identities", () => {
  assert.equal(
    parseGoogleIdentity({ sub: "123", email: "qa@example.com", email_verified: false }),
    null,
  );
  assert.deepEqual(
    parseGoogleIdentity({
      sub: "123",
      email: " QA@Example.com ",
      email_verified: true,
      name: "QA User",
    }),
    {
      providerAccountId: "123",
      email: "qa@example.com",
      displayName: "QA User",
      profileImageUrl: null,
    },
  );
});

test("Google roles exclude ADMIN and preserve both-role support", () => {
  assert.deepEqual(normalizeGoogleRoles(["SEEKER", "LANDLORD"]), ["SEEKER", "LANDLORD"]);
  assert.throws(() => normalizeGoogleRoles(["ADMIN"]));
  assert.throws(() => normalizeGoogleRoles(["SEEKER", "ADMIN"]));
});
