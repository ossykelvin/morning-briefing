import fs from "node:fs/promises";
import path from "node:path";

function parseDateFromFilename(fileName) {
  const match = fileName.match(/(\d{4}-\d{2}-\d{2})/);
  return match ? match[1] : null;
}

export default async function handler(_request, response) {
  try {
    const directoryEntries = await fs.readdir(process.cwd(), { withFileTypes: true });
    const briefs = directoryEntries
      .filter((entry) => entry.isFile() && /^morning-brief-\d{4}-\d{2}-\d{2}\.html$/.test(entry.name))
      .map((entry) => ({
        name: entry.name,
        date: parseDateFromFilename(entry.name),
        href: `/${entry.name}`
      }))
      .sort((left, right) => right.name.localeCompare(left.name));

    return response.status(200).json({
      ok: true,
      briefs
    });
  } catch (error) {
    return response.status(500).json({
      ok: false,
      error: String(error?.message || error)
    });
  }
}
