import { eq, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  accounts,
  categories,
  journalEntries,
  transactions,
} from "@/lib/db/schema";

export interface CategoryMetric {
  categoryId: string;
  categoryName: string;
  accountId: string;
  accountCode: string;
  total: number;
  transactionCount: number;
}

export async function getTotalRevenue(): Promise<number> {
  // Net revenue = SUM(credit) - SUM(debit) on the Sales Revenue account (code 4000).
  // Void reversals debit Sales Revenue, reducing the net accordingly.
  const [row] = await db
    .select({
      revenue:
        sql<number>`coalesce(sum(${journalEntries.credit}), 0) - coalesce(sum(${journalEntries.debit}), 0)`.mapWith(
          Number,
        ),
    })
    .from(journalEntries)
    .innerJoin(accounts, eq(journalEntries.accountId, accounts.id))
    .where(eq(accounts.code, "4000"));

  return row?.revenue ?? 0;
}

export async function getCategoryDistribution(): Promise<CategoryMetric[]> {
  // For each category, find its coaAssetAccount and sum debit - credit on that account.
  // Net is positive when debit-heavy (cash flowing into the asset account).
  // Void reversal entries credit the asset back, reducing the net.
  // All categories are included (even those with no entries, via LEFT JOIN, returning 0).
  const rows = await db
    .select({
      categoryId: categories.id,
      categoryName: categories.name,
      accountId: accounts.id,
      accountCode: accounts.code,
      total:
        sql<number>`coalesce(sum(${journalEntries.debit}), 0) - coalesce(sum(${journalEntries.credit}), 0)`.mapWith(
          Number,
        ),
      transactionCount: sql<number>`count(distinct ${transactions.id})`.mapWith(
        Number,
      ),
    })
    .from(categories)
    .innerJoin(accounts, eq(categories.coaAssetAccountId, accounts.id))
    .leftJoin(journalEntries, eq(journalEntries.accountId, accounts.id))
    .leftJoin(transactions, eq(journalEntries.transactionId, transactions.id))
    .groupBy(categories.id, categories.name, accounts.id, accounts.code)
    .orderBy(
      sql`coalesce(sum(${journalEntries.debit}), 0) - coalesce(sum(${journalEntries.credit}), 0) desc`,
    );

  return rows;
}

export interface TransactionCounts {
  completed: number;
  voided: number;
}

export async function getTransactionCounts(): Promise<TransactionCounts> {
  const rows = await db
    .select({
      status: transactions.status,
      count: sql<number>`count(*)`.mapWith(Number),
    })
    .from(transactions)
    .groupBy(transactions.status);

  let completed = 0;
  let voided = 0;
  for (const row of rows) {
    if (row.status === "COMPLETED") completed = row.count;
    else if (row.status === "VOIDED") voided = row.count;
  }
  return { completed, voided };
}
