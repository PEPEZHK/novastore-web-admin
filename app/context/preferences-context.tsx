import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from "react";
import type { Language, ThemeMode } from "~/Interfaces/product";
import { STORAGE_KEYS } from "~/utils/constants";
import { tFor, type TranslationKey } from "~/utils/i18n";

interface PreferencesContextValue {
  language: Language;
  setLanguage: (lang: Language) => void;
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  t: (key: TranslationKey) => string;
}

const PreferencesContext = createContext<PreferencesContextValue | undefined>(
  undefined,
);

const getSystemTheme = (): "light" | "dark" => {
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
};

const applyThemeClass = (mode: ThemeMode) => {
  const resolved = mode === "system" ? getSystemTheme() : mode;
  const root = document.documentElement;
  root.classList.toggle("dark", resolved === "dark");
};

const parseLanguage = (value: string | null | undefined): Language | null => {
  if (value === "en" || value === "tr") {
    return value;
  }
  return null;
};

const readLanguageFromCookie = (): Language | null => {
  const cookieParts = document.cookie.split(";");
  for (const part of cookieParts) {
    const [rawKey, rawValue] = part.split("=");
    if (!rawKey || !rawValue) {
      continue;
    }

    if (rawKey.trim() !== "lang") {
      continue;
    }

    return parseLanguage(decodeURIComponent(rawValue.trim()));
  }

  return null;
};

const writeLanguageCookie = (language: Language) => {
  document.cookie = `lang=${language}; Path=/; Max-Age=31536000; SameSite=Lax`;
};

export const PreferencesProvider = ({ children }: PropsWithChildren) => {
  const [themeMode, setThemeModeState] = useState<ThemeMode>(() => {
    if (typeof window === "undefined") {
      return "system";
    }

    const storedTheme = window.localStorage.getItem(STORAGE_KEYS.themeMode);
    if (
      storedTheme === "light" ||
      storedTheme === "dark" ||
      storedTheme === "system"
    ) {
      return storedTheme;
    }

    return "system";
  });

  const [language, setLanguageState] = useState<Language>(() => {
    if (typeof window === "undefined") {
      return "en";
    }

    const storedLanguage = parseLanguage(
      window.localStorage.getItem(STORAGE_KEYS.language),
    );
    if (storedLanguage) {
      return storedLanguage;
    }

    const htmlLanguage = parseLanguage(document.documentElement.lang);
    if (htmlLanguage) {
      return htmlLanguage;
    }

    return readLanguageFromCookie() ?? "en";
  });

  useEffect(() => {
    applyThemeClass(themeMode);
    window.localStorage.setItem(STORAGE_KEYS.themeMode, themeMode);

    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => {
      if (themeMode === "system") {
        applyThemeClass("system");
      }
    };

    media.addEventListener("change", handler);
    return () => media.removeEventListener("change", handler);
  }, [themeMode]);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEYS.language, language);
    writeLanguageCookie(language);
    document.documentElement.lang = language;
  }, [language]);

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
  }, []);

  const setThemeMode = useCallback((mode: ThemeMode) => {
    setThemeModeState(mode);
  }, []);

  const t = useCallback(
    (key: TranslationKey): string => {
      return tFor(language, key);
    },
    [language],
  );

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      themeMode,
      setThemeMode,
      t,
    }),
    [language, setLanguage, setThemeMode, t, themeMode],
  );

  return (
    <PreferencesContext.Provider value={value}>
      {children}
    </PreferencesContext.Provider>
  );
};

export const usePreferences = (): PreferencesContextValue => {
  const context = useContext(PreferencesContext);

  if (!context) {
    throw new Error("usePreferences must be used within PreferencesProvider");
  }

  return context;
};
