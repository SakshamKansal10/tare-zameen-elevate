import { createFileRoute, Link } from "@tanstack/react-router";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import {
  ShieldCheck,
  Sparkles,
  BadgeCheck,
  Brain,
  Users,
  Home as HomeIcon,
  IndianRupee,
  Star,
  BookOpen,
  Utensils,
  HeartPulse,
  Laptop,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Lightbulb,
  Cog,
  Activity,
  Radio,
  CheckCircle2,
  Handshake,
  LineChart,
  FileBadge,
  FileText,
  Quote,
} from "lucide-react";

import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { useCountUp } from "@/lib/use-count-up";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

import heroGirl from "@/assets/hero-girl.jpg";
import pillarEdu from "@/assets/pillar-education.jpg";
import pillarNut from "@/assets/pillar-nutrition.jpg";
import pillarHc from "@/assets/pillar-healthcare.jpg";
import pillarDig from "@/assets/pillar-digital.jpg";
import csrIllus from "@/assets/csr-illustration.jpg";
import drive1 from "@/assets/drive-1.jpg";
import drive2 from "@/assets/drive-2.jpg";
import drive3 from "@/assets/drive-3.jpg";
import drive4 from "@/assets/drive-4.jpg";
import story1 from "@/assets/story-1.jpg";
import story2 from "@/assets/story-2.jpg";
import story3 from "@/assets/story-3.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Tare Zameen Foundation — Every star on earth deserves to shine" },
      {
        name: "description",
        content:
          "Radically transparent giving that connects donors, housing societies and corporates directly with verified communities. AI-powered need mapping, 98.8% transparency score.",
      },
      { property: "og:title", content: "Tare Zameen Foundation" },
      {
        property: "og:description",
        content: "Radically transparent giving. Verified beneficiaries. Real-time impact.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: HomePage,
});

/* ---------- Motion helpers ---------- */
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: i * 0.08 },
  }),
};

function Section({
  id,
  className,
  children,
}: {
  id?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <motion.section
      id={id}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.15 }}
      variants={{ show: { transition: { staggerChildren: 0.08 } } }}
      className={cn("relative", className)}
    >
      {children}
    </motion.section>
  );
}

/* ---------- HERO ---------- */
function Hero() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [0, 60]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0.4]);

  return (
    <section id="top" ref={ref} className="relative overflow-hidden pt-28 lg:pt-32">
      {/* Ambient background */}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-ambient" />
      <div className="pointer-events-none absolute -left-24 top-40 -z-10 hidden h-[560px] w-[560px] rounded-full bg-[radial-gradient(circle,oklch(0.22_0.05_265/0.18),transparent_60%)] blur-2xl md:block" />

      <div className="mx-auto grid max-w-[1400px] items-center gap-8 px-6 lg:grid-cols-12 lg:gap-6 lg:px-10">
        {/* Left content */}
        <motion.div
          style={{ y, opacity }}
          className="relative z-10 lg:col-span-6"
        >
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-[11px] font-semibold uppercase tracking-[0.28em] text-brand"
          >
            Empowering Communities. Transforming Lives.
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.1 }}
            className="mt-5 font-display text-[54px] font-semibold leading-[1.05] text-navy sm:text-6xl lg:text-[68px]"
          >
            Every star
            <br />
            on earth
            <br />
            deserves to <span className="italic text-brand story-underline">shine.</span>
            <span className="ml-2 inline-block text-gold">
              <Sparkles className="inline size-6" />
            </span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.25 }}
            className="mt-6 max-w-lg text-[15.5px] leading-relaxed text-muted-foreground"
          >
            We use technology and radical transparency to connect donors,
            housing societies, and corporations directly with verified
            communities for measurable impact.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.4 }}
            className="mt-8 flex flex-wrap items-center gap-3"
          >
            <Link
              to="/donate"
              className="group inline-flex items-center gap-2 rounded-xl grad-brand px-6 py-3.5 text-sm font-semibold text-white shadow-glow transition-all hover:scale-[1.03] hover:shadow-[0_20px_50px_-15px_oklch(0.72_0.19_149/0.7)]"
            >
              Donate Now
              <svg className="size-4 transition-transform group-hover:translate-x-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
            </Link>
            <Link
              to="/partner"
              className="group inline-flex items-center gap-2 rounded-xl border-2 border-brand bg-white px-6 py-3.5 text-sm font-semibold text-brand transition-all hover:bg-brand/[0.06] hover:shadow-soft"
            >
              Partner With Us
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </motion.div>

          {/* Trust badges */}
          <div className="mt-8 grid max-w-lg grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-4">
            {[
              { icon: ShieldCheck, l1: "100%", l2: "Transparent" },
              { icon: Brain, l1: "AI-Powered", l2: "Need Mapping" },
              { icon: BadgeCheck, l1: "Verified", l2: "Beneficiaries" },
              { icon: FileBadge, l1: "80G Tax", l2: "Exempt" },
            ].map((b, i) => (
              <motion.div
                key={b.l1}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 + i * 0.08, duration: 0.5 }}
                whileHover={{ y: -2 }}
                className="flex items-center gap-2"
              >
                <b.icon className="size-4 text-brand" />
                <div className="text-[11.5px] leading-tight">
                  <div className="font-semibold text-navy">{b.l1}</div>
                  <div className="text-muted-foreground">{b.l2}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Right image + floating stat cards */}
        <div className="relative lg:col-span-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
            className="relative mx-auto aspect-[7/8] w-full max-w-[560px] overflow-hidden rounded-[28px] shadow-elegant"
          >
            <div className="animate-float h-full w-full">
              <img
                src={heroGirl}
                alt="A young girl looking up hopefully at a sunrise over the Himalayas"
                width={1408}
                height={1600}
                className="h-full w-full object-cover"
                style={{ filter: "contrast(1.05) saturate(1.08)" }}
              />
            </div>
            {/* subtle cinematic vignette */}
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_80%_at_50%_10%,transparent_50%,rgba(15,23,42,0.28))]" />
          </motion.div>

          {/* Stat card: Lives Impacted */}
          <motion.div
            initial={{ opacity: 0, y: 20, x: 30 }}
            animate={{ opacity: 1, y: 0, x: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="glass absolute right-2 top-8 w-[220px] rounded-2xl p-4 sm:right-0"
          >
            <div className="text-[11px] font-medium text-muted-foreground">Lives Impacted</div>
            <div className="mt-1 font-display text-3xl font-bold text-navy">
              <HeroCount target={28450} suffix="+" />
            </div>
            <div className="mt-2 flex items-center">
              <div className="flex -space-x-2">
                {[story1, story3, story2].map((s, i) => (
                  <img key={i} src={s} alt="" width={512} height={512} loading="lazy" className="size-6 rounded-full border-2 border-white object-cover" />
                ))}
              </div>
              <div className="ml-2 text-[10.5px] text-muted-foreground">Across 3,245 communities</div>
            </div>
          </motion.div>

          {/* Stat card: Transparency */}
          <motion.div
            initial={{ opacity: 0, y: 20, x: 30 }}
            animate={{ opacity: 1, y: 0, x: 0 }}
            transition={{ delay: 0.7, duration: 0.8 }}
            className="glass absolute -bottom-4 right-2 w-[230px] rounded-2xl p-4 sm:right-0 sm:bottom-10"
          >
            <div className="text-[11px] font-medium text-muted-foreground">Transparency Score</div>
            <div className="mt-1 font-display text-3xl font-bold text-navy">
              <HeroCount target={98.8} decimals={1} suffix="%" />
            </div>
            <MiniSpark />
            <div className="mt-1 text-[10.5px] text-muted-foreground">Updated in real-time</div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function HeroCount({ target, suffix = "", decimals = 0 }: { target: number; suffix?: string; decimals?: number }) {
  const { ref, formatted } = useCountUp(target, 2000, decimals);
  return <span ref={ref}>{formatted}{suffix}</span>;
}

function MiniSpark() {
  return (
    <svg viewBox="0 0 100 28" className="mt-2 h-6 w-full">
      <defs>
        <linearGradient id="sg" x1="0" x2="1">
          <stop offset="0" stopColor="oklch(0.52 0.16 149)" />
          <stop offset="1" stopColor="oklch(0.72 0.19 149)" />
        </linearGradient>
      </defs>
      <motion.path
        initial={{ pathLength: 0 }}
        whileInView={{ pathLength: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.8, ease: "easeOut" }}
        d="M2 22 L14 18 L26 20 L38 14 L50 15 L62 10 L74 12 L86 6 L98 4"
        stroke="url(#sg)"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  );
}

/* ---------- STATS BAR ---------- */
function StatsBar() {
  const stats = [
    { icon: Users, target: 28450, suffix: "+", label: "Lives Impacted" },
    { icon: HomeIcon, target: 162, suffix: "", label: "Active Housing Societies" },
    { icon: IndianRupee, target: 5.2, suffix: " Cr+", decimals: 1, label: "Community Support Mobilised" },
    { icon: ShieldCheck, target: 98.8, suffix: "%", decimals: 1, label: "Transparency Score" },
    { icon: Star, target: 4.9, suffix: "/5", decimals: 1, label: "Donor Satisfaction" },
  ] as const;

  return (
    <div className="relative z-20 mx-auto -mt-6 max-w-[1300px] px-6 sm:-mt-16 lg:px-10">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="grid grid-cols-2 gap-4 rounded-3xl bg-white p-6 shadow-elegant sm:grid-cols-3 lg:grid-cols-5 lg:p-8"
      >
        {stats.map((s, i) => (
          <StatItem key={s.label} {...s} delay={i * 0.1} />
        ))}
      </motion.div>
    </div>
  );
}

function StatItem({ icon: Icon, target, suffix, decimals = 0, label, delay }: any) {
  const { ref, formatted } = useCountUp(target, 2000, decimals);
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay }}
      className="group flex flex-col items-center text-center"
    >
      <div className="grid size-11 place-items-center rounded-full bg-brand/8 text-brand transition-transform duration-500 group-hover:-translate-y-1 group-hover:rotate-[6deg]">
        <Icon className="size-5" />
      </div>
      <div ref={ref} className="mt-3 font-display text-3xl font-bold text-navy">
        {label.includes("Community") ? "₹" : ""}
        {formatted}
        {suffix}
      </div>
      <div className="mt-1 text-[12px] leading-tight text-muted-foreground">{label}</div>
    </motion.div>
  );
}

/* ---------- CHALLENGE / SOLUTION ---------- */
function Solution() {
  const challenge = [
    { icon: AlertCircle, t: "Needs remain unidentified or unverified." },
    { icon: Cog, t: "Donors don't know where their money goes." },
    { icon: Activity, t: "No real-time tracking of impact or utilization." },
    { icon: Users, t: "Silos between communities, NGOs & donors." },
  ];
  const solution = [
    { icon: Brain, t: "AI-enabled need identification & verification." },
    { icon: Handshake, t: "Direct donor-to-beneficiary transparency." },
    { icon: Radio, t: "Real-time tracking of drives & fund utilization." },
    { icon: Sparkles, t: "One platform connecting communities, NGOs & donors." },
  ];

  return (
    <Section id="impact" className="mx-auto mt-16 max-w-[1300px] px-6 lg:mt-24 lg:px-10">
      <div className="grid gap-5 lg:grid-cols-3">
        {/* Challenge */}
        <motion.div variants={fadeUp} className="rounded-2xl border border-border bg-white p-6 shadow-soft">
          <div className="flex items-center gap-2">
            <AlertCircle className="size-5 text-navy" />
            <h3 className="font-display text-xl font-semibold text-navy">The Challenge</h3>
          </div>
          <ul className="mt-5 space-y-4">
            {challenge.map((c) => (
              <li key={c.t} className="flex items-start gap-3">
                <div className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-lg bg-muted text-navy/70">
                  <c.icon className="size-4" />
                </div>
                <span className="text-[13.5px] leading-relaxed text-muted-foreground">{c.t}</span>
              </li>
            ))}
          </ul>
        </motion.div>

        {/* Solution (dark navy) */}
        <motion.div variants={fadeUp} className="grad-navy relative overflow-hidden rounded-2xl p-6 text-white shadow-elegant">
          <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-brand-soft/25 blur-3xl" />
          <div className="flex items-center gap-2">
            <Lightbulb className="size-5 text-brand-glow" />
            <h3 className="font-display text-xl font-semibold">Our Solution</h3>
          </div>
          <ul className="relative mt-5 space-y-4">
            {solution.map((c, i) => (
              <motion.li
                key={c.t}
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 + i * 0.08, duration: 0.5 }}
                className="flex items-start gap-3"
              >
                <div className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-lg bg-white/10 text-brand-glow">
                  <c.icon className="size-4" />
                </div>
                <span className="text-[13.5px] leading-relaxed text-white/85">{c.t}</span>
              </motion.li>
            ))}
          </ul>
        </motion.div>

        {/* Transparency */}
        <motion.div variants={fadeUp} className="rounded-2xl border border-border bg-white p-6 shadow-soft">
          <div className="flex items-center gap-2">
            <ShieldCheck className="size-5 text-brand" />
            <h3 className="font-display text-xl font-semibold text-navy">Independently Audited.<br/>Radically Transparent.</h3>
          </div>
          <p className="mt-5 text-[13.5px] leading-relaxed text-muted-foreground">
            Every need, every rupee, every impact is documented, verified and
            available for our donors in real-time.
          </p>
          <a href="#transparency" className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-brand story-underline">
            Explore Our Transparency <ArrowRight className="size-4" />
          </a>
        </motion.div>
      </div>
    </Section>
  );
}

/* ---------- IMPACT PILLARS ---------- */
function Pillars() {
  const pillars = [
    { icon: BookOpen, tint: "bg-brand", title: "Education", body: "Quality education and learning resources for every child.", img: pillarEdu, link: "Explore Education" },
    { icon: Utensils, tint: "bg-brand", title: "Nutrition", body: "Nutritious meals and awareness programs to end hunger and malnutrition.", img: pillarNut, link: "Explore Nutrition" },
    { icon: HeartPulse, tint: "bg-sky-500", title: "Healthcare", body: "Accessible healthcare and wellness for stronger communities.", img: pillarHc, link: "Explore Healthcare" },
    { icon: Laptop, tint: "bg-violet-600", title: "Digital Access", body: "Bridging the digital divide with devices and internet access for all.", img: pillarDig, link: "Explore Digital Access" },
  ];

  return (
    <Section className="mx-auto mt-20 max-w-[1300px] px-6 lg:mt-28 lg:px-10">
      <div className="text-center">
        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-brand">Our Impact Pillars</p>
        <h2 className="mt-3 font-display text-4xl font-semibold text-navy sm:text-5xl">
          Focused Areas. <span className="italic text-brand">Lasting Change.</span>
        </h2>
      </div>
      <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {pillars.map((p, i) => (
          <motion.a
            key={p.title}
            href="#"
            variants={fadeUp}
            custom={i}
            whileHover={{ y: -8 }}
            transition={{ type: "spring", stiffness: 260, damping: 22 }}
            className="group relative overflow-hidden rounded-2xl border border-border bg-white shadow-soft transition-shadow hover:shadow-elegant"
          >
            <div className="relative aspect-[4/3] overflow-hidden">
              <img
                src={p.img}
                alt={p.title}
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.06]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/0 to-transparent" />
              <div className={cn("absolute left-4 top-4 grid size-10 place-items-center rounded-xl text-white shadow-glow transition-transform duration-500 group-hover:rotate-[6deg]", p.tint)}>
                <p.icon className="size-5" />
              </div>
            </div>
            <div className="p-5">
              <h3 className="font-display text-xl font-semibold text-navy transition-colors group-hover:text-brand">{p.title}</h3>
              <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">{p.body}</p>
              <span className="mt-4 inline-flex items-center gap-1.5 text-[13px] font-semibold text-brand">
                <span className="story-underline">{p.link}</span>
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
              </span>
            </div>
          </motion.a>
        ))}
      </div>
    </Section>
  );
}

/* ---------- LIVE COMMUNITY NEEDS (Drives carousel) ---------- */
type Drive = {
  id: string;
  category: string;
  tint: string;
  title: string;
  location: string;
  date?: string;
  pledgedPct: number;
  pledgedText: string;
  img: string;
};

const DRIVES: Drive[] = [
  { id: "d1", category: "Education", tint: "bg-brand", title: "School Kits for 50 Children", location: "Sector 4, Community Center", pledgedPct: 65, pledgedText: "33/50 Pledged", img: drive1 },
  { id: "d2", category: "Healthcare", tint: "bg-sky-500", title: "Medical Camp in Sector 7", location: "10th June · 500 Beneficiaries", pledgedPct: 42, pledgedText: "21/50 Pledged", img: drive2 },
  { id: "d3", category: "Nutrition", tint: "bg-brand", title: "Mid-Day Meal Support for 120 Children", location: "Government School, Block D", pledgedPct: 78, pledgedText: "78/120 Pledged", img: drive3 },
  { id: "d4", category: "Education", tint: "bg-violet-600", title: "Digital Learning Devices for 25 Students", location: "Underprivileged Students", pledgedPct: 48, pledgedText: "12/25 Pledged", img: drive4 },
];

function Drives() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const track = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => setIndex((i) => (i + 1) % DRIVES.length), 6000);
    return () => clearInterval(t);
  }, [paused]);

  const scrollTo = (i: number) => {
    setIndex(i);
    const el = track.current?.children[i] as HTMLElement | undefined;
    el?.scrollIntoView({ behavior: "smooth", inline: "start", block: "nearest" });
  };

  return (
    <Section id="drives" className="mt-20 lg:mt-28">
      <div className="relative overflow-hidden bg-navy py-14 lg:py-16" style={{ background: "linear-gradient(135deg, oklch(0.18 0.05 265), oklch(0.24 0.06 265))" }}>
        <div className="pointer-events-none absolute -left-20 top-10 h-72 w-72 rounded-full bg-brand-soft/12 blur-3xl" />
        <div className="pointer-events-none absolute -right-16 bottom-0 h-72 w-72 rounded-full bg-sky-400/10 blur-3xl" />

        <div className="mx-auto max-w-[1300px] px-6 lg:px-10">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-brand-glow">Live Community Needs</p>
              <h2 className="mt-2 flex items-center gap-3 font-display text-3xl font-semibold text-white sm:text-4xl">
                Real Needs. <span className="italic">Real-Time.</span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-brand/25 px-2.5 py-1 text-[11px] font-semibold text-brand-glow">
                  <span className="relative flex size-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-soft opacity-75" />
                    <span className="relative inline-flex size-2 rounded-full bg-brand-soft" />
                  </span>
                  Live
                </span>
              </h2>
            </div>
            <a href="#" className="text-sm font-semibold text-white/85 hover:text-white">
              View All Active Drives <ArrowRight className="ml-1 inline size-4" />
            </a>
          </div>

          <div className="relative mt-8" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
            <button
              onClick={() => scrollTo((index - 1 + DRIVES.length) % DRIVES.length)}
              aria-label="Previous"
              className="absolute -left-2 top-1/2 z-10 hidden -translate-y-1/2 rounded-full border border-white/15 bg-white/10 p-2.5 text-white backdrop-blur-md transition hover:bg-white/20 lg:block"
            >
              <ChevronLeft className="size-5" />
            </button>
            <button
              onClick={() => scrollTo((index + 1) % DRIVES.length)}
              aria-label="Next"
              className="absolute -right-2 top-1/2 z-10 hidden -translate-y-1/2 rounded-full border border-white/15 bg-white/10 p-2.5 text-white backdrop-blur-md transition hover:bg-white/20 lg:block"
            >
              <ChevronRight className="size-5" />
            </button>

            <div
              ref={track}
              className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
              {DRIVES.map((d, i) => (
                <DriveCard key={d.id} drive={d} active={i === index} />
              ))}
            </div>
          </div>

          <div className="mt-5 flex justify-center gap-2">
            {DRIVES.map((_, i) => (
              <button
                key={i}
                onClick={() => scrollTo(i)}
                aria-label={`Go to slide ${i + 1}`}
                className={cn("h-1.5 rounded-full transition-all", i === index ? "w-8 bg-brand-soft" : "w-3 bg-white/25 hover:bg-white/40")}
              />
            ))}
          </div>
        </div>
      </div>
    </Section>
  );
}

function DriveCard({ drive, active }: { drive: Drive; active: boolean }) {
  const [progress, setProgress] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    const io = new IntersectionObserver(
      (es) => {
        es.forEach((e) => {
          if (e.isIntersecting) {
            setTimeout(() => setProgress(drive.pledgedPct), 200);
          }
        });
      },
      { threshold: 0.4 },
    );
    io.observe(ref.current);
    return () => io.disconnect();
  }, [drive.pledgedPct]);

  return (
    <motion.div
      ref={ref}
      whileHover={{ y: -6 }}
      className={cn(
        "group relative min-w-[280px] max-w-[300px] shrink-0 snap-start overflow-hidden rounded-2xl border border-white/10 bg-white/[0.06] backdrop-blur-md transition-all",
        active && "ring-2 ring-brand-soft/40",
      )}
    >
      <div className="relative aspect-[16/10] overflow-hidden">
        <img src={drive.img} alt={drive.title} loading="lazy" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.05]" />
        <span className={cn("absolute left-3 top-3 rounded-md px-2 py-0.5 text-[10.5px] font-semibold text-white shadow-glow", drive.tint)}>
          {drive.category}
        </span>
      </div>
      <div className="p-4">
        <h3 className="font-display text-[17px] font-semibold leading-snug text-white">{drive.title}</h3>
        <p className="mt-1 text-[12px] text-white/60">{drive.location}</p>

        <div className="mt-4 flex items-center justify-between text-[11.5px] font-medium">
          <span className="text-brand-glow">{drive.pledgedPct}%</span>
          <span className="text-white/70">{drive.pledgedText}</span>
        </div>
        <div className="relative mt-1.5 h-2 overflow-hidden rounded-full bg-white/10">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 1.4, ease: "easeOut" }}
            className="relative h-full grad-brand"
          >
            <span className="absolute inset-y-0 left-0 w-1/3 -skew-x-12 bg-white/25 blur-sm animate-shimmer" />
          </motion.div>
        </div>

        <Link
          to="/campaigns/$id"
          params={{ id: drive.id }}
          search={{ category: drive.category }}
          className="group mt-4 flex items-center justify-between rounded-lg grad-brand px-3 py-2 text-[12.5px] font-semibold text-white transition-all hover:shadow-glow"
        >
          Pledge Now
          <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>
    </motion.div>
  );
}

/* ---------- CSR SECTION ---------- */
function CSR() {
  const items = [
    { icon: Handshake, title: "Adopt a Drive", body: "Choose a cause and community to support." },
    { icon: LineChart, title: "Track Impact", body: "Real-time tracking with complete transparency." },
    { icon: FileBadge, title: "Impact Certificates", body: "Automated society impact certificates and reports." },
    { icon: FileText, title: "CSR Reports", body: "End-to-end CSR compliant reports for your records." },
  ];
  return (
    <Section id="csr" className="mx-auto mt-20 max-w-[1300px] px-6 lg:mt-28 lg:px-10">
      <div className="grid items-center gap-10 lg:grid-cols-12">
        <motion.div variants={fadeUp} className="lg:col-span-5">
          <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-brand/8 via-sky-100/50 to-white p-4 shadow-soft">
            <motion.img
              src={csrIllus}
              alt="Families and communities coming together"
              loading="lazy"
              className="w-full rounded-2xl"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.6 }}
            />
          </div>
        </motion.div>
        <motion.div variants={fadeUp} className="lg:col-span-7">
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-gold">Stronger Together</p>
          <h2 className="mt-2 font-display text-3xl font-semibold text-navy sm:text-4xl">
            Create Greater Impact <br /> With Your Community
          </h2>
          <p className="mt-3 max-w-lg text-[14.5px] leading-relaxed text-muted-foreground">
            Housing societies, RWAs & Corporates can adopt drives, track
            impact in real-time and receive verified impact certificates
            automatically.
          </p>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {items.map((it, i) => (
              <motion.div
                key={it.title}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.5 }}
                whileHover={{ y: -3 }}
                className="flex gap-3 rounded-xl border border-border bg-white p-4 shadow-soft transition-shadow hover:shadow-elegant"
              >
                <div className="grid size-10 shrink-0 place-items-center rounded-lg bg-brand/10 text-brand transition-transform duration-500 group-hover:rotate-[6deg]">
                  <it.icon className="size-5" />
                </div>
                <div>
                  <div className="font-semibold text-navy">{it.title}</div>
                  <div className="mt-0.5 text-[12.5px] text-muted-foreground">{it.body}</div>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="mt-7 flex flex-wrap gap-3">
            <Link
              to="/partner"
              className="group inline-flex items-center gap-2 rounded-xl grad-brand px-5 py-3 text-sm font-semibold text-white shadow-glow transition hover:scale-[1.03]"
            >
              Explore CSR Partnerships
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <a
              href="#"
              className="inline-flex items-center gap-2 rounded-xl border border-border bg-white px-5 py-3 text-sm font-semibold text-navy hover:bg-accent"
            >
              Book a Consultation <ArrowRight className="size-4" />
            </a>
          </div>
        </motion.div>
      </div>
    </Section>
  );
}

/* ---------- TRANSPARENCY ---------- */
function Transparency() {
  const dist = [
    { label: "Programs & Projects", pct: 72, color: "oklch(0.52 0.16 149)" },
    { label: "Community Support", pct: 15, color: "oklch(0.72 0.19 149)" },
    { label: "Operations", pct: 7, color: "oklch(0.72 0.11 78)" },
    { label: "Compliance & Audit", pct: 6, color: "oklch(0.30 0.06 265)" },
  ];
  const compliance = [
    "80G Tax Exemption",
    "12A Registration",
    "FCRA Registration",
    "CSR Registration (Section 135)",
  ];

  return (
    <Section id="transparency" className="mx-auto mt-20 max-w-[1300px] px-6 lg:mt-28 lg:px-10">
      <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-brand">Radical Transparency</p>
      <h2 className="mt-2 font-display text-3xl font-semibold text-navy sm:text-4xl">
        Because Trust is Our <span className="italic text-brand">Foundation</span>.
      </h2>

      <div className="mt-8 grid gap-5 lg:grid-cols-4">
        {/* Pie */}
        <motion.div variants={fadeUp} className="rounded-2xl border border-border bg-white p-5 shadow-soft">
          <div className="text-[12px] font-semibold text-muted-foreground">Where Your Money Goes</div>
          <div className="mt-3 flex items-center gap-4">
            <Donut segments={dist} />
            <ul className="space-y-1.5 text-[12px]">
              {dist.map((d) => (
                <li key={d.label} className="flex items-center gap-2">
                  <span className="size-2.5 rounded-sm" style={{ background: d.color }} />
                  <span className="text-navy/80">{d.label}</span>
                  <span className="ml-auto font-semibold text-navy">{d.pct}%</span>
                </li>
              ))}
            </ul>
          </div>
          <a href="#" className="mt-3 inline-flex items-center gap-1 text-[12.5px] font-semibold text-brand story-underline">
            View Detailed Breakdown <ArrowRight className="size-3.5" />
          </a>
        </motion.div>

        {/* Compliance */}
        <motion.div variants={fadeUp} className="rounded-2xl border border-border bg-white p-5 shadow-soft">
          <div className="text-[12px] font-semibold text-muted-foreground">Compliance & Registrations</div>
          <ul className="mt-3 space-y-2.5">
            {compliance.map((c) => (
              <li key={c} className="flex items-center justify-between text-[13px]">
                <span className="text-navy">{c}</span>
                <CheckCircle2 className="size-4 text-brand" />
              </li>
            ))}
          </ul>
          <a href="#" className="mt-3 inline-flex items-center gap-1 text-[12.5px] font-semibold text-brand story-underline">
            View All Certificates <ArrowRight className="size-3.5" />
          </a>
        </motion.div>

        {/* Audit */}
        <motion.div variants={fadeUp} whileHover={{ y: -5 }} className="rounded-2xl border border-border bg-white p-5 shadow-soft transition-shadow hover:shadow-elegant">
          <div className="text-[12px] font-semibold text-muted-foreground">Audit Reports</div>
          <div className="mt-3 flex items-start gap-3">
            <div className="grid size-12 shrink-0 place-items-center rounded-xl bg-brand/10 text-brand">
              <FileText className="size-6" />
            </div>
            <p className="text-[12.5px] leading-relaxed text-muted-foreground">
              We are audited annually by independent chartered accountants.
            </p>
          </div>
          <a href="#" onClick={(e) => { e.preventDefault(); window.open("about:blank"); }} className="mt-4 inline-flex items-center gap-1 text-[12.5px] font-semibold text-brand story-underline">
            View Latest Audit Report <ArrowRight className="size-3.5" />
          </a>
        </motion.div>

        {/* Annual Report */}
        <motion.div variants={fadeUp} whileHover={{ y: -5 }} className="rounded-2xl border border-border bg-white p-5 shadow-soft transition-shadow hover:shadow-elegant">
          <div className="text-[12px] font-semibold text-muted-foreground">Annual Impact Report</div>
          <div className="mt-3 flex items-center gap-3">
            <div className="relative">
              <div className="h-16 w-12 rotate-[-4deg] rounded-sm grad-navy shadow-elegant" />
              <div className="absolute right-2 top-2 h-16 w-12 rotate-[6deg] rounded-sm bg-white shadow-soft">
                <div className="mt-2 border-y border-border py-0.5 text-center text-[6px] font-bold text-navy">
                  IMPACT<br/>REPORT
                </div>
              </div>
            </div>
            <div className="text-[12.5px] text-muted-foreground">Read our full 2023–24 report.</div>
          </div>
          <a href="#" className="mt-4 inline-flex items-center gap-1 text-[12.5px] font-semibold text-brand story-underline">
            View Full Report <ArrowRight className="size-3.5" />
          </a>
        </motion.div>
      </div>
    </Section>
  );
}

function Donut({ segments }: { segments: { label: string; pct: number; color: string }[] }) {
  const [hover, setHover] = useState<number | null>(null);
  const R = 34;
  const C = 2 * Math.PI * R;
  let offset = 0;
  return (
    <div className="relative">
      <svg viewBox="0 0 100 100" className="size-32 -rotate-90">
        <circle cx="50" cy="50" r={R} strokeWidth="16" stroke="oklch(0.94 0.008 265)" fill="none" />
        {segments.map((s, i) => {
          const len = (s.pct / 100) * C;
          const dash = `${len} ${C - len}`;
          const el = (
            <motion.circle
              key={s.label}
              cx="50" cy="50" r={R}
              fill="none"
              stroke={s.color}
              strokeWidth="16"
              initial={{ strokeDasharray: `0 ${C}` }}
              whileInView={{ strokeDasharray: dash }}
              viewport={{ once: true }}
              transition={{ duration: 1.2, ease: "easeOut", delay: i * 0.1 }}
              strokeDashoffset={-offset}
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(null)}
              style={{ cursor: "pointer" }}
            />
          );
          offset += len;
          return el;
        })}
      </svg>
      <div className="pointer-events-none absolute inset-0 grid place-items-center">
        <div className="text-center">
          <div className="font-display text-lg font-bold text-navy">
            {hover !== null ? `${segments[hover].pct}%` : "100%"}
          </div>
          <div className="text-[9px] text-muted-foreground">
            {hover !== null ? segments[hover].label : "Allocated"}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- STORIES ---------- */
function Stories() {
  const stories = [
    { name: "Ananya", role: "Class 10 Student", img: story3, q: "The scholarship I received didn't just help me with fees, it gave me the confidence to dream bigger." },
    { name: "RWA Coordinator", role: "Sector 9", img: story1, q: "Our society's health camp helped over 300 families. Transparency made the whole journey seamless." },
    { name: "Rohit", role: "Donor, Bangalore", img: story2, q: "Knowing exactly where my contribution goes makes all the difference." },
  ];
  const [i, setI] = useState(0);
  return (
    <Section id="stories" className="mx-auto mt-20 max-w-[1300px] px-6 lg:mt-24 lg:px-10">
      <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-gold">Stories of Change</p>
      <div className="flex items-end justify-between">
        <h2 className="mt-2 font-display text-3xl font-semibold text-navy sm:text-4xl">
          Real Stories. <span className="italic text-brand">Real Impact.</span>
        </h2>
        <div className="hidden gap-2 lg:flex">
          <button onClick={() => setI((v) => (v - 1 + stories.length) % stories.length)} aria-label="Previous story" className="rounded-full border border-border bg-white p-2 hover:bg-accent">
            <ChevronLeft className="size-4" />
          </button>
          <button onClick={() => setI((v) => (v + 1) % stories.length)} aria-label="Next story" className="rounded-full border border-border bg-white p-2 hover:bg-accent">
            <ChevronRight className="size-4" />
          </button>
        </div>
      </div>

      <div className="mt-8 grid gap-5 md:grid-cols-3">
        {stories.map((s, idx) => (
          <motion.figure
            key={s.name}
            variants={fadeUp}
            custom={idx}
            whileHover={{ y: -4 }}
            className={cn(
              "relative rounded-2xl border border-border bg-white p-5 shadow-soft transition-shadow hover:shadow-elegant",
              idx === i && "ring-2 ring-brand/25",
            )}
          >
            <Quote className="absolute right-4 top-4 size-6 text-brand/20" />
            <blockquote className="text-[14px] leading-relaxed text-navy/85">"{s.q}"</blockquote>
            <figcaption className="mt-5 flex items-center gap-3">
              <img src={s.img} alt={s.name} loading="lazy" width={512} height={512} className="size-11 rounded-full object-cover" />
              <div>
                <div className="text-sm font-semibold text-navy">— {s.name}</div>
                <div className="text-[11.5px] text-muted-foreground">{s.role}</div>
              </div>
            </figcaption>
          </motion.figure>
        ))}
      </div>
    </Section>
  );
}

/* ---------- MAIN PAGE ---------- */
function HomePage() {
  return (
    <>
      <Navbar />
      <main className="relative overflow-hidden pb-20">
        <Hero />
        <StatsBar />
        <Solution />
        <Pillars />
        <Drives />
        <CSR />
        <Transparency />
        <Stories />
      </main>
      <Footer />
    </>
  );
}
