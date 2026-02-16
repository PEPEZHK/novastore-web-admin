import type {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  MetaFunction,
} from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { useActionData, useLoaderData } from "@remix-run/react";
import { LoginPage } from "~/Pages/LoginPage";
import { getUser, login, safeRedirect } from "~/utils/auth.server";
import { tFor } from "~/utils/i18n";
import { getLanguageFromRequest } from "~/utils/lang.server";

interface LoginActionData {
  error: string;
  values: {
    email: string;
    rememberMe: boolean;
    redirectTo: string;
  };
}

export const meta: MetaFunction = () => {
  return [{ title: "NovaStore Admin | Login" }];
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const user = await getUser(request);
  const url = new URL(request.url);
  const redirectTo = safeRedirect(url.searchParams.get("redirectTo"));

  if (user) {
    throw redirect(redirectTo);
  }

  return json({ redirectTo });
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();
  const lang = getLanguageFromRequest(request);

  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const rememberMe = formData.get("rememberMe") === "on";
  const redirectTo = safeRedirect(
    typeof formData.get("redirectTo") === "string"
      ? String(formData.get("redirectTo"))
      : null,
  );

  if (!email || !password) {
    return json<LoginActionData>(
      {
        error: tFor(lang, "loginValidation"),
        values: {
          email,
          rememberMe,
          redirectTo,
        },
      },
      { status: 400 },
    );
  }

  // CSRF note: Remix Form posts + SameSite=Lax cookies are used for this demo.
  const loginResponse = await login({
    request,
    email,
    password,
    rememberMe,
    redirectTo,
  });

  if (!loginResponse) {
    return json<LoginActionData>(
      {
        error: tFor(lang, "loginInvalidCredentials"),
        values: {
          email,
          rememberMe,
          redirectTo,
        },
      },
      { status: 400 },
    );
  }

  return loginResponse;
};

export default function LoginRoute() {
  const loaderData = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();

  return (
    <LoginPage
      error={actionData?.error}
      email={actionData?.values.email}
      rememberMe={actionData?.values.rememberMe}
      redirectTo={actionData?.values.redirectTo ?? loaderData.redirectTo}
    />
  );
}
