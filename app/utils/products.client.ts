import type { Product, ProductDraft } from "~/Interfaces/product";
import { STORAGE_KEYS } from "~/utils/constants";
import type { TranslationKey } from "~/utils/i18n";

interface ValidationResult {
  valid: boolean;
  errors: TranslationKey[];
  data: Product[];
}

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === "object" && value !== null;
};

const toNumber = (value: unknown): number => {
  return typeof value === "number" ? value : Number(value);
};

const ensureImage = (value: unknown): string => {
  return typeof value === "string" ? value : "";
};

export const validateProductsPayload = (payload: unknown): ValidationResult => {
  if (!Array.isArray(payload)) {
    return {
      valid: false,
      errors: ["validationJsonArray"],
      data: [],
    };
  }

  const errors = new Set<TranslationKey>();
  const ids = new Set<number>();
  const parsed: Product[] = [];

  payload.forEach((item) => {
    if (!isRecord(item)) {
      errors.add("validationJsonObject");
      return;
    }

    const id = toNumber(item.id);
    const price = toNumber(item.price);
    const stock = toNumber(item.stock);
    const categoryId = toNumber(item.categoryId);
    const name = typeof item.name === "string" ? item.name.trim() : "";

    if (!Number.isInteger(id) || id <= 0) {
      errors.add("validationJsonId");
    }
    if (ids.has(id)) {
      errors.add("validationJsonDuplicateId");
    }
    ids.add(id);

    if (!name) {
      errors.add("validationJsonName");
    }

    if (!Number.isFinite(price) || price <= 0) {
      errors.add("validationJsonPrice");
    }

    if (!Number.isInteger(stock) || stock < 0) {
      errors.add("validationJsonStock");
    }

    if (!Number.isInteger(categoryId) || categoryId <= 0) {
      errors.add("validationJsonCategory");
    }

    if (item.imageUrl !== undefined && typeof item.imageUrl !== "string") {
      errors.add("validationJsonImageUrl");
    }

    parsed.push({
      id,
      name,
      description:
        typeof item.description === "string" ? item.description.trim() : "",
      price: Number(price.toFixed(2)),
      stock,
      categoryId,
      imageUrl: ensureImage(item.imageUrl),
    });
  });

  return {
    valid: errors.size === 0,
    errors: [...errors],
    data: parsed,
  };
};

const saveProducts = (products: Product[]): void => {
  window.localStorage.setItem(STORAGE_KEYS.products, JSON.stringify(products));
};

const readStoredProducts = (): Product[] | null => {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = window.localStorage.getItem(STORAGE_KEYS.products);
  if (!raw) {
    return null;
  }

  try {
    const payload: unknown = JSON.parse(raw);
    const validation = validateProductsPayload(payload);
    if (!validation.valid) {
      return null;
    }
    return validation.data;
  } catch {
    return null;
  }
};

const fetchSeedProducts = async (): Promise<Product[]> => {
  const response = await fetch("/shared/products.seed.json", {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Failed to load products seed: ${response.status}`);
  }

  const payload: unknown = await response.json();
  const validation = validateProductsPayload(payload);

  if (!validation.valid) {
    throw new Error("Invalid products seed file");
  }

  return validation.data;
};

export const ensureSeededProducts = async (): Promise<Product[]> => {
  if (typeof window === "undefined") {
    return [];
  }

  const existing = readStoredProducts();
  if (existing !== null) {
    return existing;
  }

  const seeded = await fetchSeedProducts();
  saveProducts(seeded);
  return seeded;
};

export const getProducts = (): Product[] => {
  return readStoredProducts() ?? [];
};

export const createProduct = (draft: ProductDraft): Product => {
  const products = getProducts();
  const nextId = products.reduce((max, item) => Math.max(max, item.id), 0) + 1;

  const created: Product = {
    id: nextId,
    name: draft.name.trim(),
    description: draft.description.trim(),
    price: Number(draft.price.toFixed(2)),
    stock: draft.stock,
    categoryId: draft.categoryId,
    imageUrl: draft.imageUrl.trim(),
  };

  saveProducts([...products, created]);
  return created;
};

export const updateProduct = (id: number, draft: ProductDraft): boolean => {
  const products = getProducts();
  const index = products.findIndex((item) => item.id === id);

  if (index < 0) {
    return false;
  }

  products[index] = {
    ...products[index],
    name: draft.name.trim(),
    description: draft.description.trim(),
    price: Number(draft.price.toFixed(2)),
    stock: draft.stock,
    categoryId: draft.categoryId,
    imageUrl: draft.imageUrl.trim(),
  };

  saveProducts(products);
  return true;
};

export const deleteProduct = (id: number): boolean => {
  const products = getProducts();
  const remaining = products.filter((item) => item.id !== id);
  if (remaining.length === products.length) {
    return false;
  }

  saveProducts(remaining);
  return true;
};

export const replaceProducts = (products: Product[]): void => {
  saveProducts(products);
};

export const toJsonExport = (products: Product[]): string => {
  return JSON.stringify(products, null, 2);
};
