import { createAuthClient } from "better-auth/react";
import type { Session, User } from "./config";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL || "http://localhost:3000",
});

export const {
  signIn,
  signOut,
  signUp,
  useSession,
} = authClient;

export type { Session, User };
