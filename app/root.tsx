import type { LinksFunction, LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} from "@remix-run/react";
import { PreferencesProvider } from "~/context/preferences-context";
import { ToastProvider } from "~/context/toast-context";
import { getUser } from "~/utils/auth.server";
import { getLanguageFromRequest } from "~/utils/lang.server";
import stylesheet from "~/styles/tailwind.css?url";

export const links: LinksFunction = () => [{ rel: "stylesheet", href: stylesheet }];

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const user = await getUser(request);
  const lang = getLanguageFromRequest(request);

  return json({ user, lang });
};

const themeBootScript = `
(() => {
  try {
    const mode = localStorage.getItem('novastore.themeMode') || 'system';
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const resolved = mode === 'system' ? (prefersDark ? 'dark' : 'light') : mode;
    document.documentElement.classList.toggle('dark', resolved === 'dark');
  } catch {
    document.documentElement.classList.remove('dark');
  }
})();
`;

export default function App() {
  const data = useLoaderData<typeof loader>();

  return (
    <html lang={data.lang} suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
        <script dangerouslySetInnerHTML={{ __html: themeBootScript }} />
      </head>
      <body className="bg-slate-100 text-slate-900 antialiased dark:bg-slate-950 dark:text-slate-100">
        <PreferencesProvider>
          <ToastProvider>
            <Outlet />
          </ToastProvider>
        </PreferencesProvider>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}
