import { formatINR, formatIndianDate } from "@/lib/format";
import { sendNotification } from "../service";
import { appUrl, type DonationForNotification, type DonorForNotification } from "./shared";

/** Call only for a donation row whose charge actually succeeded. */
export function triggerRecurringDonationCharged(
  donor: DonorForNotification,
  donation: DonationForNotification,
) {
  return sendNotification({
    type: "RECURRING_DONATION_CHARGED",
    donorId: donor.id,
    entityKey: donation.id,
    data: {
      donorName: donor.fullName,
      amountFormatted: formatINR(donation.amountInr),
      dateFormatted: formatIndianDate(donation.createdAt),
      referenceId: donation.referenceId,
      campaignName: donation.campaignName ?? undefined,
      dashboardUrl: `${appUrl()}/dashboard`,
    },
    metadata: { donationId: donation.id, recurringDonationId: donation.recurringDonationId },
  });
}
