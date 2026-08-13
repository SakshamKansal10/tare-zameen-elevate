import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getEmailProvider } from "@/server/notifications/providers/email";

/**
 * Public partnership-inquiry form submission. No donor auth required — this
 * is a lead-gen contact form, not a donor notification, so it deliberately
 * does not go through NotificationService/notification_logs (that schema is
 * donor-scoped). Reuses the same EmailProvider abstraction as Module 1: a
 * real send via Resend when configured, honest console-logging otherwise —
 * never a fake "sent" response when nothing was actually delivered.
 */
export const submitPartnershipInquiry = createServerFn({ method: "POST" })
  .validator(
    z.object({
      partnerType: z.enum(["society", "rwa", "corporate"]),
      organization: z.string().trim().min(1, "Organization name is required.").max(200),
      contactName: z.string().trim().max(120).optional(),
      email: z.string().trim().email("Please enter a valid email address."),
      phone: z.string().trim().max(30).optional(),
      message: z.string().trim().max(2000).optional(),
    }),
  )
  .handler(async ({ data }) => {
    const inquiryInbox = process.env.PARTNERSHIP_INQUIRY_EMAIL || "info@tarezameenfoundation.org";
    const provider = getEmailProvider();

    const partnerTypeLabel = { society: "Housing Society", rwa: "RWA", corporate: "Corporate" }[
      data.partnerType
    ];
    const text = [
      `New partnership inquiry (${partnerTypeLabel})`,
      "",
      `Organization: ${data.organization}`,
      data.contactName ? `Contact: ${data.contactName}` : null,
      `Email: ${data.email}`,
      data.phone ? `Phone: ${data.phone}` : null,
      data.message ? `\nMessage:\n${data.message}` : null,
    ]
      .filter(Boolean)
      .join("\n");

    const result = await provider.sendEmail({
      to: inquiryInbox,
      subject: `New partnership inquiry — ${data.organization}`,
      html: `<pre style="font-family:inherit;white-space:pre-wrap;">${text.replace(/&/g, "&amp;").replace(/</g, "&lt;")}</pre>`,
      text,
    });

    if (!result.success) {
      console.error(
        "submitPartnershipInquiry: email send failed",
        result.errorCode,
        result.errorMessage,
      );
      throw new Error(
        "We couldn't submit your inquiry right now. Please email us directly at info@tarezameenfoundation.org.",
      );
    }

    return { ok: true as const };
  });
