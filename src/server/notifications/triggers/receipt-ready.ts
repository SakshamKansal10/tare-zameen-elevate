import { formatINR, formatIndianDate } from "@/lib/format";
import { sendNotification } from "../service";
import { appUrl, type DonorForNotification } from "./shared";

export interface ReceiptForNotification {
  id: string;
  receiptNumber: string;
}

export interface DonationForReceiptNotification {
  id: string;
  amountInr: string | number;
  createdAt: Date;
}

/**
 * Call only once the receipt row actually exists (has a real receipt
 * number and a resolvable URL) — never merely because a donation exists.
 */
export function triggerReceiptReady(
  donor: DonorForNotification,
  donation: DonationForReceiptNotification,
  receipt: ReceiptForNotification,
) {
  return sendNotification({
    type: "RECEIPT_READY",
    donorId: donor.id,
    entityKey: receipt.id,
    data: {
      donorName: donor.fullName,
      amountFormatted: formatINR(donation.amountInr),
      dateFormatted: formatIndianDate(donation.createdAt),
      receiptNumber: receipt.receiptNumber,
      receiptUrl: `${appUrl()}/dashboard/receipts/${receipt.id}`,
    },
    metadata: { donationId: donation.id, receiptId: receipt.id },
  });
}
