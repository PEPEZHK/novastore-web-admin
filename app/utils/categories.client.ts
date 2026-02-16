import type { Category } from "~/Interfaces/product";
import { STORAGE_KEYS } from "~/utils/constants";

export interface CreateCategoryResult {
  category: Category;
  created: boolean;
}

const isCategory = (value: unknown): value is Category => {
  if (!value || typeof value !== "object") {
    return false;
  }

  const item = value as Record<string, unknown>;
  return (
    typeof item.id === "number" &&
    Number.isInteger(item.id) &&
    item.id > 0 &&
    typeof item.name === "string" &&
    item.name.trim().length > 0
  );
};

const saveCategories = (categories: Category[]): void => {
  window.localStorage.setItem(STORAGE_KEYS.categories, JSON.stringify(categories));
};

const readStoredCategories = (): Category[] | null => {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = window.localStorage.getItem(STORAGE_KEYS.categories);
  if (!raw) {
    return null;
  }

  try {
    const payload: unknown = JSON.parse(raw);
    if (!Array.isArray(payload) || !payload.every(isCategory)) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
};

const fetchSeedCategories = async (): Promise<Category[]> => {
  const response = await fetch("/shared/categories.seed.json", {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Failed to load categories: ${response.status}`);
  }

  const payload: unknown = await response.json();
  if (!Array.isArray(payload) || !payload.every(isCategory)) {
    throw new Error("Invalid categories seed file");
  }

  return payload;
};

export const ensureSeededCategories = async (): Promise<Category[]> => {
  if (typeof window === "undefined") {
    return [];
  }

  const stored = readStoredCategories();
  if (stored !== null) {
    return stored;
  }

  const seeded = await fetchSeedCategories();
  saveCategories(seeded);
  return seeded;
};

export const loadCategories = async (): Promise<Category[]> => {
  return ensureSeededCategories();
};

export const createCategory = (name: string): CreateCategoryResult | null => {
  if (typeof window === "undefined") {
    return null;
  }

  const trimmedName = name.trim();
  if (!trimmedName) {
    return null;
  }

  const categories = readStoredCategories() ?? [];
  const existing = categories.find(
    (category) => category.name.toLowerCase() === trimmedName.toLowerCase(),
  );

  if (existing) {
    return {
      category: existing,
      created: false,
    };
  }

  const nextId = categories.reduce((max, category) => Math.max(max, category.id), 0) + 1;
  const createdCategory: Category = {
    id: nextId,
    name: trimmedName,
  };

  saveCategories([...categories, createdCategory]);

  return {
    category: createdCategory,
    created: true,
  };
};
