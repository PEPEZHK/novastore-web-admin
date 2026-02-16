export type UserRole = "admin" | "viewer";

export interface SessionUser {
  userId: string;
  email: string;
  role: UserRole;
}

export interface StoredViewerUser {
  userId: string;
  email: string;
  passwordHash: string;
  role: "viewer";
  createdAt: string;
}
