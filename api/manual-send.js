import { enforceDashboardToken } from "./_lib/auth.js";
import { sendBriefMessage } from "./_lib/mailer.js";

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

  const payload = request.body || {};
  const sendResult = await sendBriefMessage({
    briefType: payload.briefType === "evening" ? "evening" : "morning",
    recipients: payload.recipients,
    subjectOverride: payload.subject,
    settingsOverrides: payload.settings || {}
  });

  if (!sendResult.ok) {
    return response.status(sendResult.status).json(sendResult);
  }

  return response.status(200).json({
    ok: true,
    subject: sendResult.preview.subject,
    recipients: sendResult.preview.recipientsList,
    messageId: sendResult.result.messageId,
    accepted: sendResult.result.accepted,
    rejected: sendResult.result.rejected
  });
}
