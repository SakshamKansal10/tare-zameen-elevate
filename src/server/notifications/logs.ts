import { and, desc, eq, gte, lte, type SQL } from "drizzle-orm";
import { getDb } from "@/db/client";
import { donors, notificationLogs } from "@/db/schema";
import type {
  NotificationChannel,
  NotificationStatus,
  NotificationTypeId,
} from "@/lib/notification-types";

export interface LogFilters {
  notificationType?: NotificationTypeId;
  channel?: NotificationChannel;
  status?: NotificationStatus;
  from?: Date;
  to?: Date;
  limit?: number;
}

/** A donor's own notification history — always scoped to donorId. */
export async function getDonorNotificationLogs(donorId: string, filters: LogFilters = {}) {
  return queryLogs({ ...filters, donorId });
}

/** Staff/admin view — unscoped unless a specific donorId filter is supplied. */
export async function getAllNotificationLogs(filters: LogFilters & { donorId?: string } = {}) {
  return queryLogs(filters);
}

async function queryLogs(filters: LogFilters & { donorId?: string }) {
  const db = getDb();
  const conditions: SQL[] = [];
  if (filters.donorId) conditions.push(eq(notificationLogs.donorId, filters.donorId));
  if (filters.notificationType)
    conditions.push(eq(notificationLogs.notificationType, filters.notificationType));
  if (filters.channel) conditions.push(eq(notificationLogs.channel, filters.channel));
  if (filters.status) conditions.push(eq(notificationLogs.status, filters.status));
  if (filters.from) conditions.push(gte(notificationLogs.createdAt, filters.from));
  if (filters.to) conditions.push(lte(notificationLogs.createdAt, filters.to));

  return db
    .select({
      id: notificationLogs.id,
      donorId: notificationLogs.donorId,
      donorName: donors.fullName,
      notificationType: notificationLogs.notificationType,
      channel: notificationLogs.channel,
      templateKey: notificationLogs.templateKey,
      recipient: notificationLogs.recipient,
      subject: notificationLogs.subject,
      provider: notificationLogs.provider,
      providerMessageId: notificationLogs.providerMessageId,
      status: notificationLogs.status,
      errorCode: notificationLogs.errorCode,
      errorMessage: notificationLogs.errorMessage,
      sentAt: notificationLogs.sentAt,
      failedAt: notificationLogs.failedAt,
      createdAt: notificationLogs.createdAt,
    })
    .from(notificationLogs)
    .innerJoin(donors, eq(notificationLogs.donorId, donors.id))
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(desc(notificationLogs.createdAt))
    .limit(Math.min(filters.limit ?? 100, 200));
}
