import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { ArrowLeft, Building2, Home as HomeIcon, Briefcase } from "lucide-react";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/partner")({
  head: () => ({
    meta: [
      { title: "Partner With Us — Tare Zameen Foundation" },
      { name: "description", content: "Housing societies, RWAs and corporates: adopt drives, track impact, and receive verified certificates." },
      { property: "og:title", content: "Partner With Tare Zameen Foundation" },
      { property: "og:description", content: "Society, RWA and corporate partnerships built on radical transparency." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PartnerPage,
});

const TABS = [
  { id: "society", label: "Housing Society", icon: HomeIcon },
  { id: "rwa", label: "RWA", icon: Building2 },
  { id: "corporate", label: "Corporate", icon: Briefcase },
] as const;

function PartnerPage() {
  const [tab, setTab] = useState<(typeof TABS)[number]["id"]>("society");
  const [form, setForm] = useState({ org: "", name: "", email: "", phone: "", message: "" });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.org || !form.email) return toast.error("Please fill in required fields.");
    toast.success("Thank you — our partnerships team will reach out within 24 hours.");
    setForm({ org: "", name: "", email: "", phone: "", message: "" });
  };

  return (
    <>
      <Navbar />
      <main className="mx-auto min-h-dvh max-w-[1000px] px-6 pb-20 pt-32 lg:px-10">
        <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-navy">
          <ArrowLeft className="size-4" /> Back to home
        </Link>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <p className="mt-6 text-[11px] font-semibold uppercase tracking-[0.28em] text-gold">Stronger Together</p>
          <h1 className="mt-2 font-display text-4xl font-semibold text-navy sm:text-5xl">
            Partner <span className="italic text-brand">with us.</span>
          </h1>
          <p className="mt-3 max-w-xl text-[15px] text-muted-foreground">
            Adopt drives, receive real-time impact tracking, and automated
            impact & CSR compliant reporting.
          </p>

          <div className="mt-8 inline-flex rounded-full border border-border bg-white p-1 shadow-soft">
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={cn(
                  "inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-all",
                  tab === t.id ? "grad-brand text-white shadow-glow" : "text-navy/70 hover:text-navy",
                )}
              >
                <t.icon className="size-4" /> {t.label}
              </button>
            ))}
          </div>

          <form onSubmit={submit} className="mt-6 grid gap-4 rounded-2xl border border-border bg-white p-6 shadow-soft sm:grid-cols-2">
            <input placeholder={`${TABS.find((t) => t.id === tab)?.label} name*`} value={form.org} onChange={(e) => setForm({ ...form, org: e.target.value })} className="rounded-lg border border-border px-3 py-2.5 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/25 sm:col-span-2" />
            <input placeholder="Contact name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="rounded-lg border border-border px-3 py-2.5 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/25" />
            <input placeholder="Email*" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="rounded-lg border border-border px-3 py-2.5 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/25" />
            <input placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="rounded-lg border border-border px-3 py-2.5 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/25 sm:col-span-2" />
            <textarea placeholder="Tell us about your partnership goals..." value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} rows={4} className="rounded-lg border border-border px-3 py-2.5 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/25 sm:col-span-2" />
            <button type="submit" className="grad-brand rounded-xl px-5 py-3 text-sm font-semibold text-white shadow-glow transition hover:scale-[1.02] sm:col-span-2">
              Submit Partnership Request
            </button>
          </form>
        </motion.div>
      </main>
      <Footer />
    </>
  );
}
