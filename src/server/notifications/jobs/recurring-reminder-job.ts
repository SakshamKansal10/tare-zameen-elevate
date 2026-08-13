import { and, eq, gte, lte } from "drizzle-orm";
import { getDb } from "@/db/client";
import { donors, recurringDonations } from "@/db/schema";
import { triggerRecurringDonationReminder } from "../triggers/recurring-reminder";
import type { ChannelOutcome } from "../service";

export interface RecurringReminderJobSummary {
  scanned: number;
  results: Array<{ recurringDonationId: string; donorId: string; outcomes: ChannelOutcome[] }>;
}

function toDateOnly(d: Date): string {
  return d.toISOString().slice(0, 10);
}

/**
 * Scans recurring_donations for rows whose next_charge_date falls within
 * REMINDER_DAYS_BEFORE days from now and fires RECURRING_DONATION_REMINDER
 * for each. Intended to be invoked by an external scheduler once daily —
 * see src/routes/api/cron/recurring-reminders.ts and
 * docs/MODULE1_NOTIFICATIONS.md "Scheduled Jobs".
 */
export async function runRecurringReminderJob(
  now: Date = new Date(),
): Promise<RecurringReminderJobSummary> {
  const db = getDb();
  const reminderDays = Number(process.env.REMINDER_DAYS_BEFORE ?? 3);

  const windowEnd = new Date(now);
  windowEnd.setDate(windowEnd.getDate() + reminderDays);

  const due = await db
    .select({ recurring: recurringDonations, donor: donors })
    .from(recurringDonations)
    .innerJoin(donors, eq(recurringDonations.donorId, donors.id))
    .where(
      and(
        eq(recurringDonations.status, "active"),
        gte(recurringDonations.nextChargeDate, toDateOnly(now)),
        lte(recurringDonations.nextChargeDate, toDateOnly(windowEnd)),
      ),
    );

  const results: RecurringReminderJobSummary["results"] = [];
  for (const row of due) {
    const outcomes = await triggerRecurringDonationReminder(
      { id: row.donor.id, fullName: row.donor.fullName },
      {
        id: row.recurring.id,
        amountInr: row.recurring.amountInr,
        campaignName: row.recurring.campaignName,
        nextChargeDate: row.recurring.nextChargeDate,
      },
    );
    results.push({ recurringDonationId: row.recurring.id, donorId: row.donor.id, outcomes });
  }

  return { scanned: due.length, results };
}
