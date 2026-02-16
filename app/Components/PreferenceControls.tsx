import type { Language, ThemeMode } from "~/Interfaces/product";
import { usePreferences } from "~/context/preferences-context";

interface PreferenceControlsProps {
  compact?: boolean;
}

const themeValues: ThemeMode[] = ["light", "dark", "system"];
const languageValues: Language[] = ["en", "tr"];

export const PreferenceControls = ({
  compact = false,
}: PreferenceControlsProps) => {
  const { t, language, setLanguage, themeMode, setThemeMode } = usePreferences();

  const commonClassName =
    "rounded-md border border-slate-300 bg-white px-2 py-1 text-sm dark:border-slate-700 dark:bg-slate-900";

  return (
    <>
      <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-200">
        <span className={compact ? "sr-only" : ""}>{t("theme")}</span>
        <select
          className={commonClassName}
          value={themeMode}
          onChange={(event) => setThemeMode(event.target.value as ThemeMode)}
          aria-label={t("theme")}
        >
          {themeValues.map((value) => (
            <option key={value} value={value}>
              {value === "light" && t("themeLight")}
              {value === "dark" && t("themeDark")}
              {value === "system" && t("themeSystem")}
            </option>
          ))}
        </select>
      </label>

      <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-200">
        <span className={compact ? "sr-only" : ""}>{t("language")}</span>
        <select
          className={commonClassName}
          value={language}
          onChange={(event) => setLanguage(event.target.value as Language)}
          aria-label={t("language")}
        >
          {languageValues.map((value) => (
            <option key={value} value={value}>
              {value === "en" ? t("langEnglish") : t("langTurkish")}
            </option>
          ))}
        </select>
      </label>
    </>
  );
};
