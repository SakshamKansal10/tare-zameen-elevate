import type { NotificationChannel, NotificationTypeId } from "@/lib/notification-types";

/**
 * `${type}:${channel}:${entityKey}` — enforced unique at the database level
 * (notification_logs.idempotency_key). `entityKey` should identify the
 * specific event (a donation id, a receipt id, a `recurringDonationId:date`
 * pair for reminders, a `donorId:YYYY-MM` pair for the monthly summary) so
 * that retried/duplicate trigger calls for the same event can never result
 * in two sends on the same channel.
 */
export function buildIdempotencyKey(
  type: NotificationTypeId,
  channel: NotificationChannel,
  entityKey: string,
): string {
  return `${type}:${channel}:${entityKey}`;
}
