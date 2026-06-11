import { briefManifest } from "./_lib/brief-manifest.js";

export default async function handler(_request, response) {
  return response.status(200).json({
    ok: true,
    briefs: briefManifest
  });
}
