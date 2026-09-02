export function toPaystackKobo(amountNaira) {
  if (!Number.isSafeInteger(amountNaira) || amountNaira <= 0) {
    throw new Error("Payment amount must be a positive whole naira amount.");
  }
  return amountNaira * 100;
}

export function hasValidPaystackTransaction(transaction, payment) {
  return Boolean(
    transaction &&
    payment &&
    transaction.status === "success" &&
    transaction.reference === payment.providerReference &&
    Number(transaction.amount) === Number(payment.amount) * 100 &&
    transaction.currency === payment.currency,
  );
}

export function hasActiveContactAccess(access, now = new Date()) {
  return Boolean(
    access && !access.revokedAt && (!access.expiresAt || new Date(access.expiresAt) > now),
  );
}

export async function hasValidPaystackSignature(rawBody, signature, secret) {
  if (!rawBody || !secret) return false;
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-512" },
    false,
    ["sign"],
  );
  const digest = new Uint8Array(
    await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(rawBody)),
  );
  const expected = Array.from(digest, (byte) => byte.toString(16).padStart(2, "0")).join("");
  const received = String(signature || "").toLowerCase();
  let difference = received.length ^ expected.length;
  for (let index = 0; index < expected.length; index += 1) {
    difference |= expected.charCodeAt(index) ^ (received.charCodeAt(index) || 0);
  }
  return difference === 0;
}
