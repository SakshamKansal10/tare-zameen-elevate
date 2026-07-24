import { createFileRoute, Link, useParams, useSearch } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, MapPin } from "lucide-react";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";

type Search = { category?: string };

export const Route = createFileRoute("/campaigns/$id")({
  validateSearch: (s: Record<string, unknown>): Search => ({
    category: typeof s.category === "string" ? s.category : undefined,
  }),
  head: ({ params }) => ({
    meta: [
      { title: `Campaign ${params.id} — Tare Zameen Foundation` },
      { name: "description", content: "View verified community drive details, live progress, and pledge instantly." },
      { property: "og:title", content: `Support campaign ${params.id}` },
      { property: "og:description", content: "Real-time verified community drive." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CampaignPage,
});

function CampaignPage() {
  const { id } = useParams({ from: "/campaigns/$id" });
  const { category } = useSearch({ from: "/campaigns/$id" });

  return (
    <>
      <Navbar />
      <main className="mx-auto min-h-dvh max-w-[1000px] px-6 pb-20 pt-32 lg:px-10">
        <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-navy">
          <ArrowLeft className="size-4" /> Back to drives
        </Link>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="mt-6">
          {category && (
            <span className="inline-flex rounded-md bg-brand/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-brand">
              {category}
            </span>
          )}
          <h1 className="mt-3 font-display text-4xl font-semibold text-navy sm:text-5xl">
            Community Drive #{id}
          </h1>
          <div className="mt-2 flex items-center gap-1.5 text-sm text-muted-foreground">
            <MapPin className="size-4" /> Verified community · Real-time tracking
          </div>
          <p className="mt-6 max-w-2xl text-[15px] leading-relaxed text-muted-foreground">
            Every pledge is directly matched to a verified beneficiary. You'll
            receive real-time updates as the drive progresses, along with an
            80G-compliant tax receipt and impact certificate on completion.
          </p>

          <div className="mt-8 rounded-2xl border border-border bg-white p-6 shadow-soft">
            <div className="text-sm font-semibold text-navy">Pledge to this drive</div>
            <div className="mt-4 flex flex-col gap-3 sm:flex-row">
              <Link
                to="/donate"
                search={{ campaign: id, category }}
                className="group inline-flex items-center justify-center gap-2 rounded-xl grad-brand px-6 py-3 text-sm font-semibold text-white shadow-glow transition hover:scale-[1.02]"
              >
                Pledge Now
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                to="/partner"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-white px-6 py-3 text-sm font-semibold text-navy hover:bg-accent"
              >
                Adopt this drive as a society
              </Link>
            </div>
          </div>
        </motion.div>
      </main>
      <Footer />
    </>
  );
}
