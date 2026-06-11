import { dispatchBrief } from "../_lib/dispatch.js";

export default async function handler(request, response) {
  return dispatchBrief(request, response, {
    briefType: "evening",
    scheduledLocalTime: "21:10",
    webhookEnvVar: "EVENING_BRIEF_WEBHOOK_URL"
  });
}
