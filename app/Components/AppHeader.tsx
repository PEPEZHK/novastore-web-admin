import { Form, Link, useLocation, useRouteLoaderData } from "@remix-run/react";
import { PreferenceControls } from "~/Components/PreferenceControls";
import { usePreferences } from "~/context/preferences-context";
import type { loader as rootLoader } from "~/root";

const linkClassName =
  "rounded-md px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800";

const activeLinkClassName =
  "rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white dark:bg-slate-100 dark:text-slate-900";

export const AppHeader = () => {
  const { pathname } = useLocation();
  const { t } = usePreferences();
  const rootData = useRouteLoaderData<typeof rootLoader>("root");

  const userEmail = rootData?.user?.email;
  const userRole = rootData?.user?.role;
  const canManage = userRole === "admin";
  const isDashboardActive = pathname === "/dashboard";
  const isProductsActive = pathname.startsWith("/products");
  const isSettingsActive = pathname === "/settings";

  return (
    <header className="border-b border-slate-200 bg-white/90 backdrop-blur dark:border-slate-800 dark:bg-slate-950/90">
      <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <div className="mr-auto">
          <p className="text-xs uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
            {t("appName")}
          </p>
          <h1 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            {t("dashboardTitle")}
          </h1>
        </div>

        <nav className="flex items-center gap-2">
          <Link
            to="/dashboard"
            className={isDashboardActive ? activeLinkClassName : linkClassName}
          >
            {t("navDashboard")}
          </Link>
          {canManage ? (
            <Link
              to="/products/new"
              className={isProductsActive ? activeLinkClassName : linkClassName}
            >
              {t("addProduct")}
            </Link>
          ) : null}
          <Link
            to="/settings"
            className={isSettingsActive ? activeLinkClassName : linkClassName}
          >
            {t("navSettings")}
          </Link>
        </nav>

        <PreferenceControls />

        {userEmail ? (
          <p className="text-sm text-slate-600 dark:text-slate-300">
            {t("signedInAs")} <span className="font-medium">{userEmail}</span>{" "}
            ({userRole === "admin" ? t("roleAdmin") : t("roleViewer")})
          </p>
        ) : null}

        <Form method="post" action="/logout">
          <button
            type="submit"
            className="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            {t("logout")}
          </button>
        </Form>
      </div>
    </header>
  );
};
