import type { SessionUser } from "~/Interfaces/auth";
import { STORAGE_KEYS } from "~/utils/constants";

export interface ProfileSettings {
  fullName: string;
  profileEmail: string;
  phone: string;
  city: string;
  company: string;
  bio: string;
  receiveOrderAlerts: boolean;
  receiveMarketingEmails: boolean;
}

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === "object" && value !== null;
};

const defaultsFromUser = (user: SessionUser | null): ProfileSettings => {
  const email = user?.email ?? "";

  return {
    fullName: "",
    profileEmail: email,
    phone: "",
    city: "",
    company: "",
    bio: "",
    receiveOrderAlerts: true,
    receiveMarketingEmails: false,
  };
};

export const loadProfileSettings = (user: SessionUser | null): ProfileSettings => {
  const defaults = defaultsFromUser(user);

  if (typeof window === "undefined") {
    return defaults;
  }

  const raw = window.localStorage.getItem(STORAGE_KEYS.profile);
  if (!raw) {
    return defaults;
  }

  try {
    const payload: unknown = JSON.parse(raw);
    if (!isRecord(payload)) {
      return defaults;
    }

    return {
      fullName:
        typeof payload.fullName === "string" ? payload.fullName : defaults.fullName,
      profileEmail:
        typeof payload.profileEmail === "string"
          ? payload.profileEmail
          : defaults.profileEmail,
      phone: typeof payload.phone === "string" ? payload.phone : defaults.phone,
      city: typeof payload.city === "string" ? payload.city : defaults.city,
      company:
        typeof payload.company === "string" ? payload.company : defaults.company,
      bio: typeof payload.bio === "string" ? payload.bio : defaults.bio,
      receiveOrderAlerts:
        typeof payload.receiveOrderAlerts === "boolean"
          ? payload.receiveOrderAlerts
          : defaults.receiveOrderAlerts,
      receiveMarketingEmails:
        typeof payload.receiveMarketingEmails === "boolean"
          ? payload.receiveMarketingEmails
          : defaults.receiveMarketingEmails,
    };
  } catch {
    return defaults;
  }
};

export const saveProfileSettings = (settings: ProfileSettings): void => {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(STORAGE_KEYS.profile, JSON.stringify(settings));
};
