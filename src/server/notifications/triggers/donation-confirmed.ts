import { formatINR, formatIndianDate } from "@/lib/format";
import { sendNotification } from "../service";
import { appUrl, type DonationForNotification, type DonorForNotification } from "./shared";

/**
 * Call only after a donation row has actually committed with status
 * "succeeded" — never for a failed/pending donation (see
 * src/server/functions/donations.ts).
 */
export function triggerDonationConfirmed(
  donor: DonorForNotification,
  donation: DonationForNotification,
) {
  return sendNotification({
    type: "DONATION_CONFIRMED",
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
    metadata: { donationId: donation.id },
  });
}
