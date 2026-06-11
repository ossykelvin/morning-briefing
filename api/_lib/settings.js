import fs from "node:fs/promises";
import path from "node:path";

const SETTINGS_KEYS = [
  "MORNING_BRIEF_TIME",
  "EVENING_BRIEF_TIME",
  "TIMEZONE",
  "RECIPIENT_LIST",
  "NEWS_SOURCES",
  "SOCIAL_SOURCES",
  "THEME_NAVY",
  "THEME_BLUE",
  "THEME_BACKGROUND",
  "THEME_WHITE",
  "GMAIL_DELIVERY_MODE",
  "CALENDAR_SOURCE"
];

const DEFAULT_SETTINGS = {
  MORNING_BRIEF_TIME: "07:00",
  EVENING_BRIEF_TIME: "21:10",
  TIMEZONE: "Africa/Lagos",
  RECIPIENT_LIST: "",
  NEWS_SOURCES: "",
  SOCIAL_SOURCES: "",
  THEME_NAVY: "#0D1B3D",
  THEME_BLUE: "#2563EB",
  THEME_BACKGROUND: "#F2F4F7",
  THEME_WHITE: "#FFFFFF",
  GMAIL_DELIVERY_MODE: "connector",
  CALENDAR_SOURCE: "available_connector"
};

function parseEnvFile(content) {
  const values = {};
  for (const line of content.split(/\r?\n/)) {
    if (!line || line.trim().startsWith("#")) {
      continue;
    }
    const separatorIndex = line.indexOf("=");
    if (separatorIndex === -1) {
      continue;
    }
    const key = line.slice(0, separatorIndex).trim();
    const value = line.slice(separatorIndex + 1).trim();
    values[key] = value;
  }
  return values;
}

async function readLocalEnvFile() {
  try {
    const envPath = path.join(process.cwd(), ".env.local");
    const content = await fs.readFile(envPath, "utf8");
    return parseEnvFile(content);
  } catch {
    return {};
  }
}

export async function loadSettings() {
  const fileValues = await readLocalEnvFile();
  const merged = { ...DEFAULT_SETTINGS };

  for (const key of SETTINGS_KEYS) {
    if (fileValues[key]) {
      merged[key] = fileValues[key];
      continue;
    }
    if (process.env[key]) {
      merged[key] = process.env[key];
    }
  }

  return {
    ...merged,
    RECIPIENT_LIST_ITEMS: merged.RECIPIENT_LIST
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean),
    NEWS_SOURCE_ITEMS: merged.NEWS_SOURCES
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean),
    SOCIAL_SOURCE_ITEMS: merged.SOCIAL_SOURCES
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean)
  };
}

function normalizeText(value) {
  return String(value ?? "")
    .replace(/\r?\n/g, ", ")
    .replace(/\s*,\s*/g, ",")
    .trim();
}

function normalizeSettingValue(key, value) {
  if (["RECIPIENT_LIST", "NEWS_SOURCES", "SOCIAL_SOURCES"].includes(key)) {
    return normalizeText(value);
  }
  return String(value ?? "").trim();
}

export function buildEnvContent(input) {
  const sanitized = {};
  for (const key of SETTINGS_KEYS) {
    sanitized[key] = normalizeSettingValue(key, input[key] ?? DEFAULT_SETTINGS[key]);
  }

  return SETTINGS_KEYS.map((key) => `${key}=${sanitized[key]}`).join("\n") + "\n";
}

export async function saveSettings(input) {
  const content = buildEnvContent(input);
  const envPath = path.join(process.cwd(), ".env.local");

  await fs.writeFile(envPath, content, "utf8");

  return {
    saved: true,
    content
  };
}
