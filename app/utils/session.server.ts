import { createCookie, createCookieSessionStorage } from "@remix-run/node";
import type { SessionUser } from "~/Interfaces/auth";

interface SessionData {
  user: SessionUser;
}

interface SessionFlashData {
  error: string;
}

const devSecret = "novastore-dev-session-secret-change-me";
const sessionSecret = process.env.SESSION_SECRET ?? devSecret;
const THIRTY_DAYS_IN_SECONDS = 60 * 60 * 24 * 30;

export const sessionStorage = createCookieSessionStorage<
  SessionData,
  SessionFlashData
>({
  cookie: {
    name: "__novastore_session",
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    secrets: [sessionSecret],
  },
});

export const usersCookie = createCookie("__novastore_users", {
  httpOnly: true,
  path: "/",
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production",
  secrets: [sessionSecret],
  maxAge: THIRTY_DAYS_IN_SECONDS,
});

export const { getSession, commitSession, destroySession } = sessionStorage;
