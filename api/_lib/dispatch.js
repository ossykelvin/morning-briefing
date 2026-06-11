const JSON_HEADERS = {
  "content-type": "application/json"
};

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

  if (getCronSecret(request) !== `Bearer ${process.env.CRON_SECRET}`) {
    return response.status(401).json({
      ok: false,
      error: "Unauthorized"
    });
  }

  const targetUrl = process.env[options.webhookEnvVar];
  if (!targetUrl) {
    return response.status(500).json({
      ok: false,
      error: `Missing ${options.webhookEnvVar}`
    });
  }

  const outboundHeaders = { ...JSON_HEADERS };
  if (process.env.BRIEF_WEBHOOK_TOKEN) {
    outboundHeaders.authorization = `Bearer ${process.env.BRIEF_WEBHOOK_TOKEN}`;
  }

  const payload = {
    briefType: options.briefType,
    source: "vercel-cron",
    scheduleTimezone: "Africa/Lagos",
    scheduledLocalTime: options.scheduledLocalTime,
    invokedAt: new Date().toISOString()
  };

  const upstreamResponse = await fetch(targetUrl, {
    method: "POST",
    headers: outboundHeaders,
    body: JSON.stringify(payload)
  });

  const upstreamText = await upstreamResponse.text();

  if (!upstreamResponse.ok) {
    return response.status(502).json({
      ok: false,
      error: "Brief webhook failed",
      status: upstreamResponse.status,
      body: upstreamText.slice(0, 500)
    });
  }

  return response.status(200).json({
    ok: true,
    briefType: options.briefType,
    forwardedTo: targetUrl,
    invokedAt: payload.invokedAt,
    upstreamStatus: upstreamResponse.status,
    upstreamBody: upstreamText.slice(0, 500)
  });
}
