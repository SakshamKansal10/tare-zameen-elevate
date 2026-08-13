import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireDonorMiddleware, requireStaffMiddleware } from "@/auth/require-donor";
import { getAllNotificationLogs, getDonorNotificationLogs } from "@/server/notifications/logs";
import {
  getDonorPreferences,
  TransactionalPreferenceError,
  updateDonorPreference,
} from "@/server/notifications/preferences";
import {
  NOTIFICATION_CHANNELS,
  NOTIFICATION_STATUSES,
  NOTIFICATION_TYPE_IDS,
  NOTIFICATION_TYPES,
} from "@/lib/notification-types";

export const getNotificationTypeCatalog = createServerFn({ method: "GET" }).handler(
  async () => NOTIFICATION_TYPES,
);

export const getMyNotificationPreferences = createServerFn({ method: "GET" })
  .middleware([requireDonorMiddleware])
  .handler(async ({ context }) => getDonorPreferences(context.donor.id));

export const updateMyNotificationPreference = createServerFn({ method: "POST" })
  .middleware([requireDonorMiddleware])
  .validator(
    z.object({
      notificationType: z.enum(NOTIFICATION_TYPE_IDS),
      channel: z.enum(NOTIFICATION_CHANNELS),
      enabled: z.boolean(),
    }),
  )
  .handler(async ({ context, data }) => {
    try {
      return await updateDonorPreference(context.donor.id, data);
    } catch (error) {
      if (error instanceof TransactionalPreferenceError) {
        throw new Error(error.message);
      }
      throw error;
    }
  });

export const getMyNotificationLogs = createServerFn({ method: "GET" })
  .middleware([requireDonorMiddleware])
  .handler(async ({ context }) => getDonorNotificationLogs(context.donor.id, { limit: 100 }));

const staffLogFilters = z.object({
  notificationType: z.enum(NOTIFICATION_TYPE_IDS).optional(),
  channel: z.enum(NOTIFICATION_CHANNELS).optional(),
  status: z.enum(NOTIFICATION_STATUSES).optional(),
  donorId: z.string().uuid().optional(),
});

export const getStaffNotificationLogs = createServerFn({ method: "GET" })
  .middleware([requireStaffMiddleware])
  .validator(staffLogFilters)
  .handler(async ({ data }) => getAllNotificationLogs({ ...data, limit: 200 }));

export const getStaffAccess = createServerFn({ method: "GET" })
  .middleware([requireDonorMiddleware])
  .handler(async ({ context }) => ({ isStaff: context.donor.isStaff }));
