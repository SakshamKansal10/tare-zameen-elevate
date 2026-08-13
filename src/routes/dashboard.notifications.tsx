import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { motion } from "framer-motion";
import { useState } from "react";
import { toast } from "sonner";
import { ArrowLeft, Lock, Mail, MessageCircle, Phone } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import {
  getMyNotificationPreferences,
  updateMyNotificationPreference,
} from "@/functions/notifications";
import { getCurrentDonor, updateMyPhone } from "@/functions/auth";
import {
  NOTIFICATION_TYPES,
  type NotificationChannel,
  type NotificationTypeId,
} from "@/lib/notification-types";

export const Route = createFileRoute("/dashboard/notifications")({
  loader: async () => {
    const [preferences, donor] = await Promise.all([
      getMyNotificationPreferences(),
      getCurrentDonor(),
    ]);
    return { preferences, donor };
  },
  head: () => ({
    meta: [{ title: "Notification Preferences — Tare Zameen Foundation" }],
  }),
  component: NotificationPreferencesPage,
});

function NotificationPreferencesPage() {
  const initial = Route.useLoaderData();
  const updateFn = useServerFn(updateMyNotificationPreference);
  const updatePhoneFn = useServerFn(updateMyPhone);
  const [prefs, setPrefs] = useState(initial.preferences);
  const [phone, setPhone] = useState(initial.donor?.phone ?? "");
  const [savingPhone, setSavingPhone] = useState(false);
  const [pending, setPending] = useState<string | null>(null);

  const savePhone = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingPhone(true);
    try {
      const result = await updatePhoneFn({ data: { phone: phone.trim() } });
      setPhone(result.phone ?? "");
      toast.success(result.phone ? "WhatsApp number saved." : "WhatsApp number removed.");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Couldn't save your number. Please try again.",
      );
    } finally {
      setSavingPhone(false);
    }
  };

  const transactional = prefs.filter((p) => p.isTransactional);
  const optional = prefs.filter((p) => !p.isTransactional);

  const handleToggle = async (
    notificationType: NotificationTypeId,
    channel: NotificationChannel,
    enabled: boolean,
  ) => {
    const key = `${notificationType}:${channel}`;
    setPending(key);
    const previous = prefs;
    setPrefs((rows) =>
      rows.map((r) =>
        r.notificationType === notificationType
          ? { ...r, [channel === "email" ? "emailEnabled" : "whatsappEnabled"]: enabled }
          : r,
      ),
    );
    try {
      await updateFn({ data: { notificationType, channel, enabled } });
      toast.success("Notification preferences updated.");
    } catch (error) {
      setPrefs(previous);
      toast.error(
        error instanceof Error
          ? error.message
          : "Couldn't update your preference. Please try again.",
      );
    } finally {
      setPending(null);
    }
  };

  return (
    <main className="mx-auto min-h-dvh max-w-[820px] px-6 pb-20 pt-32 lg:px-10">
      <Link
        to="/dashboard"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-navy"
      >
        <ArrowLeft className="size-4" /> Back to dashboard
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mt-6"
      >
        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-brand">Settings</p>
        <h1 className="mt-2 font-display text-3xl font-semibold text-navy sm:text-4xl">
          Notification preferences
        </h1>
        <p className="mt-2 max-w-xl text-sm text-muted-foreground">
          Choose how Tare Zameen Foundation reaches you by email and WhatsApp. Transactional
          notifications about your own donations always stay on; everything else is entirely up to
          you.
        </p>

        <section className="mt-8 rounded-2xl border border-border bg-white p-6 shadow-soft">
          <div className="flex items-center gap-2 text-sm font-semibold text-navy">
            <Phone className="size-4 text-brand" /> WhatsApp number
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Required to receive any WhatsApp notification. Use international format, e.g.{" "}
            <span className="font-mono">+919876543210</span>.
          </p>
          <form onSubmit={savePhone} className="mt-3 flex flex-col gap-2 sm:flex-row">
            <input
              type="tel"
              inputMode="tel"
              placeholder="+919876543210"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              aria-label="WhatsApp number"
              className="flex-1 rounded-lg border border-border px-3 py-2.5 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/25"
            />
            <button
              type="submit"
              disabled={savingPhone}
              className="inline-flex items-center justify-center rounded-lg grad-brand px-4 py-2.5 text-sm font-semibold text-white shadow-glow transition hover:scale-[1.02] disabled:opacity-60 disabled:hover:scale-100"
            >
              {savingPhone ? "Saving…" : "Save"}
            </button>
          </form>
        </section>

        <section className="mt-6 rounded-2xl border border-border bg-white shadow-soft">
          <div className="border-b border-border px-6 py-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-navy">
              <Lock className="size-4 text-brand" /> Essential &middot; Transactional
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Transactional notifications help you receive important information about your
              donations and receipts. These can't be turned off.
            </p>
          </div>
          <ul className="divide-y divide-border">
            {transactional.map((p) => (
              <PreferenceRow
                key={p.notificationType}
                pref={p}
                locked
                pending={pending}
                onToggle={handleToggle}
              />
            ))}
          </ul>
        </section>

        <section className="mt-6 rounded-2xl border border-border bg-white shadow-soft">
          <div className="border-b border-border px-6 py-4">
            <div className="text-sm font-semibold text-navy">Optional &middot; Updates</div>
            <p className="mt-1 text-xs text-muted-foreground">
              Impact updates and reminders can be turned off at any time — this never affects your
              ability to donate or receive receipts.
            </p>
          </div>
          <ul className="divide-y divide-border">
            {optional.map((p) => (
              <PreferenceRow
                key={p.notificationType}
                pref={p}
                locked={false}
                pending={pending}
                onToggle={handleToggle}
              />
            ))}
          </ul>
        </section>
      </motion.div>
    </main>
  );
}

interface PreferenceRowProps {
  pref: { notificationType: NotificationTypeId; emailEnabled: boolean; whatsappEnabled: boolean };
  locked: boolean;
  pending: string | null;
  onToggle: (type: NotificationTypeId, channel: NotificationChannel, enabled: boolean) => void;
}

function PreferenceRow({ pref, locked, pending, onToggle }: PreferenceRowProps) {
  const meta = NOTIFICATION_TYPES[pref.notificationType];
  const emailKey = `${pref.notificationType}:email`;
  const whatsappKey = `${pref.notificationType}:whatsapp`;

  return (
    <li className="flex flex-col gap-3 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <div className="text-sm font-medium text-navy">{meta.name}</div>
        <div className="text-xs text-muted-foreground">{meta.description}</div>
      </div>
      <div className="flex items-center gap-5">
        {meta.channels.includes("email") && (
          <label
            className={cn(
              "flex items-center gap-2 text-xs font-medium",
              locked ? "text-muted-foreground" : "text-navy",
            )}
          >
            <Mail className="size-3.5" aria-hidden="true" />
            Email
            <Switch
              checked={pref.emailEnabled}
              disabled={locked || pending === emailKey}
              onCheckedChange={(checked) => onToggle(pref.notificationType, "email", checked)}
              aria-label={`${meta.name} — email ${locked ? "(always on)" : ""}`}
            />
          </label>
        )}
        {meta.channels.includes("whatsapp") && (
          <label
            className={cn(
              "flex items-center gap-2 text-xs font-medium",
              locked ? "text-muted-foreground" : "text-navy",
            )}
          >
            <MessageCircle className="size-3.5" aria-hidden="true" />
            WhatsApp
            <Switch
              checked={pref.whatsappEnabled}
              disabled={locked || pending === whatsappKey}
              onCheckedChange={(checked) => onToggle(pref.notificationType, "whatsapp", checked)}
              aria-label={`${meta.name} — WhatsApp ${locked ? "(always on)" : ""}`}
            />
          </label>
        )}
      </div>
    </li>
  );
}
