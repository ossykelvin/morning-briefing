import { enforceDashboardToken } from "./_lib/auth.js";
import { buildEnvContent, loadSettings, saveSettings } from "./_lib/settings.js";

function sendJson(response, statusCode, payload) {
  response.status(statusCode).json(payload);
}

export default async function handler(request, response) {
  if (request.method === "GET") {
    const settings = await loadSettings();
    return sendJson(response, 200, {
      ok: true,
      settings,
      persistence: "file-or-env"
    });
  }

  if (request.method === "POST") {
    if (!enforceDashboardToken(request, response)) {
      return;
    }

    const payload = request.body || {};

    try {
      const result = await saveSettings(payload);
      const settings = await loadSettings();
      return sendJson(response, 200, {
        ok: true,
        settings,
        persistence: "file",
        envPreview: result.content
      });
    } catch (error) {
      return sendJson(response, 501, {
        ok: false,
        error: "This runtime cannot persist settings to .env.local.",
        detail: String(error?.message || error),
        envPreview: buildEnvContent(payload),
        persistence: "read-only-runtime"
      });
    }
  }

  response.setHeader("Allow", "GET, POST");
  return sendJson(response, 405, {
    ok: false,
    error: "Method not allowed"
  });
}
