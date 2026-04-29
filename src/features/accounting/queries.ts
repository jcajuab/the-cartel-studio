import { and, asc, eq, sql } from "drizzle-orm";
import { cache } from "react";
import { db } from "@/lib/db";
import { accounts, journalEntries, transactions } from "@/lib/db/schema";

export interface AccountWithBalance {
  id: string;
  code: string;
  name: string;
  type: "Asset" | "Liability" | "Equity" | "Revenue" | "Expense";
  // Raw debit - credit. For Asset/Expense this is naturally positive when healthy.
  // For Liability/Equity/Revenue negate for display (credits accumulate, so raw is negative).
  balance: number;
}

export const getAccounts = cache(async function getAccounts(): Promise<
  AccountWithBalance[]
> {
  const rows = await db
    .select({
      id: accounts.id,
      code: accounts.code,
      name: accounts.name,
      type: accounts.type,
      balance:
        sql<number>`coalesce(sum(${journalEntries.debit}), 0) - coalesce(sum(${journalEntries.credit}), 0)`.mapWith(
          Number,
        ),
    })
    .from(accounts)
    .leftJoin(journalEntries, eq(journalEntries.accountId, accounts.id))
    .groupBy(accounts.id, accounts.code, accounts.name, accounts.type)
    .orderBy(asc(accounts.code));

  return rows as AccountWithBalance[];
});

export interface LedgerEntry {
  id: string;
  postedAt: Date;
  debit: number;
  credit: number;
  isReversal: boolean;
  runningBalance: number; // cumulative debit - credit at this row in posting order
  transactionId: string;
  transactionStatus: "COMPLETED" | "VOIDED";
}

export const getAccountLedger = cache(async function getAccountLedger(
  accountId: string,
): Promise<{ account: AccountWithBalance; entries: LedgerEntry[] } | null> {
  // Fetch the one account with its aggregate balance
  const [account] = await db
    .select({
      id: accounts.id,
      code: accounts.code,
      name: accounts.name,
      type: accounts.type,
      balance:
        sql<number>`coalesce(sum(${journalEntries.debit}), 0) - coalesce(sum(${journalEntries.credit}), 0)`.mapWith(
          Number,
        ),
    })
    .from(accounts)
    .leftJoin(journalEntries, eq(journalEntries.accountId, accounts.id))
    .where(eq(accounts.id, accountId))
    .groupBy(accounts.id, accounts.code, accounts.name, accounts.type);

  if (!account) return null;

  // Fetch entries for this account ordered by postedAt ASC for running balance
  const rawEntries = await db
    .select({
      id: journalEntries.id,
      postedAt: journalEntries.postedAt,
      debit: journalEntries.debit,
      credit: journalEntries.credit,
      isReversal: journalEntries.isReversal,
      transactionId: journalEntries.transactionId,
      transactionStatus: transactions.status,
    })
    .from(journalEntries)
    .innerJoin(transactions, eq(journalEntries.transactionId, transactions.id))
    .where(eq(journalEntries.accountId, accountId))
    .orderBy(asc(journalEntries.postedAt));

  // Compute running balance in JS
  let cumulative = 0;
  const entries: LedgerEntry[] = rawEntries.map((row) => {
    cumulative += row.debit - row.credit;
    return {
      id: row.id,
      postedAt: row.postedAt ?? new Date(),
      debit: row.debit,
      credit: row.credit,
      isReversal: row.isReversal,
      runningBalance: cumulative,
      transactionId: row.transactionId,
      transactionStatus: row.transactionStatus as "COMPLETED" | "VOIDED",
    };
  });

  return { account: account as AccountWithBalance, entries };
});

export interface JournalEntryRow {
  id: string;
  postedAt: Date;
  accountName: string;
  accountType: string;
  accountCode: string;
  debit: number;
  credit: number;
  isReversal: boolean;
  transactionId: string;
  transactionStatus: "COMPLETED" | "VOIDED";
}

export const getJournalEntries = cache(
  async function getJournalEntries(filters?: {
    isReversal?: boolean;
    transactionStatus?: "COMPLETED" | "VOIDED";
  }): Promise<JournalEntryRow[]> {
    const query = db
      .select({
        id: journalEntries.id,
        postedAt: journalEntries.postedAt,
        accountName: accounts.name,
        accountType: accounts.type,
        accountCode: accounts.code,
        debit: journalEntries.debit,
        credit: journalEntries.credit,
        isReversal: journalEntries.isReversal,
        transactionId: journalEntries.transactionId,
        transactionStatus: transactions.status,
      })
      .from(journalEntries)
      .innerJoin(accounts, eq(journalEntries.accountId, accounts.id))
      .innerJoin(
        transactions,
        eq(journalEntries.transactionId, transactions.id),
      );

    const conditions = [];

    if (filters?.isReversal !== undefined) {
      conditions.push(eq(journalEntries.isReversal, filters.isReversal));
    }
    if (filters?.transactionStatus) {
      conditions.push(eq(transactions.status, filters.transactionStatus));
    }

    const rows = await query
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(sql`${journalEntries.postedAt} desc`);

    return rows.map((r) => ({
      ...r,
      postedAt: r.postedAt ?? new Date(),
      transactionStatus: r.transactionStatus as "COMPLETED" | "VOIDED",
    }));
  },
);

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
