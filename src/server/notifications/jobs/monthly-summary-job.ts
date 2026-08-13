import { and, eq, gte, inArray, lt, sql } from "drizzle-orm";
import { formatIndianMonthYear } from "@/lib/format";
import { getDb } from "@/db/client";
import { donations, donors } from "@/db/schema";
import { triggerMonthlyImpactSummary } from "../triggers/monthly-impact-summary";
import type { ChannelOutcome } from "../service";

export interface MonthlySummaryJobSummary {
  enabled: boolean;
  eligibleDonors: number;
  monthKey: string;
  results: Array<{ donorId: string; outcomes: ChannelOutcome[] }>;
}

interface DonationAgg {
  donorId: string;
  total: string | null;
  count: number;
}

/**
 * Identifies every donor with at least one successful donation ever,
 * aggregates their contribution for the previous calendar month (relative
 * to `referenceDate`) and their lifetime total, and fires
 * MONTHLY_IMPACT_SUMMARY for each. No numbers are invented — a donor with
 * zero donations in the period gets an honest "no new contribution this
 * month" message alongside their real lifetime total (see
 * templates/monthly-impact-summary.ts).
 *
 * Intended to run once a month via an external scheduler — see
 * src/routes/api/cron/monthly-summary.ts.
 */
export async function runMonthlySummaryJob(
  referenceDate: Date = new Date(),
): Promise<MonthlySummaryJobSummary> {
  const enabled = (process.env.MONTHLY_IMPACT_ENABLED ?? "true").toLowerCase() !== "false";

  const firstOfThisMonth = new Date(
    Date.UTC(referenceDate.getUTCFullYear(), referenceDate.getUTCMonth(), 1),
  );
  const firstOfPrevMonth = new Date(
    Date.UTC(firstOfThisMonth.getUTCFullYear(), firstOfThisMonth.getUTCMonth() - 1, 1),
  );
  const monthKey = `${firstOfPrevMonth.getUTCFullYear()}-${String(firstOfPrevMonth.getUTCMonth() + 1).padStart(2, "0")}`;

  if (!enabled) {
    return { enabled: false, eligibleDonors: 0, monthKey, results: [] };
  }

  const db = getDb();
  const monthLabel = formatIndianMonthYear(firstOfPrevMonth);

  const monthlyAgg = (await db
    .select({
      donorId: donations.donorId,
      total: sql<string>`coalesce(sum(${donations.amountInr}), 0)`,
      count: sql<number>`count(*)::int`,
    })
    .from(donations)
    .where(
      and(
        eq(donations.status, "succeeded"),
        gte(donations.createdAt, firstOfPrevMonth),
        lt(donations.createdAt, firstOfThisMonth),
      ),
    )
    .groupBy(donations.donorId)) as DonationAgg[];

  const lifetimeAgg = (await db
    .select({
      donorId: donations.donorId,
      total: sql<string>`coalesce(sum(${donations.amountInr}), 0)`,
      count: sql<number>`count(*)::int`,
    })
    .from(donations)
    .where(eq(donations.status, "succeeded"))
    .groupBy(donations.donorId)) as DonationAgg[];

  if (lifetimeAgg.length === 0) {
    return { enabled: true, eligibleDonors: 0, monthKey, results: [] };
  }

  const eligibleDonors = await db
    .select({ id: donors.id, fullName: donors.fullName })
    .from(donors)
    .where(
      inArray(
        donors.id,
        lifetimeAgg.map((r) => r.donorId),
      ),
    );

  const monthlyByDonor = new Map(monthlyAgg.map((r) => [r.donorId, r]));
  const lifetimeByDonor = new Map(lifetimeAgg.map((r) => [r.donorId, r]));

  const results: MonthlySummaryJobSummary["results"] = [];
  for (const donor of eligibleDonors) {
    const monthly = monthlyByDonor.get(donor.id);
    const lifetime = lifetimeByDonor.get(donor.id);
    if (!lifetime) continue;

    const outcomes = await triggerMonthlyImpactSummary(donor, {
      monthLabel,
      monthKey,
      monthlyTotal: Number(monthly?.total ?? 0),
      monthlyCount: monthly?.count ?? 0,
      lifetimeTotal: Number(lifetime.total ?? 0),
      lifetimeCount: lifetime.count,
    });
    results.push({ donorId: donor.id, outcomes });
  }

  return { enabled: true, eligibleDonors: eligibleDonors.length, monthKey, results };
}
