import nodemailer from "nodemailer";
import { enforceDashboardToken } from "./_lib/auth.js";
import { createBriefPreview } from "./_lib/preview.js";
import { loadSettings, mergeSettings } from "./_lib/settings.js";

function missingSmtpFields() {
  return [
    "SMTP_HOST",
    "SMTP_PORT",
    "SMTP_USER",
    "SMTP_PASS",
    "SMTP_FROM"
  ].filter((key) => !process.env[key]);
}

function createTransport() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 465),
    secure: String(process.env.SMTP_SECURE || "true").toLowerCase() !== "false",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
}

export default async function handler(request, response) {
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    return response.status(405).json({
      ok: false,
      error: "Method not allowed"
    });
  }

  if (!enforceDashboardToken(request, response)) {
    return;
  }

  const missing = missingSmtpFields();
  if (missing.length) {
    return response.status(501).json({
      ok: false,
      error: "SMTP is not configured for manual sends.",
      missing
    });
  }

  const payload = request.body || {};
  const settings = await loadSettings();
  const mergedSettings = mergeSettings(settings, payload.settings || {});
  const preview = createBriefPreview({
    briefType: payload.briefType === "evening" ? "evening" : "morning",
    settings: mergedSettings,
    recipients: payload.recipients,
    subjectOverride: payload.subject
  });

  if (!preview.recipientsList.length) {
    return response.status(400).json({
      ok: false,
      error: "No recipients configured for manual send."
    });
  }

  const transport = createTransport();
  const result = await transport.sendMail({
    from: process.env.SMTP_FROM,
    to: preview.recipients,
    subject: preview.subject,
    html: preview.html,
    text: preview.text
  });

  return response.status(200).json({
    ok: true,
    subject: preview.subject,
    recipients: preview.recipientsList,
    messageId: result.messageId,
    accepted: result.accepted,
    rejected: result.rejected
  });
}
