import { createServerFn } from "@tanstack/react-start";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { getDatabase } from "@/db";
import { profiles, verificationRequests } from "@/db/schema";
import { requireUser } from "@/lib/auth.functions";
import { mapVerificationStatus } from "@/lib/backend.logic";

const SessionInput = z.object({
  vendorData: z.string().min(1).max(200),
});

const SessionStatusInput = z.object({
  sessionId: z.string().min(1).max(200),
});

const ManualRequestInput = z.object({
  type: z.enum(["IDENTITY", "PROPERTY", "AUTHORITY_TO_RENT"]),
  metadata: z.record(z.string(), z.string()).default({}),
});

function readRuntimeEnv(name) {
  return globalThis.process?.env?.[name] ?? globalThis.__env__?.[name] ?? globalThis.env?.[name];
}

function getDiditConfig() {
  const apiKey = readRuntimeEnv("DIDIT_API_KEY");
  const workflowId = readRuntimeEnv("DIDIT_WORKFLOW_ID");

  if (!apiKey || !workflowId) {
    throw new Error(
      "Identity verification is not configured yet. Add DIDIT_API_KEY and DIDIT_WORKFLOW_ID on the server.",
    );
  }

  return { apiKey, workflowId };
}

export const createIdentityVerificationSession = createServerFn({ method: "POST" })
  .validator((data) => SessionInput.parse(data))
  .handler(async ({ data }) => {
    const user = await requireUser();
    const { apiKey, workflowId } = getDiditConfig();
    const callback = readRuntimeEnv("DIDIT_CALLBACK_URL");
    const response = await fetch("https://verification.didit.me/v3/session/", {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        workflow_id: workflowId,
        vendor_data: data.vendorData,
        ...(callback ? { callback } : {}),
      }),
    });

    if (!response.ok) {
      throw new Error("Identity provider returned HTTP " + response.status + ".");
    }

    const result = await response.json();
    if (!result.session_id || !result.url) {
      throw new Error("Identity provider returned an incomplete verification session.");
    }

    const database = getDatabase();
    await database.insert(verificationRequests).values({
      userId: user.id,
      type: "IDENTITY",
      provider: "DIDIT",
      providerReference: result.session_id,
      status: "PENDING",
      submittedAt: new Date(),
    });

    return { sessionId: result.session_id, url: result.url };
  });

export const getIdentityVerificationStatus = createServerFn({ method: "POST" })
  .validator((data) => SessionStatusInput.parse(data))
  .handler(async ({ data }) => {
    const user = await requireUser();
    const { apiKey } = getDiditConfig();
    const response = await fetch(
      "https://verification.didit.me/v3/session/" +
        encodeURIComponent(data.sessionId) +
        "/decision/",
      {
        headers: { "x-api-key": apiKey },
      },
    );

    if (!response.ok) {
      throw new Error("Identity provider returned HTTP " + response.status + ".");
    }

    const result = await response.json();
    const status = mapVerificationStatus(result.status);
    const database = getDatabase();
    const [request] = await database
      .select()
      .from(verificationRequests)
      .where(
        and(
          eq(verificationRequests.userId, user.id),
          eq(verificationRequests.providerReference, data.sessionId),
        ),
      )
      .limit(1);

    if (!request) throw new Error("Verification session does not belong to this account.");

    await database
      .update(verificationRequests)
      .set({
        status,
        reviewedAt: status === "PENDING" ? null : new Date(),
        updatedAt: new Date(),
      })
      .where(eq(verificationRequests.id, request.id));
    await database
      .update(profiles)
      .set({ trustStatus: status, updatedAt: new Date() })
      .where(eq(profiles.userId, user.id));

    return {
      status: result.status || "Unknown",
      sessionId: data.sessionId,
    };
  });

export const requestManualVerification = createServerFn({ method: "POST" })
  .validator((data) => ManualRequestInput.parse(data))
  .handler(async ({ data }) => {
    const user = await requireUser();
    const database = getDatabase();
    const [request] = await database
      .insert(verificationRequests)
      .values({
        userId: user.id,
        type: data.type,
        provider: "PROPERTY_MOGUL_REVIEW",
        status: "PENDING",
        submittedAt: new Date(),
        metadata: data.metadata,
      })
      .returning({ id: verificationRequests.id, status: verificationRequests.status });
    return request;
  });
