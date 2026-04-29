import {
  and,
  asc,
  countDistinct,
  desc,
  eq,
  gte,
  lt,
  lte,
  sql,
} from "drizzle-orm";
import { cache } from "react";
import { db } from "@/lib/db";
import {
  accounts,
  categories,
  journalEntries,
  products,
  transactionItems,
  transactions,
} from "@/lib/db/schema";

export interface TransactionFilters {
  status?: "COMPLETED" | "VOIDED";
  categoryId?: string;
  month?: string;
  q?: string;
  dateFrom?: Date;
  dateTo?: Date;
  page?: number;
  pageSize?: number;
}

export interface TransactionSummary {
  netSales: number;
  completedCount: number;
  voidedAmount: number;
  averageTicket: number;
}

export interface TransactionListRow {
  id: string;
  status: "COMPLETED" | "VOIDED";
  total: number;
  createdAt: Date | null;
  voidedAt: Date | null;
  voidReason: string | null;
  voidedByRole: string | null;
  categoryName: string;
  categoryId: string;
  itemCount: number;
}

export function getCurrentMonthKey(date = new Date()): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

export function getMonthRange(month?: string): { from: Date; to: Date } {
  const key =
    month && /^\d{4}-\d{2}$/.test(month) ? month : getCurrentMonthKey();
  const [year = "0", monthNumber = "1"] = key.split("-");
  const from = new Date(Number(year), Number(monthNumber) - 1, 1);
  const to = new Date(Number(year), Number(monthNumber), 1);

  return { from, to };
}

function buildTransactionConditions(filters: TransactionFilters) {
  const conditions = [];
  const range = filters.month ? getMonthRange(filters.month) : null;

  if (filters.status) {
    conditions.push(eq(transactions.status, filters.status));
  }
  if (filters.categoryId) {
    conditions.push(eq(transactions.categoryId, filters.categoryId));
  }
  if (filters.q) {
    conditions.push(sql`${transactions.id}::text ilike ${`%${filters.q}%`}`);
  }
  if (range) {
    conditions.push(gte(transactions.createdAt, range.from));
    conditions.push(lt(transactions.createdAt, range.to));
  }
  if (filters.dateFrom) {
    conditions.push(gte(transactions.createdAt, filters.dateFrom));
  }
  if (filters.dateTo) {
    conditions.push(lte(transactions.createdAt, filters.dateTo));
  }

  return conditions;
}

export const getTransactions = cache(function getTransactions(
  filters: TransactionFilters = {},
): Promise<TransactionListRow[]> {
  const conditions = buildTransactionConditions(filters);
  const pageSize = filters.pageSize;
  const page = filters.page ?? 1;
  const offset = pageSize ? (page - 1) * pageSize : 0;

  const query = db
    .select({
      id: transactions.id,
      status: transactions.status,
      total: transactions.total,
      createdAt: transactions.createdAt,
      voidedAt: transactions.voidedAt,
      voidReason: transactions.voidReason,
      voidedByRole: transactions.voidedByRole,
      categoryName: categories.name,
      categoryId: categories.id,
      itemCount: sql<number>`coalesce(sum(${transactionItems.qty}), 0)`.mapWith(
        Number,
      ),
    })
    .from(transactions)
    .innerJoin(categories, eq(transactions.categoryId, categories.id))
    .leftJoin(
      transactionItems,
      eq(transactionItems.transactionId, transactions.id),
    )
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .groupBy(transactions.id, categories.id, categories.name)
    .orderBy(desc(transactions.createdAt));

  if (!pageSize) return query;

  return query.limit(pageSize).offset(offset);
});

export const getTransactionCount = cache(async function getTransactionCount(
  filters: TransactionFilters = {},
): Promise<number> {
  const conditions = buildTransactionConditions(filters);
  const [row] = await db
    .select({
      count: countDistinct(transactions.id).mapWith(Number),
    })
    .from(transactions)
    .innerJoin(categories, eq(transactions.categoryId, categories.id))
    .where(conditions.length > 0 ? and(...conditions) : undefined);

  return row?.count ?? 0;
});

export const getTransactionSummary = cache(async function getTransactionSummary(
  filters: TransactionFilters = {},
): Promise<TransactionSummary> {
  const conditions = buildTransactionConditions(filters);
  const [row] = await db
    .select({
      netSales:
        sql<number>`coalesce(sum(case when ${transactions.status} = 'COMPLETED' then ${transactions.total} else 0 end), 0)`.mapWith(
          Number,
        ),
      completedCount:
        sql<number>`count(*) filter (where ${transactions.status} = 'COMPLETED')`.mapWith(
          Number,
        ),
      voidedAmount:
        sql<number>`coalesce(sum(case when ${transactions.status} = 'VOIDED' then ${transactions.total} else 0 end), 0)`.mapWith(
          Number,
        ),
    })
    .from(transactions)
    .innerJoin(categories, eq(transactions.categoryId, categories.id))
    .where(conditions.length > 0 ? and(...conditions) : undefined);

  const netSales = row?.netSales ?? 0;
  const completedCount = row?.completedCount ?? 0;

  return {
    netSales,
    completedCount,
    voidedAmount: row?.voidedAmount ?? 0,
    averageTicket:
      completedCount > 0 ? Math.round(netSales / completedCount) : 0,
  };
});

export const getTransactionDetail = cache(async function getTransactionDetail(
  id: string,
) {
  const [tx] = await db
    .select({
      id: transactions.id,
      status: transactions.status,
      total: transactions.total,
      createdAt: transactions.createdAt,
      voidedAt: transactions.voidedAt,
      voidReason: transactions.voidReason,
      voidedByRole: transactions.voidedByRole,
      categoryName: categories.name,
      categoryId: categories.id,
    })
    .from(transactions)
    .innerJoin(categories, eq(transactions.categoryId, categories.id))
    .where(eq(transactions.id, id));

  if (!tx) return null;

  const rawItems = await db
    .select({
      qty: transactionItems.qty,
      unitPrice: transactionItems.unitPrice,
      productName: products.name,
    })
    .from(transactionItems)
    .innerJoin(products, eq(transactionItems.productId, products.id))
    .where(eq(transactionItems.transactionId, id));

  const items = rawItems.map((item) => ({
    ...item,
    lineTotal: item.qty * item.unitPrice,
  }));

  const entries = await db
    .select({
      id: journalEntries.id,
      debit: journalEntries.debit,
      credit: journalEntries.credit,
      isReversal: journalEntries.isReversal,
      postedAt: journalEntries.postedAt,
      accountName: accounts.name,
      accountType: accounts.type,
    })
    .from(journalEntries)
    .leftJoin(accounts, eq(journalEntries.accountId, accounts.id))
    .where(eq(journalEntries.transactionId, id))
    .orderBy(asc(journalEntries.postedAt), asc(journalEntries.isReversal));

  return { transaction: tx, items, entries };
});
