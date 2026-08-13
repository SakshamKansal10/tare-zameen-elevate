import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireStaffMiddleware } from "@/auth/require-donor";
import { renderTemplate } from "@/server/notifications/templates";
import { SAMPLE_DATA } from "@/server/notifications/templates/sample-data";
import { NOTIFICATION_CHANNELS, NOTIFICATION_TYPE_IDS } from "@/lib/notification-types";

/** Staff-only: renders a template against clearly-labeled sample data — never touches real donor data or sends anything. */
export const previewNotificationTemplate = createServerFn({ method: "GET" })
  .middleware([requireStaffMiddleware])
  .validator(
    z.object({
      notificationType: z.enum(NOTIFICATION_TYPE_IDS),
      channel: z.enum(NOTIFICATION_CHANNELS),
    }),
  )
  .handler(async ({ data }) => {
    const sample = SAMPLE_DATA[data.notificationType];
    if (data.channel === "email") {
      const rendered = renderTemplate(data.notificationType, "email", sample as never);
      return { channel: "email" as const, ...rendered };
    }
    const rendered = renderTemplate(data.notificationType, "whatsapp", sample as never);
    return { channel: "whatsapp" as const, ...rendered };
  });
