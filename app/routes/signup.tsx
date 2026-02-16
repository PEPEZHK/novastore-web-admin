import type {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  MetaFunction,
} from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { useActionData, useLoaderData } from "@remix-run/react";
import { SignupPage } from "~/Pages/SignupPage";
import { getUser, safeRedirect, signup } from "~/utils/auth.server";
import { tFor } from "~/utils/i18n";
import { getLanguageFromRequest } from "~/utils/lang.server";

interface SignupActionData {
  error: string;
  values: {
    email: string;
    rememberMe: boolean;
    redirectTo: string;
  };
}

export const meta: MetaFunction = () => {
  return [{ title: "NovaStore Admin | Sign Up" }];
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
  const confirmPassword = String(formData.get("confirmPassword") ?? "");
  const rememberMe = formData.get("rememberMe") === "on";
  const redirectTo = safeRedirect(
    typeof formData.get("redirectTo") === "string"
      ? String(formData.get("redirectTo"))
      : null,
  );

  if (!email || !password || !confirmPassword) {
    return json<SignupActionData>(
      {
        error: tFor(lang, "signupValidation"),
        values: {
          email,
          rememberMe,
          redirectTo,
        },
      },
      { status: 400 },
    );
  }

  if (password.length < 6) {
    return json<SignupActionData>(
      {
        error: tFor(lang, "signupPasswordMin"),
        values: {
          email,
          rememberMe,
          redirectTo,
        },
      },
      { status: 400 },
    );
  }

  if (password !== confirmPassword) {
    return json<SignupActionData>(
      {
        error: tFor(lang, "signupPasswordMismatch"),
        values: {
          email,
          rememberMe,
          redirectTo,
        },
      },
      { status: 400 },
    );
  }

  const signupResult = await signup({
    request,
    email,
    password,
    rememberMe,
    redirectTo,
  });

  if (!signupResult.response) {
    return json<SignupActionData>(
      {
        error: tFor(lang, signupResult.errorKey ?? "genericError"),
        values: {
          email,
          rememberMe,
          redirectTo,
        },
      },
      { status: 400 },
    );
  }

  return signupResult.response;
};

export default function SignupRoute() {
  const loaderData = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();

  return (
    <SignupPage
      error={actionData?.error}
      email={actionData?.values.email}
      rememberMe={actionData?.values.rememberMe}
      redirectTo={actionData?.values.redirectTo ?? loaderData.redirectTo}
    />
  );
}
