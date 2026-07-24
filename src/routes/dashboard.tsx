import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Heart, ShieldCheck, LineChart, LogOut } from "lucide-react";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Your Impact — Donor Dashboard | Tare Zameen Foundation" },
      { name: "description", content: "Track your donations, drives supported, and impact updates in one place." },
      { property: "og:title", content: "Donor Dashboard" },
      { property: "og:description", content: "Your impact, updated in real time." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const stats = [
    { icon: Heart, label: "Total Donated", value: "₹42,500" },
    { icon: ShieldCheck, label: "Drives Supported", value: "8" },
    { icon: LineChart, label: "Lives Reached", value: "246" },
  ];
  return (
    <>
      <Navbar />
      <main className="mx-auto min-h-dvh max-w-[1200px] px-6 pb-20 pt-32 lg:px-10">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-brand">Welcome back</p>
            <h1 className="mt-2 font-display text-4xl font-semibold text-navy">
              Your Impact. <span className="italic text-brand">In real time.</span>
            </h1>
          </div>
          <Link to="/" className="inline-flex items-center gap-1.5 rounded-full border border-border bg-white px-3 py-2 text-xs font-medium">
            <LogOut className="size-3.5" /> Sign out
          </Link>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {stats.map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1, duration: 0.6 }} className="rounded-2xl border border-border bg-white p-6 shadow-soft">
              <div className="grid size-10 place-items-center rounded-lg bg-brand/10 text-brand"><s.icon className="size-5" /></div>
              <div className="mt-4 text-xs font-medium text-muted-foreground">{s.label}</div>
              <div className="mt-1 font-display text-3xl font-bold text-navy">{s.value}</div>
            </motion.div>
          ))}
        </div>

        <div className="mt-8 rounded-2xl border border-border bg-white p-6 shadow-soft">
          <div className="text-sm font-semibold text-navy">Recent Contributions</div>
          <ul className="mt-4 divide-y divide-border">
            {[
              { d: "May 12, 2026", c: "Mid-Day Meal Support", a: "₹5,000" },
              { d: "Apr 03, 2026", c: "Medical Camp Sector 7", a: "₹10,000" },
              { d: "Feb 28, 2026", c: "School Kits Drive", a: "₹2,500" },
            ].map((r) => (
              <li key={r.d} className="flex items-center justify-between py-3 text-sm">
                <div>
                  <div className="font-medium text-navy">{r.c}</div>
                  <div className="text-xs text-muted-foreground">{r.d}</div>
                </div>
                <div className="font-semibold text-brand">{r.a}</div>
              </li>
            ))}
          </ul>
        </div>
      </main>
      <Footer />
    </>
  );
}
