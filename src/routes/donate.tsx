import { createFileRoute, Link, useSearch } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { motion } from "framer-motion";
import { useState } from "react";
import { toast } from "sonner";
import { Heart, ArrowLeft, ShieldCheck, BadgeCheck, LogIn } from "lucide-react";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { cn } from "@/lib/utils";
import { getCurrentDonor } from "@/functions/auth";
import { createDonation } from "@/functions/donations";

type DonateSearch = { campaign?: string; category?: string };

export const Route = createFileRoute("/donate")({
  validateSearch: (s: Record<string, unknown>): DonateSearch => ({
    campaign: typeof s.campaign === "string" ? s.campaign : undefined,
    category: typeof s.category === "string" ? s.category : undefined,
  }),
  loader: () => getCurrentDonor(),
  head: () => ({
    meta: [
      { title: "Donate — Tare Zameen Foundation" },
      {
        name: "description",
        content: "Make a tax-exempt donation to fund verified community drives.",
      },
      { property: "og:title", content: "Donate to Tare Zameen Foundation" },
      { property: "og:description", content: "Fund real change with 100% transparency." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: DonatePage,
});

const AMOUNTS = [500, 1000, 2500, 5000, 10000];

function DonatePage() {
  const { campaign, category } = useSearch({ from: "/donate" });
  const donor = Route.useLoaderData();
  const createDonationFn = useServerFn(createDonation);

  const [amount, setAmount] = useState(1000);
  const [custom, setCustom] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [confirmed, setConfirmed] = useState<{ amount: number; referenceId: string } | null>(null);

  const final = custom ? Number(custom) : amount;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!final || final < 100) return toast.error("Minimum donation is ₹100.");

    setSubmitting(true);
    try {
      const result = await createDonationFn({ data: { amountInr: final, campaignName: campaign } });
      setConfirmed({ amount: final, referenceId: result.donation.referenceId });
      toast.success(`Thank you! Your ₹${final.toLocaleString("en-IN")} contribution is confirmed.`);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Something went wrong. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Navbar />
      <main className="mx-auto min-h-dvh max-w-[1000px] px-6 pb-20 pt-32 lg:px-10">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-navy"
        >
          <ArrowLeft className="size-4" /> Back to home
        </Link>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mt-6 grid gap-8 lg:grid-cols-5"
        >
          <div className="lg:col-span-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-brand">
              Make a Donation
            </p>
            <h1 className="mt-2 font-display text-4xl font-semibold text-navy sm:text-5xl">
              Fund <span className="italic text-brand">real change.</span>
            </h1>
            {campaign && (
              <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-brand/8 px-3 py-1.5 text-[12.5px] font-medium text-brand">
                Supporting campaign #{campaign}
                {category ? ` · ${category}` : ""}
              </div>
            )}

            {!donor ? (
              <div className="mt-8 rounded-2xl border border-border bg-white p-8 text-center shadow-soft">
                <div className="mx-auto grid size-12 place-items-center rounded-full bg-brand/10 text-brand">
                  <LogIn className="size-5" />
                </div>
                <h2 className="mt-4 font-display text-xl font-semibold text-navy">
                  Sign in to donate
                </h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  Your donor portal keeps every receipt and confirmation in one place — sign in or
                  create an account to continue.
                </p>
                <Link
                  to="/login"
                  className="mt-5 inline-flex items-center justify-center gap-2 rounded-xl grad-brand px-6 py-3 text-sm font-semibold text-white shadow-glow transition hover:scale-[1.02]"
                >
                  Continue to donor portal
                </Link>
              </div>
            ) : confirmed ? (
              <div className="mt-8 rounded-2xl border border-border bg-white p-8 text-center shadow-soft">
                <div className="mx-auto grid size-12 place-items-center rounded-full bg-brand/10 text-brand">
                  <Heart className="size-5" fill="currentColor" />
                </div>
                <h2 className="mt-4 font-display text-xl font-semibold text-navy">
                  Thank you, {donor.fullName.split(" ")[0]}!
                </h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  Your ₹{confirmed.amount.toLocaleString("en-IN")} donation is confirmed. A
                  confirmation has been sent to your registered email
                  {donor.phone ? " and WhatsApp" : ""}.
                </p>
                <p className="mt-3 font-mono text-xs text-muted-foreground">
                  Ref: {confirmed.referenceId}
                </p>
                <div className="mt-5 flex flex-wrap justify-center gap-2">
                  <Link
                    to="/dashboard"
                    className="inline-flex items-center justify-center rounded-xl grad-brand px-5 py-2.5 text-sm font-semibold text-white shadow-glow transition hover:scale-[1.02]"
                  >
                    View your dashboard
                  </Link>
                  <button
                    type="button"
                    onClick={() => setConfirmed(null)}
                    className="inline-flex items-center justify-center rounded-xl border border-border bg-white px-5 py-2.5 text-sm font-semibold text-navy transition hover:bg-accent"
                  >
                    Make another donation
                  </button>
                </div>
              </div>
            ) : (
              <form
                onSubmit={submit}
                className="mt-8 space-y-6 rounded-2xl border border-border bg-white p-6 shadow-soft"
              >
                <div>
                  <div className="text-sm font-semibold text-navy">Choose amount (INR)</div>
                  <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-5">
                    {AMOUNTS.map((a) => (
                      <button
                        key={a}
                        type="button"
                        onClick={() => {
                          setAmount(a);
                          setCustom("");
                        }}
                        className={cn(
                          "rounded-lg border px-3 py-2.5 text-sm font-semibold transition-all",
                          amount === a && !custom
                            ? "border-brand bg-brand/10 text-brand"
                            : "border-border bg-white text-navy hover:border-brand/50",
                        )}
                      >
                        ₹{a.toLocaleString("en-IN")}
                      </button>
                    ))}
                  </div>
                  <input
                    type="number"
                    placeholder="Or enter custom amount"
                    value={custom}
                    onChange={(e) => setCustom(e.target.value)}
                    className="mt-3 w-full rounded-lg border border-border bg-white px-3 py-2.5 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/25"
                  />
                </div>
                <div className="rounded-lg bg-muted/60 px-3 py-2.5 text-xs text-muted-foreground">
                  Donating as <span className="font-medium text-navy">{donor.fullName}</span> (
                  {donor.email})
                </div>
                <button
                  type="submit"
                  disabled={submitting}
                  className="group inline-flex w-full items-center justify-center gap-2 rounded-xl grad-brand px-6 py-3.5 text-sm font-semibold text-white shadow-glow transition hover:scale-[1.02] disabled:opacity-60 disabled:hover:scale-100"
                >
                  {submitting
                    ? "Processing…"
                    : `Donate ${custom ? `₹${Number(custom).toLocaleString("en-IN")}` : `₹${amount.toLocaleString("en-IN")}`}`}
                  <Heart className="size-4" fill="currentColor" />
                </button>
              </form>
            )}
          </div>
          <aside className="rounded-2xl border border-border bg-white p-6 shadow-soft lg:col-span-2">
            <div className="text-sm font-semibold text-navy">Why donate to TZF?</div>
            <ul className="mt-4 space-y-3 text-[13.5px] text-muted-foreground">
              <li className="flex gap-2">
                <ShieldCheck className="size-4 text-brand" /> 100% transparent utilization
              </li>
              <li className="flex gap-2">
                <BadgeCheck className="size-4 text-brand" /> Verified beneficiaries only
              </li>
              <li className="flex gap-2">
                <ShieldCheck className="size-4 text-brand" /> 80G tax exemption receipt
              </li>
            </ul>
          </aside>
        </motion.div>
      </main>
      <Footer />
    </>
  );
}
