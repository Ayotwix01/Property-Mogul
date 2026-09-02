import { createServerFn } from "@tanstack/react-start";
import { and, eq, gt, isNull, or } from "drizzle-orm";
import { z } from "zod";
import { getDatabase } from "@/db";
import { contactAccess, payments, profiles, properties } from "@/db/schema";
import { requireUser } from "@/lib/auth.functions";
import {
  hasValidPaystackSignature,
  hasValidPaystackTransaction,
  toPaystackKobo,
} from "@/lib/payment.logic";

const propertyInput = z.object({ propertyId: z.string().uuid() });
const env = (name) =>
  globalThis.process?.env?.[name] ?? globalThis.__env__?.[name] ?? globalThis.env?.[name];
const getPrice = () => {
  const amount = Number(env("CONTACT_ACCESS_PRICE_NGN"));
  if (!Number.isSafeInteger(amount) || amount <= 0)
    throw new Error("Direct contact pricing is not configured.");
  return amount;
};
const getSecret = () => {
  const secret = env("PAYSTACK_SECRET_KEY") || env("PAYMENT_SECRET_KEY");
  if (!secret) throw new Error("Paystack is not configured.");
  return secret;
};

export const getContactAccessPrice = createServerFn({ method: "GET" }).handler(async () => ({
  amount: getPrice(),
  currency: "NGN",
}));

export const createContactPayment = createServerFn({ method: "POST" })
  .validator((data) => propertyInput.parse(data))
  .handler(async ({ data }) => {
    const seeker = await requireUser("SEEKER");
    const database = getDatabase();
    const [property] = await database
      .select({ id: properties.id, ownerId: properties.ownerId })
      .from(properties)
      .where(and(eq(properties.id, data.propertyId), eq(properties.status, "PUBLISHED")))
      .limit(1);
    if (!property || property.ownerId === seeker.id)
      throw new Error("Property is not available for contact access.");
    const [existing] = await database
      .select({ id: contactAccess.id })
      .from(contactAccess)
      .where(
        and(
          eq(contactAccess.seekerId, seeker.id),
          eq(contactAccess.propertyId, property.id),
          isNull(contactAccess.revokedAt),
          or(isNull(contactAccess.expiresAt), gt(contactAccess.expiresAt, new Date())),
        ),
      )
      .limit(1);
    if (existing) return { alreadyGranted: true, accessId: existing.id };
    const amount = getPrice();
    const reference = `pm_${crypto.randomUUID().replaceAll("-", "")}`;
    const [payment] = await database
      .insert(payments)
      .values({
        seekerId: seeker.id,
        propertyId: property.id,
        landlordId: property.ownerId,
        amount: String(amount),
        currency: "NGN",
        provider: "PAYSTACK",
        providerReference: reference,
        purpose: "LANDLORD_CONTACT_ACCESS",
        status: "PENDING",
      })
      .returning({ id: payments.id });
    try {
      const response = await fetch("https://api.paystack.co/transaction/initialize", {
        method: "POST",
        headers: { Authorization: `Bearer ${getSecret()}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          email: seeker.email,
          amount: toPaystackKobo(amount),
          currency: "NGN",
          reference,
          callback_url: env("PAYMENT_CALLBACK_URL"),
          metadata: { payment_id: payment.id },
        }),
      });
      const result = await response.json();
      if (!response.ok || !result.status || !result.data?.authorization_url)
        throw new Error("Paystack could not initialize the payment.");
      return {
        alreadyGranted: false,
        paymentId: payment.id,
        reference,
        status: "PENDING",
        authorizationUrl: result.data.authorization_url,
      };
    } catch (error) {
      await database
        .update(payments)
        .set({ status: "FAILED", updatedAt: new Date() })
        .where(eq(payments.id, payment.id));
      throw new Error(error instanceof Error ? error.message : "Unable to initialize payment.");
    }
  });

export async function verifyPaystackTransaction(reference) {
  const response = await fetch(
    `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
    { headers: { Authorization: `Bearer ${getSecret()}` } },
  );
  const result = await response.json();
  if (!response.ok || !result.status) throw new Error("Unable to verify Paystack transaction.");
  return result.data;
}

async function fulfillPayment(reference, transaction) {
  const database = getDatabase();
  const [payment] = await database
    .select()
    .from(payments)
    .where(and(eq(payments.provider, "PAYSTACK"), eq(payments.providerReference, reference)))
    .limit(1);
  if (!payment) return false;
  if (!hasValidPaystackTransaction(transaction, payment)) return false;
  if (payment.status !== "SUCCESS")
    await database
      .update(payments)
      .set({ status: "SUCCESS", paidAt: new Date(), updatedAt: new Date() })
      .where(eq(payments.id, payment.id));
  await database
    .insert(contactAccess)
    .values({
      seekerId: payment.seekerId,
      propertyId: payment.propertyId,
      landlordId: payment.landlordId,
      paymentId: payment.id,
    })
    .onConflictDoNothing();
  return true;
}

export async function processPaystackWebhook(rawBody, signature) {
  const secret = getSecret();
  if (!(await hasValidPaystackSignature(rawBody, signature, secret)))
    throw new Error("Invalid Paystack signature.");
  const payload = JSON.parse(rawBody);
  if (payload.event !== "charge.success" || !payload.data?.reference) return { processed: false };
  return {
    processed: await fulfillPayment(
      payload.data.reference,
      await verifyPaystackTransaction(payload.data.reference),
    ),
  };
}

export const getLandlordContact = createServerFn({ method: "POST" })
  .validator((data) => propertyInput.parse(data))
  .handler(async ({ data }) => {
    const seeker = await requireUser("SEEKER");
    const database = getDatabase();
    const [access] = await database
      .select({ landlordId: contactAccess.landlordId })
      .from(contactAccess)
      .innerJoin(payments, eq(contactAccess.paymentId, payments.id))
      .innerJoin(properties, eq(contactAccess.propertyId, properties.id))
      .where(
        and(
          eq(contactAccess.seekerId, seeker.id),
          eq(contactAccess.propertyId, data.propertyId),
          eq(properties.status, "PUBLISHED"),
          eq(payments.status, "SUCCESS"),
          isNull(contactAccess.revokedAt),
          or(isNull(contactAccess.expiresAt), gt(contactAccess.expiresAt, new Date())),
        ),
      )
      .limit(1);
    if (!access) throw new Error("Direct contact access required.");
    const [profile] = await database
      .select({ phone: profiles.phone, disclosure: profiles.disclosure })
      .from(profiles)
      .where(eq(profiles.userId, access.landlordId))
      .limit(1);
    const disclosure =
      profile?.disclosure && typeof profile.disclosure === "object" ? profile.disclosure : {};
    return { phone: profile?.phone || null, whatsapp: disclosure.whatsapp || null };
  });
