import { createMiddleware } from "@tanstack/react-start";
import { eq } from "drizzle-orm";
import { getDb } from "@/db/client";
import { donors } from "@/db/schema";
import { getAuthedUser } from "@/supabase/server";

export class UnauthorizedError extends Error {
  constructor(message = "You must be signed in to do that.") {
    super(message);
    this.name = "UnauthorizedError";
  }
}

/**
 * Resolves the Supabase-authenticated user for this request and loads their
 * donor row. Throws UnauthorizedError if there is no session or no matching
 * donor — every server function that touches donor-specific data attaches
 * this middleware (route `beforeLoad` guards are UX only, not the data
 * boundary — see @tanstack/start-client-core auth-server-primitives skill).
 */
export const requireDonorMiddleware = createMiddleware({ type: "function" }).server(
  async ({ next }) => {
    const user = await getAuthedUser();
    if (!user) throw new UnauthorizedError();

    const db = getDb();
    const [donor] = await db.select().from(donors).where(eq(donors.id, user.id)).limit(1);
    if (!donor) throw new UnauthorizedError("Donor profile not found for this account.");

    return next({ context: { donor } });
  },
);

/**
 * Same as requireDonorMiddleware, but also requires donors.is_staff = true.
 * This is a placeholder RBAC gate — see docs/MODULE1_NOTIFICATIONS.md
 * "Future Integration" for how to replace it with a real staff-auth system.
 */
export const requireStaffMiddleware = createMiddleware({ type: "function" }).server(
  async ({ next }) => {
    const user = await getAuthedUser();
    if (!user) throw new UnauthorizedError();

    const db = getDb();
    const [donor] = await db.select().from(donors).where(eq(donors.id, user.id)).limit(1);
    if (!donor) throw new UnauthorizedError("Donor profile not found for this account.");
    if (!donor.isStaff) throw new UnauthorizedError("Staff access required.");

    return next({ context: { donor } });
  },
);
