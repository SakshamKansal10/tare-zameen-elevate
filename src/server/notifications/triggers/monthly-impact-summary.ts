import { formatINR } from "@/lib/format";
import { sendNotification } from "../service";
import { appUrl, type DonorForNotification } from "./shared";

export interface MonthlyStatsForNotification {
  /** e.g. "August 2026" */
  monthLabel: string;
  /** e.g. "2026-08" — used for idempotency, must be unique per donor per month. */
  monthKey: string;
  monthlyTotal: number;
  monthlyCount: number;
  lifetimeTotal: number;
  lifetimeCount: number;
}

/**
 * entityKey MUST include donorId — idempotency_key is a single global
 * unique column, and monthKey alone would collide across every donor in
 * the same calendar month.
 */
export function triggerMonthlyImpactSummary(
  donor: DonorForNotification,
  stats: MonthlyStatsForNotification,
) {
  return sendNotification({
    type: "MONTHLY_IMPACT_SUMMARY",
    donorId: donor.id,
    entityKey: `${donor.id}:${stats.monthKey}`,
    data: {
      donorName: donor.fullName,
      monthLabel: stats.monthLabel,
      hasMonthlyActivity: stats.monthlyCount > 0,
      monthlyTotalFormatted: formatINR(stats.monthlyTotal),
      monthlyDonationCount: stats.monthlyCount,
      lifetimeTotalFormatted: formatINR(stats.lifetimeTotal),
      lifetimeDonationCount: stats.lifetimeCount,
      impactUrl: `${appUrl()}/dashboard`,
    },
    metadata: { monthKey: stats.monthKey },
  });
}
