import { sendBriefMessage } from "./mailer.js";

function getCronSecret(request) {
  return request.headers.authorization || request.headers.Authorization;
}

export async function dispatchBrief(request, response, options) {
  if (request.method !== "GET") {
    response.setHeader("Allow", "GET");
    return response.status(405).json({
      ok: false,
      error: "Method not allowed"
    });
  }

  if (!process.env.CRON_SECRET || getCronSecret(request) !== `Bearer ${process.env.CRON_SECRET}`) {
    return response.status(401).json({
      ok: false,
      error: "Unauthorized"
    });
  }

  const sendResult = await sendBriefMessage({
    briefType: options.briefType
  });

  if (!sendResult.ok) {
    return response.status(sendResult.status).json(sendResult);
  }

  return response.status(200).json({
    ok: true,
    briefType: options.briefType,
    scheduledLocalTime: options.scheduledLocalTime,
    recipients: sendResult.preview.recipientsList,
    subject: sendResult.preview.subject,
    messageId: sendResult.result.messageId,
    accepted: sendResult.result.accepted,
    rejected: sendResult.result.rejected
  });
}
