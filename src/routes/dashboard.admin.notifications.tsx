import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { ArrowLeft, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatIndianDateTime } from "@/lib/format";
import { getStaffNotificationLogs } from "@/functions/notifications";
import {
  NOTIFICATION_CHANNELS,
  NOTIFICATION_STATUSES,
  NOTIFICATION_TYPE_IDS,
  type NotificationChannel,
  type NotificationStatus,
  type NotificationTypeId,
} from "@/lib/notification-types";

interface LogFilterState {
  notificationType?: NotificationTypeId;
  channel?: NotificationChannel;
  status?: NotificationStatus;
}

export const Route = createFileRoute("/dashboard/admin/notifications")({
  beforeLoad: ({ context }) => {
    if (!context.donor.isStaff) throw redirect({ to: "/dashboard" });
  },
  loader: () => getStaffNotificationLogs({ data: {} }),
  head: () => ({ meta: [{ title: "Notification Log — Staff | Tare Zameen Foundation" }] }),
  component: AdminNotificationLogPage,
});

const STATUS_TONE: Record<string, string> = {
  SENT: "bg-brand/10 text-brand",
  DELIVERED: "bg-brand/10 text-brand",
  QUEUED: "bg-amber-100 text-amber-700",
  SKIPPED: "bg-muted text-muted-foreground",
  FAILED: "bg-destructive/10 text-destructive",
};

function AdminNotificationLogPage() {
  const initial = Route.useLoaderData();
  const getLogsFn = useServerFn(getStaffNotificationLogs);
  const [logs, setLogs] = useState(initial);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<LogFilterState>({});

  const applyFilters = async (next: LogFilterState) => {
    setFilters(next);
    setLoading(true);
    try {
      const data = await getLogsFn({ data: next });
      setLogs(data);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="mx-auto min-h-dvh max-w-[1200px] px-6 pb-20 pt-32 lg:px-10">
      <Link
        to="/dashboard"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-navy"
      >
        <ArrowLeft className="size-4" /> Back to dashboard
      </Link>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-brand">Staff</p>
          <h1 className="mt-2 font-display text-3xl font-semibold text-navy sm:text-4xl">
            Notification log
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            What was sent, to whom, when — across every donor.
          </p>
        </div>
        <button
          onClick={() => applyFilters(filters)}
          className="inline-flex items-center gap-1.5 rounded-full border border-border bg-white px-3 py-2 text-xs font-medium text-navy hover:bg-accent"
        >
          <RefreshCw className={loading ? "size-3.5 animate-spin" : "size-3.5"} /> Refresh
        </button>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <Select
          value={filters.notificationType ?? "all"}
          onValueChange={(v) =>
            applyFilters({
              ...filters,
              notificationType: v === "all" ? undefined : (v as NotificationTypeId),
            })
          }
        >
          <SelectTrigger className="w-[220px]">
            <SelectValue placeholder="Notification type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All types</SelectItem>
            {NOTIFICATION_TYPE_IDS.map((t) => (
              <SelectItem key={t} value={t}>
                {t}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={filters.channel ?? "all"}
          onValueChange={(v) =>
            applyFilters({
              ...filters,
              channel: v === "all" ? undefined : (v as NotificationChannel),
            })
          }
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Channel" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All channels</SelectItem>
            {NOTIFICATION_CHANNELS.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={filters.status ?? "all"}
          onValueChange={(v) =>
            applyFilters({
              ...filters,
              status: v === "all" ? undefined : (v as NotificationStatus),
            })
          }
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {NOTIFICATION_STATUSES.map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="mt-6 rounded-2xl border border-border bg-white shadow-soft">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>When</TableHead>
              <TableHead>Donor</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Channel</TableHead>
              <TableHead>Recipient</TableHead>
              <TableHead>Provider</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Failure reason</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="py-8 text-center text-sm text-muted-foreground">
                  No notifications match these filters.
                </TableCell>
              </TableRow>
            )}
            {logs.map((log) => (
              <TableRow key={log.id}>
                <TableCell className="whitespace-nowrap text-xs">
                  {formatIndianDateTime(log.createdAt)}
                </TableCell>
                <TableCell className="text-xs font-medium text-navy">{log.donorName}</TableCell>
                <TableCell className="text-xs">{log.notificationType}</TableCell>
                <TableCell className="text-xs capitalize">{log.channel}</TableCell>
                <TableCell className="text-xs">{log.recipient}</TableCell>
                <TableCell className="text-xs">{log.provider}</TableCell>
                <TableCell>
                  <Badge variant="outline" className={STATUS_TONE[log.status] ?? ""}>
                    {log.status}
                  </Badge>
                </TableCell>
                <TableCell
                  className="max-w-[220px] truncate text-xs text-muted-foreground"
                  title={log.errorMessage ?? undefined}
                >
                  {log.errorMessage ?? "—"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </main>
  );
}
