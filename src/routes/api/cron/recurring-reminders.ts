import { createFileRoute } from "@tanstack/react-router";
import { assertCronAuthorized } from "@/server/notifications/jobs/cron-auth";
import { runRecurringReminderJob } from "@/server/notifications/jobs/recurring-reminder-job";

/**
 * POST /api/cron/recurring-reminders
 * Invoke once daily from an external scheduler. See
 * docs/MODULE1_NOTIFICATIONS.md "Scheduled Jobs".
 */
export const Route = createFileRoute("/api/cron/recurring-reminders")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const unauthorized = assertCronAuthorized(request);
        if (unauthorized) return unauthorized;

        const summary = await runRecurringReminderJob();
        return Response.json(summary);
      },
    },
  },
});
