import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

declare global {
  // eslint-disable-next-line no-var
  var __cartPg: ReturnType<typeof postgres> | undefined;
}

const queryClient = global.__cartPg ?? postgres(process.env.DATABASE_URL ?? "");
if (process.env.NODE_ENV !== "production") {
  global.__cartPg = queryClient;
}

export const db = drizzle(queryClient, { schema });
