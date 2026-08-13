import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { getCurrentDonor } from "@/functions/auth";

/**
 * Layout for every /dashboard/* route. Auth is enforced here via
 * beforeLoad (redirect) AND independently inside every server function via
 * requireDonorMiddleware — the redirect is UX, the middleware is the real
 * security boundary (server functions are directly callable regardless of
 * which route renders them).
 */
export const Route = createFileRoute("/dashboard")({
  beforeLoad: async () => {
    const donor = await getCurrentDonor();
    if (!donor) throw redirect({ to: "/login" });
    return { donor };
  },
  component: DashboardLayout,
});

function DashboardLayout() {
  return (
    <>
      <Navbar />
      <Outlet />
      <Footer />
    </>
  );
}
