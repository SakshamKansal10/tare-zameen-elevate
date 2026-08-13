/**
 * Shared-secret check for the /api/cron/* endpoints. An external scheduler
 * (cron-job.org, GitHub Actions, a Cloudflare Cron Trigger, etc.) must send
 * `Authorization: Bearer <NOTIFICATION_CRON_SECRET>` — these endpoints
 * trigger real notification sends and must not be publicly callable.
 */
export function assertCronAuthorized(request: Request): Response | null {
  const secret = process.env.NOTIFICATION_CRON_SECRET;
  if (!secret) {
    return Response.json(
      { error: "NOTIFICATION_CRON_SECRET is not configured on the server." },
      { status: 500 },
    );
  }
  const auth = request.headers.get("authorization");
  if (auth !== `Bearer ${secret}`) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}
