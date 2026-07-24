import { Link, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Heart, UserRound, Menu, X, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { label: "Home", to: "/", hash: "top" },
  { label: "Impact", to: "/", hash: "impact" },
  { label: "Drives", to: "/", hash: "drives" },
  { label: "Transparency", to: "/", hash: "transparency" },
  { label: "Stories", to: "/", hash: "stories" },
  { label: "Society & CSR", to: "/", hash: "csr" },
  { label: "About Us", to: "/", hash: "about" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState("top");
  const router = useRouter();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const ids = NAV.map((n) => n.hash);
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(e.target.id);
        });
      },
      { rootMargin: "-45% 0px -50% 0px", threshold: 0 },
    );
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) io.observe(el);
    });
    return () => io.disconnect();
  }, []);

  const goToSection = (hash: string) => {
    setOpen(false);
    if (router.state.location.pathname !== "/") {
      router.navigate({ to: "/", hash });
    } else {
      const el = document.getElementById(hash);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-500",
        scrolled ? "py-2" : "py-4",
      )}
    >
      <div className="mx-auto max-w-[1400px] px-4 lg:px-8">
        <div
          className={cn(
            "glass flex items-center justify-between rounded-2xl px-4 py-3 transition-all duration-500 lg:px-6",
            scrolled && "shadow-elegant",
          )}
        >
          {/* Logo */}
          <button
            onClick={() => goToSection("top")}
            className="group flex items-center gap-3"
            aria-label="Tare Zameen Foundation home"
          >
            <div
              className={cn(
                "relative flex items-center justify-center rounded-full transition-all duration-500",
                scrolled ? "size-9" : "size-10",
              )}
            >
              <Sparkles
                className="text-gold transition-transform duration-500 group-hover:rotate-45"
                strokeWidth={1.5}
                style={{ width: "100%", height: "100%" }}
              />
            </div>
            <div className="hidden text-left leading-tight sm:block">
              <div className="font-display text-[15px] font-bold tracking-[0.14em] text-navy">
                TARE ZAMEEN
              </div>
              <div className="text-[10px] font-medium tracking-[0.28em] text-muted-foreground">
                FOUNDATION
              </div>
              {!scrolled && (
                <div className="mt-0.5 text-[10px] italic text-muted-foreground">
                  Every star on earth deserves to shine.
                </div>
              )}
            </div>
          </button>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-1 lg:flex">
            {NAV.map((item) => (
              <button
                key={item.label}
                onClick={() => goToSection(item.hash)}
                className={cn(
                  "relative rounded-full px-3.5 py-2 text-[13.5px] font-medium text-navy/80 transition-colors hover:text-navy",
                  active === item.hash && "text-navy",
                )}
              >
                {item.label}
                <span
                  className={cn(
                    "absolute inset-x-3.5 -bottom-0.5 h-[2px] origin-left rounded-full bg-brand transition-transform duration-300",
                    active === item.hash ? "scale-x-100" : "scale-x-0",
                  )}
                />
              </button>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Link
              to="/login"
              className="hidden items-center gap-2 rounded-full border border-border bg-white/70 px-4 py-2 text-[13.5px] font-semibold text-navy transition-all hover:-translate-y-0.5 hover:shadow-soft sm:inline-flex"
            >
              <UserRound className="size-4" />
              Donor Portal
            </Link>
            <Link
              to="/donate"
              className="group inline-flex items-center gap-2 rounded-full grad-brand px-4 py-2 text-[13.5px] font-semibold text-white shadow-glow transition-all hover:scale-[1.03] hover:shadow-[0_15px_40px_-10px_oklch(0.72_0.19_149/0.65)]"
            >
              Donate Now
              <Heart className="size-4 transition-transform duration-300 group-hover:scale-110" fill="currentColor" />
            </Link>
            <button
              className="ml-1 inline-flex size-10 items-center justify-center rounded-full border border-border bg-white/60 lg:hidden"
              onClick={() => setOpen((o) => !o)}
              aria-label="Toggle navigation"
            >
              {open ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {open && (
          <div className="glass mt-2 rounded-2xl p-4 lg:hidden animate-fade-up">
            <div className="grid gap-1">
              {NAV.map((n) => (
                <button
                  key={n.label}
                  onClick={() => goToSection(n.hash)}
                  className="rounded-lg px-3 py-2.5 text-left text-sm font-medium text-navy hover:bg-accent"
                >
                  {n.label}
                </button>
              ))}
              <Link
                to="/login"
                onClick={() => setOpen(false)}
                className="mt-2 rounded-lg border border-border px-3 py-2.5 text-center text-sm font-semibold"
              >
                Donor Portal
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
