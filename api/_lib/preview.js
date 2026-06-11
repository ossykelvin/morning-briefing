function splitList(value) {
  return String(value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function formatLocalTimestamp(timezone) {
  const formatter = new Intl.DateTimeFormat("en-GB", {
    timeZone: timezone || "Africa/Lagos",
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });

  return formatter.format(new Date());
}

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function buildListMarkup(items, emptyLabel) {
  if (!items.length) {
    return `<li>${escapeHtml(emptyLabel)}</li>`;
  }

  return items.map((item) => `<li>${escapeHtml(item)}</li>`).join("");
}

function buildSubject(briefType, dateStamp) {
  if (briefType === "evening") {
    return `Evening Brief - ${dateStamp}`;
  }
  return `Morning Brief - ${dateStamp}`;
}

export function createBriefPreview({
  briefType,
  settings,
  recipients,
  subjectOverride
}) {
  const timezone = settings.TIMEZONE || "Africa/Lagos";
  const timestamp = formatLocalTimestamp(timezone);
  const dateStamp = timestamp.replace(/, \d{2}:\d{2}$/, "");
  const resolvedRecipients = splitList(recipients || settings.RECIPIENT_LIST);
  const newsSources = splitList(settings.NEWS_SOURCES);
  const socialSources = splitList(settings.SOCIAL_SOURCES);
  const title = briefType === "evening" ? "Evening Intelligence Brief" : "Morning Intelligence Brief";
  const scheduleLabel = briefType === "evening"
    ? settings.EVENING_BRIEF_TIME || "21:10"
    : settings.MORNING_BRIEF_TIME || "07:00";
  const subject = subjectOverride?.trim() || buildSubject(briefType, dateStamp);
  const theme = {
    navy: settings.THEME_NAVY || "#0D1B3D",
    blue: settings.THEME_BLUE || "#2563EB",
    background: settings.THEME_BACKGROUND || "#F2F4F7",
    white: settings.THEME_WHITE || "#FFFFFF"
  };

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(subject)}</title>
  <style>
    body { margin: 0; padding: 24px 0; background: ${theme.background}; font-family: Arial, Helvetica, sans-serif; color: #182230; }
    table { border-collapse: collapse; border-spacing: 0; }
    .shell { width: 100%; }
    .main { width: 100%; max-width: 860px; margin: 0 auto; background: ${theme.white}; border: 1px solid #d0d5dd; border-radius: 10px; overflow: hidden; }
    .hero { background: ${theme.navy}; color: #ffffff; padding: 30px; }
    .eyebrow { display: inline-block; font-size: 12px; font-weight: 700; text-transform: uppercase; background: ${theme.blue}; border-radius: 999px; padding: 8px 12px; }
    .hero h1 { margin: 16px 0 8px; font-size: 42px; line-height: 1.05; }
    .hero p { margin: 0; font-size: 15px; line-height: 24px; color: #dce6f8; }
    .body { padding: 22px 28px 30px; }
    .grid { width: 100%; }
    .card { border: 1px solid #d0d5dd; border-radius: 8px; padding: 16px; vertical-align: top; background: #fbfcff; }
    .card h2 { margin: 0 0 10px; color: ${theme.navy}; font-size: 20px; line-height: 24px; }
    .card p, .card li { font-size: 14px; line-height: 22px; color: #344054; }
    .label { font-size: 12px; line-height: 16px; text-transform: uppercase; font-weight: 700; color: #667085; margin-bottom: 10px; }
    .metric { font-size: 26px; line-height: 1; font-weight: 700; color: ${theme.navy}; margin-bottom: 8px; }
    ul { margin: 0; padding-left: 18px; }
    .footer { margin-top: 18px; font-size: 12px; line-height: 18px; color: #667085; }
    @media screen and (max-width: 720px) {
      .stack { display: block !important; width: 100% !important; }
      .pad { padding: 14px 0 0 !important; }
      .hero h1 { font-size: 34px; }
    }
  </style>
</head>
<body>
  <table role="presentation" class="shell" width="100%">
    <tr>
      <td align="center">
        <table role="presentation" class="main" width="100%">
          <tr>
            <td class="hero">
              <div class="eyebrow">${escapeHtml(briefType === "evening" ? "Manual Evening Run" : "Manual Morning Run")}</div>
              <h1>${escapeHtml(title)}</h1>
              <p>This interactive preview was generated from the current dashboard settings and is ready for manual email delivery.</p>
            </td>
          </tr>
          <tr>
            <td class="body">
              <table role="presentation" class="grid" width="100%">
                <tr>
                  <td class="card stack" width="50%">
                    <div class="label">Delivery</div>
                    <div class="metric">${escapeHtml(scheduleLabel)}</div>
                    <p><b>Timezone:</b> ${escapeHtml(timezone)}<br><b>Generated:</b> ${escapeHtml(timestamp)}<br><b>Recipients:</b> ${escapeHtml(resolvedRecipients.join(", ") || "None configured")}</p>
                  </td>
                  <td class="stack pad" width="50%" style="padding-left: 14px;">
                    <div class="card">
                      <div class="label">Connectors</div>
                      <p><b>Calendar:</b> ${escapeHtml(settings.CALENDAR_SOURCE || "available_connector")}<br><b>Delivery mode:</b> ${escapeHtml(settings.GMAIL_DELIVERY_MODE || "connector")}<br><b>Theme:</b> ${escapeHtml(theme.navy)} / ${escapeHtml(theme.blue)}</p>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td class="stack" width="50%" style="padding-top: 14px;">
                    <div class="card">
                      <h2>News Watchlist</h2>
                      <ul>${buildListMarkup(newsSources, "No news sources configured")}</ul>
                    </div>
                  </td>
                  <td class="stack pad" width="50%" style="padding-top: 14px; padding-left: 14px;">
                    <div class="card">
                      <h2>Social Watchlist</h2>
                      <ul>${buildListMarkup(socialSources, "No social sources configured")}</ul>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td colspan="2" style="padding-top: 14px;">
                    <div class="card">
                      <h2>Operator Notes</h2>
                      <p>Use this preview to validate recipients, theme colors, source lists, and run timing before manual delivery. Once approved, the dashboard send action will dispatch the exact rendered HTML through the configured SMTP transport.</p>
                    </div>
                    <div class="footer">Subject: ${escapeHtml(subject)}</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  const text = [
    subject,
    "",
    title,
    `Scheduled time: ${scheduleLabel} (${timezone})`,
    `Generated: ${timestamp}`,
    `Recipients: ${resolvedRecipients.join(", ") || "None configured"}`,
    `News sources: ${newsSources.join(", ") || "None configured"}`,
    `Social sources: ${socialSources.join(", ") || "None configured"}`
  ].join("\n");

  return {
    briefType,
    subject,
    recipients: resolvedRecipients.join(", "),
    recipientsList: resolvedRecipients,
    generatedAt: timestamp,
    scheduleLabel,
    html,
    text
  };
}
