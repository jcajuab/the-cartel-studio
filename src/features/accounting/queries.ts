import { sql } from "drizzle-orm";
import { cache } from "react";
import { db } from "@/lib/db";
import { journalEntries } from "@/lib/db/schema";

export const getBalanceCheck = cache(async function getBalanceCheck(): Promise<{
  balanced: boolean;
  diff: number;
}> {
  const [row] = await db
    .select({
      diff: sql<number>`coalesce(sum(${journalEntries.debit}), 0) - coalesce(sum(${journalEntries.credit}), 0)`.mapWith(
        Number,
      ),
    })
    .from(journalEntries);

  const diff = row?.diff ?? 0;
  return { balanced: diff === 0, diff };
});
