import { useEffect, useState, type FormEvent } from "react";
import { useRouteLoaderData } from "@remix-run/react";
import { AppHeader } from "~/Components/AppHeader";
import type { loader as rootLoader } from "~/root";
import { usePreferences } from "~/context/preferences-context";
import { useToast } from "~/context/toast-context";
import {
  loadProfileSettings,
  saveProfileSettings,
  type ProfileSettings,
} from "~/utils/profile";

interface FormErrors {
  fullName?: string;
  profileEmail?: string;
}

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const SettingsPage = () => {
  const { t } = usePreferences();
  const { notify } = useToast();
  const rootData = useRouteLoaderData<typeof rootLoader>("root");
  const user = rootData?.user ?? null;

  const [profile, setProfile] = useState<ProfileSettings>(() =>
    loadProfileSettings(user),
  );
  const [errors, setErrors] = useState<FormErrors>({});

  useEffect(() => {
    setProfile(loadProfileSettings(user));
  }, [user]);

  const updateProfile = <T extends keyof ProfileSettings>(
    key: T,
    value: ProfileSettings[T],
  ) => {
    setProfile((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextErrors: FormErrors = {};

    if (!profile.fullName.trim()) {
      nextErrors.fullName = t("validationProfileNameRequired");
    }

    if (!emailPattern.test(profile.profileEmail.trim())) {
      nextErrors.profileEmail = t("validationProfileEmailInvalid");
    }

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    saveProfileSettings({
      ...profile,
      fullName: profile.fullName.trim(),
      profileEmail: profile.profileEmail.trim().toLowerCase(),
      phone: profile.phone.trim(),
      city: profile.city.trim(),
      company: profile.company.trim(),
      bio: profile.bio.trim(),
    });

    notify(t("settingsSavedSuccess"), "success");
  };

  const handleReset = () => {
    const resetProfile = loadProfileSettings(user);
    setProfile(resetProfile);
    setErrors({});
  };

  const inputClasses =
    "rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100";

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950">
      <AppHeader />

      <main className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
        <form className="space-y-4" onSubmit={handleSubmit} noValidate>
          <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
              {t("settingsTitle")}
            </h2>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
              {t("settingsDescription")}
            </p>
          </section>

          <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              {t("settingsAccountTitle")}
            </h3>
            <dl className="mt-3 grid gap-2 text-sm text-slate-700 dark:text-slate-200">
              <div className="flex flex-wrap items-center gap-2">
                <dt className="font-medium">{t("settingsSessionEmailLabel")}:</dt>
                <dd>{user?.email ?? "-"}</dd>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <dt className="font-medium">{t("settingsRoleLabel")}:</dt>
                <dd>{user?.role === "admin" ? t("roleAdmin") : t("roleViewer")}</dd>
              </div>
            </dl>
          </section>

          <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              {t("settingsProfileTitle")}
            </h3>

            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <label className="flex flex-col gap-1 text-sm">
                <span className="font-medium text-slate-700 dark:text-slate-200">
                  {t("settingsProfileFullName")}
                </span>
                <input
                  value={profile.fullName}
                  onChange={(event) => updateProfile("fullName", event.target.value)}
                  className={inputClasses}
                  aria-invalid={Boolean(errors.fullName)}
                />
                {errors.fullName ? (
                  <span className="text-xs text-rose-600 dark:text-rose-400">
                    {errors.fullName}
                  </span>
                ) : null}
              </label>

              <label className="flex flex-col gap-1 text-sm">
                <span className="font-medium text-slate-700 dark:text-slate-200">
                  {t("settingsProfileEmail")}
                </span>
                <input
                  type="email"
                  value={profile.profileEmail}
                  onChange={(event) =>
                    updateProfile("profileEmail", event.target.value)
                  }
                  className={inputClasses}
                  aria-invalid={Boolean(errors.profileEmail)}
                />
                {errors.profileEmail ? (
                  <span className="text-xs text-rose-600 dark:text-rose-400">
                    {errors.profileEmail}
                  </span>
                ) : null}
              </label>

              <label className="flex flex-col gap-1 text-sm">
                <span className="font-medium text-slate-700 dark:text-slate-200">
                  {t("settingsProfilePhone")}
                </span>
                <input
                  value={profile.phone}
                  onChange={(event) => updateProfile("phone", event.target.value)}
                  className={inputClasses}
                />
              </label>

              <label className="flex flex-col gap-1 text-sm">
                <span className="font-medium text-slate-700 dark:text-slate-200">
                  {t("settingsProfileCity")}
                </span>
                <input
                  value={profile.city}
                  onChange={(event) => updateProfile("city", event.target.value)}
                  className={inputClasses}
                />
              </label>

              <label className="flex flex-col gap-1 text-sm md:col-span-2">
                <span className="font-medium text-slate-700 dark:text-slate-200">
                  {t("settingsProfileCompany")}
                </span>
                <input
                  value={profile.company}
                  onChange={(event) => updateProfile("company", event.target.value)}
                  className={inputClasses}
                />
              </label>

              <label className="flex flex-col gap-1 text-sm md:col-span-2">
                <span className="font-medium text-slate-700 dark:text-slate-200">
                  {t("settingsProfileBio")}
                </span>
                <textarea
                  rows={4}
                  value={profile.bio}
                  onChange={(event) => updateProfile("bio", event.target.value)}
                  className={inputClasses}
                />
              </label>
            </div>
          </section>

          <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              {t("settingsPreferencesTitle")}
            </h3>

            <div className="mt-4 space-y-3 text-sm text-slate-700 dark:text-slate-200">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={profile.receiveOrderAlerts}
                  onChange={(event) =>
                    updateProfile("receiveOrderAlerts", event.target.checked)
                  }
                />
                <span>{t("settingsReceiveOrderAlerts")}</span>
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={profile.receiveMarketingEmails}
                  onChange={(event) =>
                    updateProfile("receiveMarketingEmails", event.target.checked)
                  }
                />
                <span>{t("settingsReceiveMarketing")}</span>
              </label>
            </div>
          </section>

          <div className="flex gap-2">
            <button
              type="submit"
              className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200"
            >
              {t("settingsSaveButton")}
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              {t("settingsResetButton")}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
};
