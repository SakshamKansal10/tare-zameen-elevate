import { randomUUID } from "node:crypto";
import { createServerFn } from "@tanstack/react-start";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { requireDonorMiddleware } from "@/auth/require-donor";
import { getDb } from "@/db/client";
import { donations, receipts } from "@/db/schema";
import { triggerReceiptReady } from "@/server/notifications/triggers/receipt-ready";

function generateReceiptNumber(): string {
  const year = new Date().getFullYear();
  return `RCPT-${year}-${randomUUID().replace(/-/g, "").slice(0, 8).toUpperCase()}`;
}

/**
 * RECEIPT_READY fires only once a receipt row genuinely exists — never
 * merely because a donation exists (see brief section 12). In a production
 * integration this would be called once the NGO's receipt-generation
 * pipeline (e.g. an 80G-compliant PDF generator) confirms the document is
 * actually available.
 */
export const generateReceiptForDonation = createServerFn({ method: "POST" })
  .middleware([requireDonorMiddleware])
  .validator(z.object({ donationId: z.string().uuid() }))
  .handler(async ({ context, data }) => {
    const db = getDb();
    const [donation] = await db
      .select()
      .from(donations)
      .where(eq(donations.id, data.donationId))
      .limit(1);
    if (!donation || donation.donorId !== context.donor.id) {
      throw new Error("Donation not found.");
    }
    if (donation.status !== "succeeded") {
      throw new Error("Cannot generate a receipt for a donation that did not succeed.");
    }

    const [existing] = await db
      .select()
      .from(receipts)
      .where(eq(receipts.donationId, donation.id))
      .limit(1);
    if (existing) {
      return { receipt: existing, notificationOutcomes: [] as const };
    }

    const [receipt] = await db
      .insert(receipts)
      .values({ donationId: donation.id, receiptNumber: generateReceiptNumber() })
      .returning();

    const notificationOutcomes = await triggerReceiptReady(
      { id: context.donor.id, fullName: context.donor.fullName },
      donation,
      receipt,
    ).catch((error) => {
      console.error("triggerReceiptReady failed", error);
      return [];
    });

    return { receipt, notificationOutcomes };
  });

export const getMyReceipts = createServerFn({ method: "GET" })
  .middleware([requireDonorMiddleware])
  .handler(async ({ context }) => {
    const db = getDb();
    return db
      .select({ receipt: receipts, donation: donations })
      .from(receipts)
      .innerJoin(donations, eq(receipts.donationId, donations.id))
      .where(eq(donations.donorId, context.donor.id));
  });

export const getMyReceiptById = createServerFn({ method: "GET" })
  .middleware([requireDonorMiddleware])
  .validator(z.object({ receiptId: z.string().uuid() }))
  .handler(async ({ context, data }) => {
    const db = getDb();
    const [row] = await db
      .select({ receipt: receipts, donation: donations })
      .from(receipts)
      .innerJoin(donations, eq(receipts.donationId, donations.id))
      .where(and(eq(receipts.id, data.receiptId), eq(donations.donorId, context.donor.id)))
      .limit(1);
    if (!row) throw new Error("Receipt not found.");
    return row;
  });
