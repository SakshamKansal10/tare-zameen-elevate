import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { ArrowLeft, Sparkles, Mail, Lock } from "lucide-react";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Donor Portal — Tare Zameen Foundation" },
      { name: "description", content: "Sign in to your donor portal to track your impact in real-time." },
      { property: "og:title", content: "Donor Portal Login" },
      { property: "og:description", content: "Track your giving and impact." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const router = useRouter();

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !pw) return toast.error("Please enter your credentials.");
    toast.success(mode === "login" ? "Welcome back!" : "Account created!");
    setTimeout(() => router.navigate({ to: "/dashboard" }), 600);
  };

  return (
    <main className="relative grid min-h-dvh place-items-center bg-ambient px-6 py-16">
      <div className="pointer-events-none absolute -top-40 left-1/2 h-96 w-[80%] -translate-x-1/2 rounded-full bg-brand/10 blur-3xl" />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="glass w-full max-w-md rounded-3xl p-8 shadow-elegant"
      >
        <Link to="/" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-navy">
          <ArrowLeft className="size-3.5" /> Back
        </Link>
        <div className="mt-4 flex items-center gap-2">
          <Sparkles className="size-6 text-gold" />
          <span className="font-display text-sm font-bold tracking-[0.14em] text-navy">TARE ZAMEEN</span>
        </div>
        <h1 className="mt-6 font-display text-3xl font-semibold text-navy">
          {mode === "login" ? "Welcome back." : "Create your account."}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {mode === "login" ? "Sign in to your donor portal." : "Start tracking your impact today."}
        </p>

        <form onSubmit={submit} className="mt-6 space-y-3">
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded-lg border border-border bg-white/70 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/25" />
          </div>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input type="password" placeholder="Password" value={pw} onChange={(e) => setPw(e.target.value)} className="w-full rounded-lg border border-border bg-white/70 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/25" />
          </div>
          {mode === "login" && (
            <div className="text-right">
              <button type="button" onClick={() => toast.info("Password reset link sent (demo).")} className="text-xs font-medium text-brand hover:underline">
                Forgot password?
              </button>
            </div>
          )}
          <button type="submit" className="grad-brand w-full rounded-xl py-3 text-sm font-semibold text-white shadow-glow transition hover:scale-[1.02]">
            {mode === "login" ? "Sign in" : "Create account"}
          </button>
        </form>

        <div className="relative my-5 text-center">
          <div className="absolute inset-x-0 top-1/2 h-px bg-border" />
          <span className="relative bg-white/80 px-3 text-[11px] uppercase tracking-widest text-muted-foreground">Or</span>
        </div>
        <button
          type="button"
          onClick={() => toast.info("Google sign-in placeholder.")}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-white py-2.5 text-sm font-semibold text-navy transition hover:bg-accent"
        >
          <svg className="size-4" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>
          Continue with Google
        </button>

        <p className="mt-5 text-center text-xs text-muted-foreground">
          {mode === "login" ? "New here?" : "Have an account?"}{" "}
          <button onClick={() => setMode(mode === "login" ? "signup" : "login")} className="font-semibold text-brand hover:underline">
            {mode === "login" ? "Sign up" : "Sign in"}
          </button>
        </p>
      </motion.div>
    </main>
  );
}
