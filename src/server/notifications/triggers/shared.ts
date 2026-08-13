/**
 * Triggers take already-loaded donor/donation data from the caller (rather
 * than re-querying) so they stay simple, synchronous-shaped, and testable.
 * Callers are: server functions right after a DB write commits
 * (src/server/functions/*.ts), and the scheduled jobs (jobs/*.ts).
 */

export interface DonorForNotification {
  id: string;
  fullName: string;
}

export interface DonationForNotification {
  id: string;
  amountInr: string | number;
  campaignName: string | null;
  referenceId: string;
  createdAt: Date;
  recurringDonationId?: string | null;
}

export function appUrl(): string {
  return process.env.APP_URL || "";
}
