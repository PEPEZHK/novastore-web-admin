export interface Category {
  id: number;
  name: string;
}

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  categoryId: number;
  imageUrl: string;
}

export interface ProductDraft {
  name: string;
  description: string;
  price: number;
  stock: number;
  categoryId: number;
  imageUrl: string;
}

export type ThemeMode = "light" | "dark" | "system";
export type Language = "en" | "tr";
export type SortBy =
  | "name-asc"
  | "price-asc"
  | "price-desc"
  | "stock-asc"
  | "stock-desc";
