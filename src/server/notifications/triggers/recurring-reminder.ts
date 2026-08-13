import { formatINR, formatIndianDate } from "@/lib/format";
import { sendNotification } from "../service";
import { appUrl, type DonorForNotification } from "./shared";

export interface RecurringDonationForReminder {
  id: string;
  amountInr: string | number;
  campaignName: string | null;
  nextChargeDate: string;
}

/**
 * entityKey includes the scheduled date so the reminder fires again on each
 * future cycle instead of being permanently deduped after the first month.
 */
export function triggerRecurringDonationReminder(
  donor: DonorForNotification,
  recurring: RecurringDonationForReminder,
) {
  return sendNotification({
    type: "RECURRING_DONATION_REMINDER",
    donorId: donor.id,
    entityKey: `${recurring.id}:${recurring.nextChargeDate}`,
    data: {
      donorName: donor.fullName,
      amountFormatted: formatINR(recurring.amountInr),
      scheduledDateFormatted: formatIndianDate(recurring.nextChargeDate),
      campaignName: recurring.campaignName ?? undefined,
      manageUrl: `${appUrl()}/dashboard`,
    },
    metadata: { recurringDonationId: recurring.id, scheduledDate: recurring.nextChargeDate },
  });
}
