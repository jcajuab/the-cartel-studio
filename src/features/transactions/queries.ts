import { and, asc, desc, eq, gte, lte } from "drizzle-orm";
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
  dateFrom?: Date;
  dateTo?: Date;
}

export const getTransactions = cache(function getTransactions(
  filters: TransactionFilters = {},
) {
  const conditions = [];

  if (filters.status) {
    conditions.push(eq(transactions.status, filters.status));
  }
  if (filters.categoryId) {
    conditions.push(eq(transactions.categoryId, filters.categoryId));
  }
  if (filters.dateFrom) {
    conditions.push(gte(transactions.createdAt, filters.dateFrom));
  }
  if (filters.dateTo) {
    conditions.push(lte(transactions.createdAt, filters.dateTo));
  }

  return db
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
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(transactions.createdAt));
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
