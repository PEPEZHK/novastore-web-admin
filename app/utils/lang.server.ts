import type { Language } from "~/Interfaces/product";

const fallbackLanguage: Language = "en";

const parseLangValue = (value: string | null | undefined): Language | null => {
  if (value === "en" || value === "tr") {
    return value;
  }
  return null;
};

export const getLanguageFromCookieHeader = (
  cookieHeader: string | null,
): Language => {
  if (!cookieHeader) {
    return fallbackLanguage;
  }

  const pairs = cookieHeader.split(";");
  for (const pair of pairs) {
    const [rawKey, rawValue] = pair.split("=");
    if (!rawKey || !rawValue) {
      continue;
    }

    const key = rawKey.trim();
    if (key !== "lang") {
      continue;
    }

    const parsed = parseLangValue(decodeURIComponent(rawValue.trim()));
    if (parsed) {
      return parsed;
    }
  }

  return fallbackLanguage;
};

export const getLanguageFromRequest = (request: Request): Language => {
  return getLanguageFromCookieHeader(request.headers.get("Cookie"));
};
