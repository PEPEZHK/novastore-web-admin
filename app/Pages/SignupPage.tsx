import { Form, Link } from "@remix-run/react";
import { PreferenceControls } from "~/Components/PreferenceControls";
import { usePreferences } from "~/context/preferences-context";

interface SignupPageProps {
  error?: string;
  email?: string;
  rememberMe?: boolean;
  redirectTo: string;
}

export const SignupPage = ({
  error,
  email,
  rememberMe,
  redirectTo,
}: SignupPageProps) => {
  const { t } = usePreferences();

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-10 dark:bg-slate-950">
      <div className="mx-auto flex w-full max-w-5xl justify-end pb-4">
        <div className="flex items-center gap-2">
          <PreferenceControls compact />
        </div>
      </div>

      <div className="mx-auto grid w-full max-w-md place-items-center">
        <section className="w-full rounded-2xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-800 dark:bg-slate-900">
          <p className="mb-1 text-xs uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
            {t("appName")}
          </p>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
            {t("signupTitle")}
          </h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
            {t("signupSubtitle")}
          </p>

          {error ? (
            <div
              role="alert"
              className="mt-4 rounded-md border border-rose-300 bg-rose-50 px-3 py-2 text-sm text-rose-800 dark:border-rose-800 dark:bg-rose-900/30 dark:text-rose-200"
            >
              {error}
            </div>
          ) : null}

          <Form className="mt-6 space-y-4" method="post" replace noValidate>
            <input type="hidden" name="redirectTo" value={redirectTo} />

            <label className="flex flex-col gap-1 text-sm">
              <span className="font-medium text-slate-700 dark:text-slate-200">
                {t("emailLabel")}
              </span>
              <input
                type="email"
                name="email"
                autoComplete="email"
                defaultValue={email}
                placeholder={t("loginEmailPlaceholder")}
                className="rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
              />
            </label>

            <label className="flex flex-col gap-1 text-sm">
              <span className="font-medium text-slate-700 dark:text-slate-200">
                {t("passwordLabel")}
              </span>
              <input
                type="password"
                name="password"
                autoComplete="new-password"
                placeholder={t("loginPasswordPlaceholder")}
                className="rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
              />
            </label>

            <label className="flex flex-col gap-1 text-sm">
              <span className="font-medium text-slate-700 dark:text-slate-200">
                {t("signupConfirmPasswordLabel")}
              </span>
              <input
                type="password"
                name="confirmPassword"
                autoComplete="new-password"
                placeholder={t("signupConfirmPasswordPlaceholder")}
                className="rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
              />
            </label>

            <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-200">
              <input
                type="checkbox"
                name="rememberMe"
                defaultChecked={rememberMe}
                className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-500 dark:border-slate-700"
              />
              <span>{t("loginRememberMe")}</span>
            </label>

            <button
              type="submit"
              className="w-full rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200"
            >
              {t("signupButton")}
            </button>
          </Form>

          <p className="mt-4 text-sm text-slate-600 dark:text-slate-300">
            {t("loginLinkCta")}{" "}
            <Link
              to={`/login?redirectTo=${encodeURIComponent(redirectTo)}`}
              className="font-medium text-slate-900 underline underline-offset-2 dark:text-slate-100"
            >
              {t("loginButton")}
            </Link>
          </p>
        </section>
      </div>
    </main>
  );
};
