import { z } from "zod";

const MILLION = 1_000_000;
const THOUSAND = 1_000;

export const propertySearchIntentSchema = z
  .object({
    location: z.string().trim().min(2).max(100).optional(),
    minPrice: z.number().finite().nonnegative().max(1_000_000_000_000).optional(),
    maxPrice: z.number().finite().nonnegative().max(1_000_000_000_000).optional(),
    bedrooms: z.number().int().nonnegative().max(50).optional(),
    bathrooms: z.number().int().nonnegative().max(50).optional(),
    propertyType: z.string().trim().min(2).max(80).optional(),
    sort: z.enum(["newest", "price_asc", "price_desc", "beds"]).default("newest"),
    unverifiedPreferences: z.array(z.string().trim().min(2).max(80)).max(8).default([]),
  })
  .refine(
    (value) =>
      value.minPrice === undefined ||
      value.maxPrice === undefined ||
      value.minPrice <= value.maxPrice,
    {
      message: "Minimum price cannot exceed maximum price.",
      path: ["minPrice"],
    },
  );

const LOCATION_TERMS = [
  "victoria island",
  "ajah",
  "gwarinpa",
  "maitama",
  "ikeja",
  "surulere",
  "ikoyi",
  "lekki",
  "yaba",
  "wuse",
  "kubwa",
  "maryland",
  "lagos",
  "abuja",
];

const PROPERTY_TYPES = [
  ["apartment", "Apartment"],
  ["flat", "Apartment"],
  ["house", "House"],
  ["duplex", "Duplex"],
  ["office", "Office"],
  ["commercial", "Commercial"],
  ["shop", "Shop"],
  ["land", "Land"],
];

function parseMoney(value, suffix = "") {
  const number = Number(String(value).replace(/,/g, ""));
  if (!Number.isFinite(number)) return null;
  const normalizedSuffix = suffix.toLowerCase();
  const multiplier =
    normalizedSuffix === "b"
      ? 1_000_000_000
      : normalizedSuffix === "m"
        ? MILLION
        : normalizedSuffix === "k"
          ? THOUSAND
          : 1;
  const amount = Math.round(number * multiplier);
  return amount > 0 && amount <= 1_000_000_000_000 ? amount : null;
}

function parsePrice(text) {
  const money =
    /(?:₦|ngn|n)\s*(\d[\d,.]*)\s*(b|m|k|million|billion|thousand)?|\b(\d[\d,.]*)\s*(b|m|k|million|billion|thousand)\b/i;
  const match = text.match(money);
  if (!match) return null;
  const value = match[1] || match[3];
  const suffix = (match[2] || match[4])?.toLowerCase();
  const normalizedSuffix =
    suffix === "million"
      ? "m"
      : suffix === "billion"
        ? "b"
        : suffix === "thousand"
          ? "k"
          : suffix || "";
  return parseMoney(value, normalizedSuffix);
}

function findLocation(text) {
  const normalized = text.toLowerCase();
  return LOCATION_TERMS.find((term) => normalized.includes(term));
}

function findPropertyType(text) {
  const normalized = text.toLowerCase();
  for (const [term, label] of PROPERTY_TYPES) {
    if (new RegExp(`\\b${term}\\b`, "i").test(normalized)) return label;
  }
  return undefined;
}

function mergeIntent(previous, next) {
  const merged = { ...(previous || {}), ...next };
  if (next.unverifiedPreferences) {
    merged.unverifiedPreferences = next.unverifiedPreferences;
  }
  return propertySearchIntentSchema.parse(merged);
}

export function parsePropertySearch(text, previousIntent = undefined) {
  const input = String(text || "").trim();
  if (!input) throw new Error("Tell me the type of property, location, or budget you need.");
  if (input.length > 2000) throw new Error("Please keep your request under 2,000 characters.");

  const lower = input.toLowerCase();
  const next = {};
  const bedroomMatch = lower.match(/\b(\d{1,2})\s*[- ]?bed(?:room)?s?\b/);
  const bathroomMatch = lower.match(/\b(\d{1,2})\s*[- ]?bath(?:room)?s?\b/);
  if (bedroomMatch) next.bedrooms = Number(bedroomMatch[1]);
  if (bathroomMatch) next.bathrooms = Number(bathroomMatch[1]);

  const parsedPrice = parsePrice(input);
  if (parsedPrice) {
    if (/\b(under|below|less than|up to|maximum|max)\b|[<≤]/i.test(input))
      next.maxPrice = parsedPrice;
    else if (/\b(over|above|more than|from|minimum|min)\b|[>≥]/i.test(input))
      next.minPrice = parsedPrice;
    else if (/\baround\b|\babout\b|\broughly\b/i.test(input)) {
      next.minPrice = Math.round(parsedPrice * 0.8);
      next.maxPrice = Math.round(parsedPrice * 1.2);
    } else next.maxPrice = parsedPrice;
  }

  const location = findLocation(input);
  if (location) next.location = location;
  const propertyType = findPropertyType(input);
  if (propertyType) next.propertyType = propertyType;
  if (/\bcheaper|lowest price|least expensive\b/i.test(input)) next.sort = "price_asc";
  if (/\bmost expensive|highest price\b/i.test(input)) next.sort = "price_desc";
  if (/\bremove\s+furnished\b/i.test(input)) {
    next.unverifiedPreferences = (previousIntent?.unverifiedPreferences || []).filter(
      (item) => item !== "furnished",
    );
  } else if (/\bfurnished\b/i.test(input)) {
    next.unverifiedPreferences = [
      ...new Set([...(previousIntent?.unverifiedPreferences || []), "furnished"]),
    ];
  }
  if (/\bparking|car park|main road|near\b/i.test(input)) {
    next.unverifiedPreferences = [
      ...new Set([
        ...(next.unverifiedPreferences || previousIntent?.unverifiedPreferences || []),
        "parking or proximity",
      ]),
    ];
  }

  const intent = mergeIntent(previousIntent, next);
  const hasSearchSignal = [
    intent.location,
    intent.minPrice,
    intent.maxPrice,
    intent.bedrooms,
    intent.bathrooms,
    intent.propertyType,
  ].some((value) => value !== undefined);
  if (!hasSearchSignal) {
    throw new Error(
      "I can search by location, budget, bedrooms, bathrooms, or property type. For example: “2 bedroom apartment in Lekki under ₦3m”.",
    );
  }
  return intent;
}

function formatMoney(value) {
  return value === undefined ? null : `₦${Number(value).toLocaleString("en-NG")}`;
}

export function explainPropertyMatch(property, intent) {
  const reasons = [];
  if (intent.bedrooms !== undefined) {
    if (property.bedrooms === null || property.bedrooms === undefined)
      reasons.push("bedroom count is not available");
    else if (property.bedrooms >= intent.bedrooms)
      reasons.push(`${property.bedrooms} bedroom${property.bedrooms === 1 ? "" : "s"}`);
  }
  if (intent.location) {
    const location =
      `${property.city || ""} ${property.state || ""} ${property.neighborhood || ""}`.toLowerCase();
    if (location.includes(intent.location.toLowerCase()))
      reasons.push(`location includes ${intent.location}`);
  }
  if (intent.maxPrice !== undefined && Number(property.price) <= intent.maxPrice)
    reasons.push(`listed below ${formatMoney(intent.maxPrice)}`);
  if (intent.minPrice !== undefined && Number(property.price) >= intent.minPrice)
    reasons.push(`listed above ${formatMoney(intent.minPrice)}`);
  if (
    intent.propertyType &&
    String(property.propertyType).toLowerCase() === intent.propertyType.toLowerCase()
  )
    reasons.push(`${property.propertyType.toLowerCase()} property`);
  if (
    intent.bathrooms !== undefined &&
    property.bathrooms !== null &&
    property.bathrooms >= intent.bathrooms
  )
    reasons.push(`${property.bathrooms} bathroom${property.bathrooms === 1 ? "" : "s"}`);
  for (const preference of intent.unverifiedPreferences || [])
    reasons.push(`${preference} could not be verified from listing data`);
  return reasons.length
    ? `Matches because it has ${reasons.join(", ")}.`
    : "This is a published listing returned by your current search criteria.";
}

export function buildSearchReply(intent, properties) {
  const summary = [];
  if (intent.bedrooms !== undefined) summary.push(`${intent.bedrooms}-bedroom`);
  if (intent.propertyType) summary.push(intent.propertyType.toLowerCase());
  if (intent.location) summary.push(`in ${intent.location}`);
  if (intent.maxPrice !== undefined) summary.push(`up to ${formatMoney(intent.maxPrice)}`);
  if (!properties.length)
    return `I couldn't find published properties matching ${summary.join(" ") || "those criteria"}. Try widening the location, budget, or bedroom requirement.`;
  return `I found ${properties.length} published propert${properties.length === 1 ? "y" : "ies"}${summary.length ? ` matching ${summary.join(" ")}` : ""}. These results come from the Property Mogul database.`;
}

export function compareProperties(properties) {
  return properties.slice(0, 2).map((property) => ({
    id: property.id,
    title: property.title,
    price: property.price,
    currency: property.currency,
    location: property.location,
    bedrooms: property.bedrooms,
    bathrooms: property.bathrooms,
    propertyType: property.propertyType,
  }));
}

export const CHAT_MAX_MESSAGES = 12;
export const CHAT_MAX_MESSAGE_LENGTH = 2000;
