import { createFileRoute } from "@tanstack/react-router";
import { assertCronAuthorized } from "@/server/notifications/jobs/cron-auth";
import { runMonthlySummaryJob } from "@/server/notifications/jobs/monthly-summary-job";

/**
 * POST /api/cron/monthly-summary
 * Invoke once a month (e.g. 1st of the month) from an external scheduler.
 * See docs/MODULE1_NOTIFICATIONS.md "Scheduled Jobs".
 */
export const Route = createFileRoute("/api/cron/monthly-summary")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const unauthorized = assertCronAuthorized(request);
        if (unauthorized) return unauthorized;

        const summary = await runMonthlySummaryJob();
        return Response.json(summary);
      },
    },
  },
});
