import { and, eq } from "drizzle-orm";
import { getDb } from "@/db/client";
import { notificationPreferences } from "@/db/schema";
import {
  isTransactional,
  NOTIFICATION_TYPE_IDS,
  NOTIFICATION_TYPES,
  type NotificationChannel,
  type NotificationTypeId,
} from "@/lib/notification-types";

export interface PreferenceRow {
  notificationType: NotificationTypeId;
  emailEnabled: boolean;
  whatsappEnabled: boolean;
  isTransactional: boolean;
}

/**
 * Always returns one row per known notification type (filling in registry
 * defaults for any type the donor has never touched) so the UI never has to
 * special-case "no preference set yet".
 */
export async function getDonorPreferences(donorId: string): Promise<PreferenceRow[]> {
  const db = getDb();
  const rows = await db
    .select()
    .from(notificationPreferences)
    .where(eq(notificationPreferences.donorId, donorId));
  const byType = new Map(rows.map((r) => [r.notificationType, r]));

  return NOTIFICATION_TYPE_IDS.map((type) => {
    const meta = NOTIFICATION_TYPES[type];
    const row = byType.get(type);
    return {
      notificationType: type,
      emailEnabled: row ? row.emailEnabled : meta.defaultEnabled.email,
      whatsappEnabled: row ? row.whatsappEnabled : meta.defaultEnabled.whatsapp,
      isTransactional: meta.category === "transactional",
    };
  });
}

export interface UpdatePreferenceInput {
  notificationType: NotificationTypeId;
  channel: NotificationChannel;
  enabled: boolean;
}

export class TransactionalPreferenceError extends Error {
  constructor(type: NotificationTypeId) {
    super(
      `"${NOTIFICATION_TYPES[type].name}" is a transactional notification and cannot be disabled.`,
    );
    this.name = "TransactionalPreferenceError";
  }
}

export class UnknownNotificationTypeError extends Error {
  constructor(type: string) {
    super(`Unknown notification type: ${type}`);
    this.name = "UnknownNotificationTypeError";
  }
}

/**
 * The business rule that essential notifications cannot be disabled lives
 * here — the single place preference writes happen — so it can never drift
 * out of sync with what the notification engine treats as transactional.
 */
export async function updateDonorPreference(
  donorId: string,
  input: UpdatePreferenceInput,
): Promise<PreferenceRow> {
  if (!NOTIFICATION_TYPES[input.notificationType]) {
    throw new UnknownNotificationTypeError(input.notificationType);
  }
  if (!input.enabled && isTransactional(input.notificationType)) {
    throw new TransactionalPreferenceError(input.notificationType);
  }

  const db = getDb();
  const meta = NOTIFICATION_TYPES[input.notificationType];

  const [existing] = await db
    .select()
    .from(notificationPreferences)
    .where(
      and(
        eq(notificationPreferences.donorId, donorId),
        eq(notificationPreferences.notificationType, input.notificationType),
      ),
    )
    .limit(1);

  const base = existing ?? {
    emailEnabled: meta.defaultEnabled.email,
    whatsappEnabled: meta.defaultEnabled.whatsapp,
  };
  const next = {
    emailEnabled: input.channel === "email" ? input.enabled : base.emailEnabled,
    whatsappEnabled: input.channel === "whatsapp" ? input.enabled : base.whatsappEnabled,
  };

  await db
    .insert(notificationPreferences)
    .values({ donorId, notificationType: input.notificationType, ...next, updatedAt: new Date() })
    .onConflictDoUpdate({
      target: [notificationPreferences.donorId, notificationPreferences.notificationType],
      set: { ...next, updatedAt: new Date() },
    });

  return {
    notificationType: input.notificationType,
    ...next,
    isTransactional: meta.category === "transactional",
  };
}
