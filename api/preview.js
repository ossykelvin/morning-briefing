import { createBriefPreview } from "./_lib/preview.js";
import { loadSettings } from "./_lib/settings.js";

export default async function handler(request, response) {
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    return response.status(405).json({
      ok: false,
      error: "Method not allowed"
    });
  }

  const settings = await loadSettings();
  const payload = request.body || {};
  const preview = createBriefPreview({
    briefType: payload.briefType === "evening" ? "evening" : "morning",
    settings,
    recipients: payload.recipients,
    subjectOverride: payload.subject
  });

  return response.status(200).json({
    ok: true,
    preview
  });
}
