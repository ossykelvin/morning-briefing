import nodemailer from "nodemailer";
import { createBriefPreview } from "./preview.js";
import { loadSettings, mergeSettings } from "./settings.js";

export function missingSmtpFields() {
  return [
    "SMTP_HOST",
    "SMTP_PORT",
    "SMTP_USER",
    "SMTP_PASS",
    "SMTP_FROM"
  ].filter((key) => !process.env[key]);
}

export function createTransport() {
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

export async function buildPreviewFromSettings({
  briefType,
  recipients,
  subjectOverride,
  settingsOverrides
}) {
  const settings = await loadSettings();
  const mergedSettings = mergeSettings(settings, settingsOverrides || {});

  return createBriefPreview({
    briefType: briefType === "evening" ? "evening" : "morning",
    settings: mergedSettings,
    recipients,
    subjectOverride
  });
}

export async function sendBriefMessage({
  briefType,
  recipients,
  subjectOverride,
  settingsOverrides
}) {
  const missing = missingSmtpFields();
  if (missing.length) {
    return {
      ok: false,
      status: 501,
      error: "SMTP is not configured for sends.",
      missing
    };
  }

  const preview = await buildPreviewFromSettings({
    briefType,
    recipients,
    subjectOverride,
    settingsOverrides
  });

  if (!preview.recipientsList.length) {
    return {
      ok: false,
      status: 400,
      error: "No recipients configured for send."
    };
  }

  const transport = createTransport();
  const result = await transport.sendMail({
    from: process.env.SMTP_FROM,
    to: preview.recipients,
    subject: preview.subject,
    html: preview.html,
    text: preview.text
  });

  return {
    ok: true,
    status: 200,
    preview,
    result
  };
}
