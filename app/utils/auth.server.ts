import { createHash } from "node:crypto";
import { redirect } from "@remix-run/node";
import type { SessionUser, StoredViewerUser, UserRole } from "~/Interfaces/auth";
import type { TranslationKey } from "~/utils/i18n";
import { tFor } from "~/utils/i18n";
import { getLanguageFromRequest } from "~/utils/lang.server";
import {
  commitSession,
  destroySession,
  getSession,
  usersCookie,
} from "~/utils/session.server";

const USER_SESSION_KEY = "user";
const ONE_WEEK_IN_SECONDS = 60 * 60 * 24 * 7;
const PASSWORD_PEPPER =
  process.env.SESSION_SECRET;

interface RequireUserOptions {
  role?: UserRole;
}

interface LoginArgs {
  request: Request;
  email: string;
  password: string;
  rememberMe: boolean;
  redirectTo?: string | null;
}

interface SignupArgs {
  request: Request;
  email: string;
  password: string;
  rememberMe: boolean;
  redirectTo?: string | null;
}

interface SignupResult {
  response: Response | null;
  errorKey?: TranslationKey;
}

interface SessionResponseArgs {
  request: Request;
  user: SessionUser;
  rememberMe: boolean;
  redirectTo?: string | null;
  headers?: HeadersInit;
}

const isSessionUser = (value: unknown): value is SessionUser => {
  if (!value || typeof value !== "object") {
    return false;
  }

  const user = value as Record<string, unknown>;
  return (
    typeof user.userId === "string" &&
    typeof user.email === "string" &&
    (user.role === "admin" || user.role === "viewer")
  );
};

const isStoredViewerUser = (value: unknown): value is StoredViewerUser => {
  if (!value || typeof value !== "object") {
    return false;
  }

  const user = value as Record<string, unknown>;
  return (
    typeof user.userId === "string" &&
    typeof user.email === "string" &&
    typeof user.passwordHash === "string" &&
    user.role === "viewer" &&
    typeof user.createdAt === "string"
  );
};

const normalizeEmail = (email: string): string => email.trim().toLowerCase();

const hashPassword = (email: string, password: string): string => {
  return createHash("sha256")
    .update(`${PASSWORD_PEPPER}:${email}:${password}`)
    .digest("hex");
};

const parseStoredViewerUsers = async (
  cookieHeader: string | null,
): Promise<StoredViewerUser[]> => {
  const parsed = await usersCookie.parse(cookieHeader);

  if (!Array.isArray(parsed)) {
    return [];
  }

  return parsed.filter(isStoredViewerUser);
};

const getAdminCredentials = () => {
  const email =
    (process.env.ADMIN_EMAIL ?? "admin@novastore.com").trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD ?? "admin123";

  return { email, password };
};

const createSessionResponse = async ({
  request,
  user,
  rememberMe,
  redirectTo,
  headers,
}: SessionResponseArgs): Promise<Response> => {
  const session = await getSession(request.headers.get("Cookie"));
  session.set(USER_SESSION_KEY, user);

  const responseHeaders = new Headers(headers);
  responseHeaders.append(
    "Set-Cookie",
    await commitSession(session, {
      maxAge: rememberMe ? ONE_WEEK_IN_SECONDS : undefined,
    }),
  );

  return redirect(safeRedirect(redirectTo, "/dashboard"), {
    headers: responseHeaders,
  });
};

export const safeRedirect = (
  to: string | null | undefined,
  defaultRedirect = "/dashboard",
): string => {
  if (!to || typeof to !== "string") {
    return defaultRedirect;
  }

  if (!to.startsWith("/") || to.startsWith("//")) {
    return defaultRedirect;
  }

  return to;
};

const getRedirectTargetFromRequest = (request: Request): string => {
  const url = new URL(request.url);
  return `${url.pathname}${url.search}`;
};

export const getUser = async (request: Request): Promise<SessionUser | null> => {
  const session = await getSession(request.headers.get("Cookie"));
  const user = session.get(USER_SESSION_KEY);

  if (!isSessionUser(user)) {
    return null;
  }

  return user;
};

export const requireUser = async (
  request: Request,
  options: RequireUserOptions = {},
): Promise<SessionUser> => {
  const user = await getUser(request);

  if (!user) {
    const redirectTo = getRedirectTargetFromRequest(request);
    throw redirect(`/login?redirectTo=${encodeURIComponent(redirectTo)}`);
  }

  if (options.role && user.role !== options.role) {
    const lang = getLanguageFromRequest(request);
    throw new Response(tFor(lang, "authNotAuthorized"), { status: 403 });
  }

  return user;
};

export const login = async ({
  request,
  email,
  password,
  rememberMe,
  redirectTo,
}: LoginArgs): Promise<Response | null> => {
  const { email: adminEmail, password: adminPassword } = getAdminCredentials();
  const normalizedEmail = normalizeEmail(email);

  if (normalizedEmail === adminEmail && password === adminPassword) {
    return createSessionResponse({
      request,
      rememberMe,
      redirectTo,
      user: {
        userId: "admin",
        email: adminEmail,
        role: "admin",
      },
    });
  }

  const users = await parseStoredViewerUsers(request.headers.get("Cookie"));
  const viewerUser = users.find((user) => user.email === normalizedEmail);

  if (!viewerUser) {
    return null;
  }

  const expectedHash = hashPassword(normalizedEmail, password);
  if (viewerUser.passwordHash !== expectedHash) {
    return null;
  }

  return createSessionResponse({
    request,
    rememberMe,
    redirectTo,
    user: {
      userId: viewerUser.userId,
      email: viewerUser.email,
      role: "viewer",
    },
  });
};

export const signup = async ({
  request,
  email,
  password,
  rememberMe,
  redirectTo,
}: SignupArgs): Promise<SignupResult> => {
  const normalizedEmail = normalizeEmail(email);
  const { email: adminEmail } = getAdminCredentials();

  if (normalizedEmail === adminEmail) {
    return {
      response: null,
      errorKey: "signupReservedEmail",
    };
  }

  const users = await parseStoredViewerUsers(request.headers.get("Cookie"));
  const alreadyExists = users.some((user) => user.email === normalizedEmail);

  if (alreadyExists) {
    return {
      response: null,
      errorKey: "signupEmailExists",
    };
  }

  const createdUser: StoredViewerUser = {
    userId: `viewer-${Date.now()}`,
    email: normalizedEmail,
    passwordHash: hashPassword(normalizedEmail, password),
    role: "viewer",
    createdAt: new Date().toISOString(),
  };

  const nextUsers = [...users, createdUser];
  const headers = new Headers();
  headers.append("Set-Cookie", await usersCookie.serialize(nextUsers));

  return {
    response: await createSessionResponse({
      request,
      rememberMe,
      redirectTo,
      headers,
      user: {
        userId: createdUser.userId,
        email: createdUser.email,
        role: "viewer",
      },
    }),
  };
};

export const logout = async (request: Request): Promise<Response> => {
  const session = await getSession(request.headers.get("Cookie"));

  // CSRF note: login/logout use Remix <Form method="post"> + SameSite=Lax.
  return redirect("/login", {
    headers: {
      "Set-Cookie": await destroySession(session),
    },
  });
};
