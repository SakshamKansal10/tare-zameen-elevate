import { randomUUID } from "node:crypto";
import { createServerFn } from "@tanstack/react-start";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { requireDonorMiddleware } from "@/auth/require-donor";
import { getDb } from "@/db/client";
import { donations, recurringDonations } from "@/db/schema";
import { triggerRecurringDonationCharged } from "@/server/notifications/triggers/recurring-charged";

function addOneMonth(from: Date): string {
  const d = new Date(from);
  d.setUTCMonth(d.getUTCMonth() + 1);
  return d.toISOString().slice(0, 10);
}

function generateReferenceId(): string {
  const year = new Date().getFullYear();
  return `TZF-${year}-${randomUUID().replace(/-/g, "").slice(0, 6).toUpperCase()}`;
}

export const createRecurringDonation = createServerFn({ method: "POST" })
  .middleware([requireDonorMiddleware])
  .validator(
    z.object({
      amountInr: z.number().min(100),
      campaignName: z.string().trim().max(200).optional(),
    }),
  )
  .handler(async ({ context, data }) => {
    const db = getDb();
    const [recurring] = await db
      .insert(recurringDonations)
      .values({
        donorId: context.donor.id,
        amountInr: data.amountInr.toFixed(2),
        campaignName: data.campaignName || null,
        nextChargeDate: addOneMonth(new Date()),
      })
      .returning();
    return recurring;
  });

export const getMyRecurringDonations = createServerFn({ method: "GET" })
  .middleware([requireDonorMiddleware])
  .handler(async ({ context }) => {
    const db = getDb();
    return db
      .select()
      .from(recurringDonations)
      .where(eq(recurringDonations.donorId, context.donor.id));
  });

/**
 * Simulates a scheduled recurring charge succeeding. There is no live
 * payment gateway wired into this demo module — see
 * docs/MODULE1_NOTIFICATIONS.md "Future Integration" for how a real
 * gateway's webhook handler should call the same
 * triggerRecurringDonationCharged() this function calls, instead of using
 * this endpoint.
 */
export const simulateRecurringCharge = createServerFn({ method: "POST" })
  .middleware([requireDonorMiddleware])
  .validator(z.object({ recurringDonationId: z.string().uuid() }))
  .handler(async ({ context, data }) => {
    const db = getDb();
    const [recurring] = await db
      .select()
      .from(recurringDonations)
      .where(
        and(
          eq(recurringDonations.id, data.recurringDonationId),
          eq(recurringDonations.donorId, context.donor.id),
        ),
      )
      .limit(1);
    if (!recurring) throw new Error("Recurring donation not found.");
    if (recurring.status !== "active") throw new Error("This recurring donation is not active.");

    const [donation] = await db
      .insert(donations)
      .values({
        donorId: context.donor.id,
        recurringDonationId: recurring.id,
        amountInr: recurring.amountInr,
        campaignName: recurring.campaignName,
        status: "succeeded",
        referenceId: generateReferenceId(),
      })
      .returning();

    await db
      .update(recurringDonations)
      .set({
        nextChargeDate: addOneMonth(new Date(recurring.nextChargeDate)),
        updatedAt: new Date(),
      })
      .where(eq(recurringDonations.id, recurring.id));

    const notificationOutcomes = await triggerRecurringDonationCharged(
      { id: context.donor.id, fullName: context.donor.fullName },
      donation,
    ).catch((error) => {
      console.error("triggerRecurringDonationCharged failed", error);
      return [];
    });

    return { donation, notificationOutcomes };
  });
