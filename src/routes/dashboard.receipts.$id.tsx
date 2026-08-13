import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { formatINR, formatIndianDate } from "@/lib/format";
import { getMyReceiptById } from "@/functions/receipts";

export const Route = createFileRoute("/dashboard/receipts/$id")({
  loader: ({ params }) => getMyReceiptById({ data: { receiptId: params.id } }),
  head: () => ({ meta: [{ title: "Donation Receipt — Tare Zameen Foundation" }] }),
  component: ReceiptPage,
});

function ReceiptPage() {
  const { receipt, donation } = Route.useLoaderData();

  return (
    <main className="mx-auto min-h-dvh max-w-[640px] px-6 pb-20 pt-32 lg:px-10">
      <Link
        to="/dashboard"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-navy"
      >
        <ArrowLeft className="size-4" /> Back to dashboard
      </Link>

      <div className="mt-6 rounded-2xl border border-border bg-white p-8 shadow-soft">
        <div className="flex items-center gap-2 text-brand">
          <ShieldCheck className="size-5" />
          <span className="text-xs font-semibold uppercase tracking-[0.2em]">
            80G Tax Exemption Receipt
          </span>
        </div>
        <h1 className="mt-3 font-display text-2xl font-semibold text-navy">
          Thank you for your contribution.
        </h1>

        <dl className="mt-6 divide-y divide-border text-sm">
          <div className="flex items-center justify-between py-3">
            <dt className="text-muted-foreground">Receipt number</dt>
            <dd className="font-mono font-medium text-navy">{receipt.receiptNumber}</dd>
          </div>
          <div className="flex items-center justify-between py-3">
            <dt className="text-muted-foreground">Amount</dt>
            <dd className="font-semibold text-brand">{formatINR(donation.amountInr)}</dd>
          </div>
          <div className="flex items-center justify-between py-3">
            <dt className="text-muted-foreground">Donation date</dt>
            <dd className="text-navy">{formatIndianDate(donation.createdAt)}</dd>
          </div>
          <div className="flex items-center justify-between py-3">
            <dt className="text-muted-foreground">Reference ID</dt>
            <dd className="font-mono text-navy">{donation.referenceId}</dd>
          </div>
          {donation.campaignName && (
            <div className="flex items-center justify-between py-3">
              <dt className="text-muted-foreground">Cause</dt>
              <dd className="text-navy">{donation.campaignName}</dd>
            </div>
          )}
          <div className="flex items-center justify-between py-3">
            <dt className="text-muted-foreground">Receipt generated</dt>
            <dd className="text-navy">{formatIndianDate(receipt.generatedAt)}</dd>
          </div>
        </dl>

        <p className="mt-6 text-xs text-muted-foreground">
          This receipt confirms your donation to Tare Zameen Foundation. Please retain it for your
          tax records.
        </p>
      </div>
    </main>
  );
}
