import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { previewNotificationTemplate } from "@/functions/template-preview";
import {
  NOTIFICATION_CHANNELS,
  NOTIFICATION_TYPE_IDS,
  type NotificationChannel,
  type NotificationTypeId,
} from "@/lib/notification-types";

export const Route = createFileRoute("/dashboard/admin/templates")({
  beforeLoad: ({ context }) => {
    if (!context.donor.isStaff) throw redirect({ to: "/dashboard" });
  },
  loader: () =>
    previewNotificationTemplate({
      data: { notificationType: "DONATION_CONFIRMED", channel: "email" },
    }),
  head: () => ({ meta: [{ title: "Template Preview — Staff | Tare Zameen Foundation" }] }),
  component: TemplatePreviewPage,
});

function TemplatePreviewPage() {
  const initial = Route.useLoaderData();
  const previewFn = useServerFn(previewNotificationTemplate);
  const [notificationType, setNotificationType] =
    useState<NotificationTypeId>("DONATION_CONFIRMED");
  const [channel, setChannel] = useState<NotificationChannel>("email");
  const [preview, setPreview] = useState(initial);
  const [loading, setLoading] = useState(false);

  const load = async (type: NotificationTypeId, ch: NotificationChannel) => {
    setLoading(true);
    try {
      const result = await previewFn({ data: { notificationType: type, channel: ch } });
      setPreview(result);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="mx-auto min-h-dvh max-w-[900px] px-6 pb-20 pt-32 lg:px-10">
      <Link
        to="/dashboard"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-navy"
      >
        <ArrowLeft className="size-4" /> Back to dashboard
      </Link>

      <div className="mt-6">
        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-brand">Staff</p>
        <h1 className="mt-2 font-display text-3xl font-semibold text-navy sm:text-4xl">
          Template preview
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Rendered against sample donor data (Priya Sharma, ₹2,500, 13 August 2026) — never real
          donor data, never sent anywhere.
        </p>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <Select
          value={notificationType}
          onValueChange={(v) => {
            const t = v as NotificationTypeId;
            setNotificationType(t);
            load(t, channel);
          }}
        >
          <SelectTrigger className="w-[260px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {NOTIFICATION_TYPE_IDS.map((t) => (
              <SelectItem key={t} value={t}>
                {t}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={channel}
          onValueChange={(v) => {
            const c = v as NotificationChannel;
            setChannel(c);
            load(notificationType, c);
          }}
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {NOTIFICATION_CHANNELS.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className={loading ? "mt-6 opacity-50 transition-opacity" : "mt-6 transition-opacity"}>
        {preview.channel === "email" ? (
          <div className="rounded-2xl border border-border bg-white shadow-soft">
            <div className="border-b border-border px-5 py-3 text-sm">
              <span className="text-muted-foreground">Subject: </span>
              <span className="font-medium text-navy">{preview.subject}</span>
            </div>
            <iframe
              title="Email preview"
              srcDoc={preview.html}
              className="h-[640px] w-full rounded-b-2xl"
              sandbox=""
            />
          </div>
        ) : (
          <div className="max-w-sm rounded-2xl border border-border bg-[#DCF8C6] p-4 shadow-soft">
            <p className="whitespace-pre-wrap text-sm text-[#111b21]">{preview.text}</p>
          </div>
        )}
      </div>
    </main>
  );
}
