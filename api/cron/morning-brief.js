import { dispatchBrief } from "../_lib/dispatch.js";

export default async function handler(request, response) {
  return dispatchBrief(request, response, {
    briefType: "morning",
    scheduledLocalTime: "07:00",
    webhookEnvVar: "MORNING_BRIEF_WEBHOOK_URL"
  });
}
