import { auth } from "@/lib/auth/config";
import { toNextJsHandler } from "better-auth/next-js";

// Force Node.js runtime to support Prisma
export const runtime = "nodejs";

export const { GET, POST } = toNextJsHandler(auth);
