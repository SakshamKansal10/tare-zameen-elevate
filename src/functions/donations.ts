import { randomUUID } from "node:crypto";
import { createServerFn } from "@tanstack/react-start";
import { desc, eq } from "drizzle-orm";
import { z } from "zod";
import { requireDonorMiddleware } from "@/auth/require-donor";
import { getDb } from "@/db/client";
import { donations } from "@/db/schema";
import { triggerDonationConfirmed } from "@/server/notifications/triggers/donation-confirmed";

/**
 * This is a deliberately minimal donation record — NOT a payment gateway
 * integration. It exists so Module 1's notification triggers have a real
 * event to hook into. See docs/MODULE1_NOTIFICATIONS.md "Future
 * Integration" for how the NGO's real payment gateway should call into
 * this same trigger on its webhook/success callback.
 */

const MIN_DONATION_INR = 100;

function generateReferenceId(): string {
  const year = new Date().getFullYear();
  return `TZF-${year}-${randomUUID().replace(/-/g, "").slice(0, 6).toUpperCase()}`;
}

export const createDonation = createServerFn({ method: "POST" })
  .middleware([requireDonorMiddleware])
  .validator(
    z.object({
      amountInr: z.number().min(MIN_DONATION_INR, `Minimum donation is ₹${MIN_DONATION_INR}.`),
      campaignName: z.string().trim().max(200).optional(),
      // Test-only hook so failure paths are exercisable without a real
      // payment gateway (see acceptance tests). Never surfaced in the UI.
      simulateFailure: z.boolean().optional(),
    }),
  )
  .handler(async ({ context, data }) => {
    const db = getDb();
    const referenceId = generateReferenceId();

    const [donation] = await db
      .insert(donations)
      .values({
        donorId: context.donor.id,
        amountInr: data.amountInr.toFixed(2),
        campaignName: data.campaignName || null,
        status: data.simulateFailure ? "failed" : "succeeded",
        failureReason: data.simulateFailure ? "Simulated failure (test mode)." : null,
        referenceId,
      })
      .returning();

    if (donation.status !== "succeeded") {
      return { donation, notificationOutcomes: [] };
    }

    // The donation already committed — a notification failure below must
    // never roll it back or be reported to the donor as a failed donation.
    const notificationOutcomes = await triggerDonationConfirmed(
      { id: context.donor.id, fullName: context.donor.fullName },
      donation,
    ).catch((error) => {
      console.error("triggerDonationConfirmed failed", error);
      return [];
    });

    return { donation, notificationOutcomes };
  });

export const getMyDonations = createServerFn({ method: "GET" })
  .middleware([requireDonorMiddleware])
  .handler(async ({ context }) => {
    const db = getDb();
    return db
      .select()
      .from(donations)
      .where(eq(donations.donorId, context.donor.id))
      .orderBy(desc(donations.createdAt))
      .limit(50);
  });
