import { Link } from "@tanstack/react-router";
import {
  Facebook,
  Instagram,
  Linkedin,
  Twitter,
  Youtube,
  Sparkles,
  Mail,
  Phone,
  MapPin,
  Clock,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export function Footer() {
  const [email, setEmail] = useState("");

  const onSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!ok) {
      toast.error("Please enter a valid email address.");
      return;
    }
    toast.success("Thank you for subscribing to our impact updates.");
    setEmail("");
  };

  const notAvailable = (what: string) => () =>
    toast.info(`${what} isn't available yet — check back soon.`);

  const exploreLinks = [
    { label: "Impact", href: "/#impact" },
    { label: "Our Drives", href: "/#drives" },
    { label: "Stories", href: "/#stories" },
    { label: "Society & CSR", href: "/#csr" },
    { label: "About Us", href: "/#about" },
  ];
  const transparencyLinks = [
    { label: "Where Your Money Goes", href: "/#transparency" },
    { label: "How We Work", notice: "This section" },
    { label: "Audit Reports", notice: "Audit reports" },
    { label: "Impact Reports", notice: "Impact reports" },
    { label: "Policies", notice: "Our policies" },
  ];

  return (
    <footer id="about" className="grad-navy relative overflow-hidden text-white/85">
      <div className="pointer-events-none absolute -top-40 left-1/2 h-96 w-[80%] -translate-x-1/2 rounded-full bg-brand/10 blur-3xl" />
      <div className="relative mx-auto grid max-w-[1400px] gap-10 px-6 py-14 lg:grid-cols-6 lg:px-10 lg:py-16">
        {/* Brand */}
        <div className="lg:col-span-2">
          <div className="flex items-center gap-3">
            <Sparkles className="size-8 text-gold" strokeWidth={1.5} />
            <div className="leading-tight">
              <div className="font-display text-base font-bold tracking-[0.14em]">TARE ZAMEEN</div>
              <div className="text-[10px] font-medium tracking-[0.28em] text-white/60">
                FOUNDATION
              </div>
            </div>
          </div>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/70">
            A technology-enabled platform that connects donors, societies, corporates and NGOs to
            create meaningful impact.
          </p>
          <div className="mt-5 flex items-center gap-3">
            {[
              { Icon: Facebook, name: "Facebook" },
              { Icon: Instagram, name: "Instagram" },
              { Icon: Linkedin, name: "LinkedIn" },
              { Icon: Twitter, name: "Twitter" },
              { Icon: Youtube, name: "YouTube" },
            ].map(({ Icon, name }) => (
              <button
                key={name}
                type="button"
                onClick={notAvailable(`Our ${name} page`)}
                aria-label={`${name} (coming soon)`}
                className="grid size-9 place-items-center rounded-full border border-white/15 bg-white/5 text-white/80 transition-all duration-300 hover:rotate-[6deg] hover:border-brand-soft hover:bg-brand/20 hover:text-white"
              >
                <Icon className="size-4" />
              </button>
            ))}
          </div>
        </div>

        {/* Explore */}
        <div>
          <div className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-gold">
            Explore
          </div>
          <ul className="space-y-2 text-sm">
            {exploreLinks.map((l) => (
              <li key={l.label}>
                <a href={l.href} className="text-white/70 transition hover:text-white">
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Transparency */}
        <div>
          <div className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-gold">
            Transparency
          </div>
          <ul className="space-y-2 text-sm">
            {transparencyLinks.map((l) =>
              l.href ? (
                <li key={l.label}>
                  <a href={l.href} className="text-white/70 transition hover:text-white">
                    {l.label}
                  </a>
                </li>
              ) : (
                <li key={l.label}>
                  <button
                    type="button"
                    onClick={notAvailable(l.notice!)}
                    className="text-white/70 transition hover:text-white"
                  >
                    {l.label}
                  </button>
                </li>
              ),
            )}
          </ul>
        </div>

        {/* For Donors */}
        <div>
          <div className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-gold">
            For Donors
          </div>
          <ul className="space-y-2 text-sm">
            <li>
              <Link to="/login" className="text-white/70 transition hover:text-white">
                Donor Portal Login
              </Link>
            </li>
            <li>
              <Link to="/dashboard" className="text-white/70 transition hover:text-white">
                Track Your Impact
              </Link>
            </li>
            <li>
              <Link to="/donate" className="text-white/70 transition hover:text-white">
                Donate Now
              </Link>
            </li>
            <li>
              <button
                type="button"
                onClick={notAvailable("Recurring giving details")}
                className="text-white/70 transition hover:text-white"
              >
                Recurring Giving
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={notAvailable("Our volunteer program")}
                className="text-white/70 transition hover:text-white"
              >
                Volunteers
              </button>
            </li>
          </ul>
        </div>

        {/* Newsletter */}
        <div>
          <div className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-gold">
            Get Impact Updates
          </div>
          <p className="text-sm text-white/70">
            Subscribe for stories of change and real-time impact updates.
          </p>
          <form onSubmit={onSubscribe} className="mt-4 space-y-2">
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2.5 text-sm text-white outline-none placeholder:text-white/40 transition-all focus:border-brand-soft focus:bg-white/10 focus:shadow-[0_0_0_4px_rgba(34,197,94,0.15)]"
            />
            <button
              type="submit"
              className="w-full rounded-lg grad-brand py-2.5 text-sm font-semibold text-white transition-all hover:scale-[1.02] hover:shadow-glow"
            >
              Subscribe
            </button>
          </form>
        </div>

        {/* Contact strip */}
        <div className="lg:col-span-6">
          <div className="mt-4 grid gap-4 border-t border-white/10 pt-6 text-sm text-white/70 md:grid-cols-4">
            <div className="flex items-start gap-2">
              <MapPin className="mt-0.5 size-4 text-gold" />
              <span>
                123, Community Hub,
                <br />
                New Delhi, India — 110019
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="size-4 text-gold" /> +91 98765 43210
            </div>
            <div className="flex items-center gap-2">
              <Mail className="size-4 text-gold" /> info@tarezameenfoundation.org
            </div>
            <div className="flex items-center gap-2">
              <Clock className="size-4 text-gold" /> Mon – Sat, 10 AM – 6 PM
            </div>
          </div>
          <div className="mt-6 flex flex-col items-start justify-between gap-2 text-xs text-white/50 md:flex-row md:items-center">
            <div>© {new Date().getFullYear()} Tare Zameen Foundation. All rights reserved.</div>
            <div className="flex gap-4">
              <button
                type="button"
                onClick={notAvailable("Our privacy policy")}
                className="hover:text-white"
              >
                Privacy
              </button>
              <button
                type="button"
                onClick={notAvailable("Our terms of service")}
                className="hover:text-white"
              >
                Terms
              </button>
              <button
                type="button"
                onClick={notAvailable("Our 80G / 12A certificates")}
                className="hover:text-white"
              >
                80G / 12A
              </button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
