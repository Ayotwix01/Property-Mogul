import test from "node:test";
import assert from "node:assert/strict";
import {
  buildSearchReply,
  compareProperties,
  explainPropertyMatch,
  parsePropertySearch,
  propertySearchIntentSchema,
} from "../src/lib/property-search.logic.js";

test("parses Nigerian property search requirements", () => {
  assert.deepEqual(parsePropertySearch("2 bedroom apartment in Lekki under 3m"), {
    location: "lekki",
    maxPrice: 3_000_000,
    bedrooms: 2,
    propertyType: "Apartment",
    sort: "newest",
    unverifiedPreferences: [],
  });
});

test("parses common Nigerian money formats", () => {
  assert.equal(parsePropertySearch("house in Abuja below 5 million").maxPrice, 5_000_000);
  assert.equal(parsePropertySearch("apartment in Lekki under ₦3,000,000").maxPrice, 3_000_000);
  assert.equal(parsePropertySearch("office in Abuja under 500k").maxPrice, 500_000);
});

test("parses supported locations, bedrooms, bathrooms, and types", () => {
  assert.deepEqual(parsePropertySearch("3 bedroom 2 bathroom duplex around Ikeja"), {
    location: "ikeja",
    bedrooms: 3,
    bathrooms: 2,
    propertyType: "Duplex",
    sort: "newest",
    unverifiedPreferences: [],
  });
  assert.equal(parsePropertySearch("office space in Abuja").propertyType, "Office");
});

test("preserves and refines follow-up search context", () => {
  const first = parsePropertySearch("2 bedroom apartment in Lekki under 3m");
  assert.deepEqual(parsePropertySearch("Only 3 bedrooms", first), {
    ...first,
    bedrooms: 3,
  });
  assert.equal(parsePropertySearch("Show me cheaper ones", first).sort, "price_asc");
  assert.equal(parsePropertySearch("Now search Abuja", first).location, "abuja");
});

test("does not guess unsupported preferences", () => {
  const intent = parsePropertySearch("furnished apartment in Lagos with parking");
  assert.deepEqual(intent.unverifiedPreferences, ["furnished", "parking or proximity"]);
});

test("rejects empty and unsupported requests", () => {
  assert.throws(() => parsePropertySearch(""), /Tell me/);
  assert.throws(() => parsePropertySearch("I want something nice"), /can search/);
  assert.throws(
    () => propertySearchIntentSchema.parse({ minPrice: 5_000_000, maxPrice: 1_000_000 }),
    /Minimum price/,
  );
});

test("creates factual match explanations without inventing missing values", () => {
  const intent = parsePropertySearch("2 bedroom apartment in Lekki under 3m with parking");
  const explanation = explainPropertyMatch(
    {
      bedrooms: 2,
      bathrooms: null,
      city: "Lekki",
      state: "Lagos",
      neighborhood: "Lekki Phase 1",
      price: "2500000",
      propertyType: "Apartment",
    },
    intent,
  );
  assert.match(explanation, /2 bedrooms/);
  assert.match(explanation, /₦3,000,000/);
  assert.match(explanation, /parking or proximity could not be verified/);
});

test("handles no-result replies explicitly", () => {
  const intent = parsePropertySearch("house in Abuja under 5m");
  assert.match(buildSearchReply(intent, []), /couldn't find published properties/);
});

test("comparison only returns factual fields from retrieved properties", () => {
  assert.deepEqual(
    compareProperties([
      {
        id: "one",
        title: "One",
        price: "100",
        currency: "NGN",
        location: "Lekki",
        bedrooms: 2,
        bathrooms: 1,
        propertyType: "Apartment",
        owner: { name: "Hidden" },
      },
      {
        id: "two",
        title: "Two",
        price: "200",
        currency: "NGN",
        location: "Abuja",
        bedrooms: null,
        bathrooms: 2,
        propertyType: "House",
        secret: "Hidden",
      },
      { id: "three", title: "Three" },
    ]),
    [
      {
        id: "one",
        title: "One",
        price: "100",
        currency: "NGN",
        location: "Lekki",
        bedrooms: 2,
        bathrooms: 1,
        propertyType: "Apartment",
      },
      {
        id: "two",
        title: "Two",
        price: "200",
        currency: "NGN",
        location: "Abuja",
        bedrooms: null,
        bathrooms: 2,
        propertyType: "House",
      },
    ],
  );
});
